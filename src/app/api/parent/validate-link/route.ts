import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session.user as any).role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized - Parent account required' }, { status: 401 });
    }

    const { code } = await request.json();
    
    if (!code || typeof code !== 'string' || code.length !== 8) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    // Trouver le code d'invitation
    const inviteCode = await prisma.parentInviteCode.findFirst({
      where: {
        code: code.toUpperCase(),
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        child: true
      }
    });

    if (!inviteCode) {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 404 });
    }

    // Les parents peuvent voir leurs enfants liés
    if ((session.user as any).role === 'parent') {
      const link = await prisma.parentChildLink.findFirst({
        where: {
          parentId: (session.user as any).id,
          childId: inviteCode.childId,
          isActive: true
        }
      });
      if (link) {
        return NextResponse.json({ 
          error: 'Vous êtes déjà lié à cet élève' 
        }, { status: 409 });
      }
    }

    // Créer le lien parent-enfant
    await prisma.parentChildLink.create({
      data: {
        parentId: (session.user as any).id,
        childId: inviteCode.childId,
        isActive: true
      }
    });

    // Marquer le code comme utilisé
    await prisma.parentInviteCode.update({
      where: { id: inviteCode.id },
      data: { used: true }
    });

    return NextResponse.json({
      success: true,
      child: {
        id: inviteCode.child.id,
        firstName: inviteCode.child.displayName || inviteCode.child.username,
        lastName: '',
        class: inviteCode.child.classe
      }
    });

  } catch (error) {
    console.error('Error validating parent link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
