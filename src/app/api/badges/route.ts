import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer tous les badges ou les badges de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');

    // Si userId est spécifié, retourner les badges de cet utilisateur
    if (userId) {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId },
        include: {
          badge: true
        },
        orderBy: { earnedAt: 'desc' }
      });

      return NextResponse.json({ badges: userBadges });
    }

    // Sinon, retourner tous les badges disponibles
    const where = category ? { category } : {};
    const badges = await prisma.badge.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }
}

// POST - Créer un nouveau badge (admin uniquement) ou attribuer un badge
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isAdmin: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();

    // Créer un nouveau badge (admin uniquement)
    if (body.action === 'create') {
      // Vérifier si l'utilisateur est admin (Ønyx)
      const isOnyx = user.email === 'noe.barneron@gmail.com';
      if (!user.isAdmin && !isOnyx) {
        return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
      }

      const { name, description, icon, category, color, requirement } = body;

      const badge = await prisma.badge.create({
        data: {
          name,
          description,
          icon,
          category: category || 'custom',
          color: color || '#FFD700',
          requirement,
          isCustom: true,
          createdById: user.id
        }
      });

      return NextResponse.json({ success: true, badge });
    }

    // Attribuer un badge à un utilisateur
    if (body.action === 'award') {
      const isOnyx = user.email === 'noe.barneron@gmail.com';
      if (!user.isAdmin && !isOnyx) {
        return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
      }

      const { badgeId, targetUserId } = body;

      // Vérifier si le badge existe
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId }
      });

      if (!badge) {
        return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
      }

      // Vérifier si l'utilisateur existe
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId }
      });

      if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
      }

      // Vérifier si l'utilisateur a déjà ce badge
      const existing = await prisma.userBadge.findFirst({
        where: { userId: targetUserId, badgeId }
      });

      if (existing) {
        return NextResponse.json({ error: 'User already has this badge' }, { status: 400 });
      }

      // Attribuer le badge
      const userBadge = await prisma.userBadge.create({
        data: {
          userId: targetUserId,
          badgeId,
          awardedById: user.id
        },
        include: { badge: true }
      });

      return NextResponse.json({ success: true, userBadge });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error with badges:', error);
    return NextResponse.json({ error: 'Failed to process badge request' }, { status: 500 });
  }
}

// PUT - Mettre à jour les badges sélectionnés sur la bannière
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { selectedBadgeIds, bannerUrl } = await req.json();

    // Vérifier que l'utilisateur possède les badges sélectionnés
    if (selectedBadgeIds && selectedBadgeIds.length > 0) {
      const userBadges = await prisma.userBadge.findMany({
        where: {
          userId: user.id,
          badgeId: { in: selectedBadgeIds }
        }
      });

      const ownedBadgeIds = userBadges.map(ub => ub.badgeId);
      const invalidBadges = selectedBadgeIds.filter((id: string) => !ownedBadgeIds.includes(id));

      if (invalidBadges.length > 0) {
        return NextResponse.json({ 
          error: 'Cannot select badges you do not own',
          invalidBadges 
        }, { status: 400 });
      }

      if (selectedBadgeIds.length > 3) {
        return NextResponse.json({ error: 'Maximum 3 badges allowed' }, { status: 400 });
      }
    }

    // Mettre à jour le profil
    const updateData: Record<string, string | undefined> = {};
    if (selectedBadgeIds !== undefined) {
      updateData.selectedBadgeIds = JSON.stringify(selectedBadgeIds);
    }
    if (bannerUrl !== undefined) {
      updateData.bannerUrl = bannerUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        bannerUrl: true,
        selectedBadgeIds: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        ...updatedUser,
        selectedBadgeIds: updatedUser.selectedBadgeIds ? JSON.parse(updatedUser.selectedBadgeIds) : []
      }
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

// DELETE - Supprimer un badge (admin uniquement)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isAdmin: true, email: true }
    });

    const isOnyx = user?.email === 'noe.barneron@gmail.com';
    if (!user?.isAdmin && !isOnyx) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const badgeId = searchParams.get('badgeId');

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID required' }, { status: 400 });
    }

    await prisma.badge.delete({
      where: { id: badgeId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json({ error: 'Failed to delete badge' }, { status: 500 });
  }
}
