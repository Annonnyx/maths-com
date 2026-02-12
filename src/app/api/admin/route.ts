import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { Session } from 'next-auth';

// Vérifier si l'utilisateur est Ønyx (admin spécial)
async function isOnyxAdmin(session: Session | null): Promise<boolean> {
  console.log('Checking admin auth, session:', session?.user?.email);
  if (!session?.user?.email) {
    console.log('No session or email');
    return false;
  }
  const isAdmin = session.user.email === 'noe.barneron@gmail.com';
  console.log('Is admin:', isAdmin);
  return isAdmin;
}

// GET - Récupérer les infos admin
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(await isOnyxAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'users') {
      // Liste des utilisateurs pour attribution de badges
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          elo: true,
          rankClass: true,
          multiplayerElo: true,
          multiplayerRankClass: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });
      return NextResponse.json({ users });
    }

    if (action === 'my-elo') {
      // Récupérer son propre Elo
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          elo: true,
          rankClass: true,
          multiplayerElo: true,
          multiplayerRankClass: true,
          bestElo: true,
          bestRankClass: true,
          bestMultiplayerElo: true,
          bestMultiplayerRankClass: true
        }
      });
      return NextResponse.json({ user });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in admin API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Actions admin
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(await isOnyxAdmin(session))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // Modifier son propre Elo
    if (action === 'update-my-elo') {
      const { 
        elo, 
        multiplayerElo, 
        rankClass, 
        multiplayerRankClass,
        bestElo,
        bestRankClass,
        bestMultiplayerElo,
        bestMultiplayerRankClass
      } = body;

      const updateData: Record<string, string | number> = {};
      
      if (elo !== undefined) updateData.elo = parseInt(elo);
      if (multiplayerElo !== undefined) updateData.multiplayerElo = parseInt(multiplayerElo);
      if (rankClass) updateData.rankClass = rankClass;
      if (multiplayerRankClass) updateData.multiplayerRankClass = multiplayerRankClass;
      if (bestElo !== undefined) updateData.bestElo = parseInt(bestElo);
      if (bestRankClass) updateData.bestRankClass = bestRankClass;
      if (bestMultiplayerElo !== undefined) updateData.bestMultiplayerElo = parseInt(bestMultiplayerElo);
      if (bestMultiplayerRankClass) updateData.bestMultiplayerRankClass = bestMultiplayerRankClass;

      const user = await prisma.user.update({
        where: { email: session!.user.email },
        data: updateData,
        select: {
          id: true,
          elo: true,
          rankClass: true,
          multiplayerElo: true,
          multiplayerRankClass: true
        }
      });

      return NextResponse.json({ success: true, user });
    }

    // Créer un badge
    if (action === 'create-badge') {
      const { name, description, icon, category, color, requirement } = body;

      const user = await prisma.user.findUnique({
        where: { email: session!.user.email },
        select: { id: true }
      });

      const badge = await prisma.badge.create({
        data: {
          name,
          description,
          icon,
          category: category || 'custom',
          color: color || '#FFD700',
          requirement,
          isCustom: true,
          createdById: user?.id
        }
      });

      return NextResponse.json({ success: true, badge });
    }

    // Attribuer un badge
    if (action === 'award-badge') {
      const { badgeId, userId } = body;

      // Vérifier si déjà possédé
      const existing = await prisma.userBadge.findFirst({
        where: { userId, badgeId }
      });

      if (existing) {
        return NextResponse.json({ error: 'User already has this badge' }, { status: 400 });
      }

      const admin = await prisma.user.findUnique({
        where: { email: session!.user.email },
        select: { id: true }
      });

      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
          awardedById: admin?.id
        },
        include: { badge: true }
      });

      return NextResponse.json({ success: true, userBadge });
    }

    // Supprimer un badge
    if (action === 'delete-badge') {
      const { badgeId } = body;

      await prisma.badge.delete({
        where: { id: badgeId }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in admin API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
