import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer le dernier code d'invitation non expiré
    const inviteCode = await prisma.parentInviteCode.findFirst({
      where: {
        childId: (session.user as any).id,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!inviteCode) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: inviteCode.id,
      code: inviteCode.code,
      createdAt: inviteCode.createdAt.toISOString(),
      expiresAt: inviteCode.expiresAt.toISOString(),
      used: inviteCode.used
    });
  } catch (error) {
    console.error('Error fetching invite code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un étudiant
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    });

    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Only students can generate invite codes' }, { status: 403 });
    }

    // Désactiver les anciens codes non utilisés
    await prisma.parentInviteCode.updateMany({
      where: {
        childId: (session.user as any).id,
        used: false
      },
      data: {
        used: true
      }
    });

    // Générer un nouveau code
    let code = generateInviteCode();
    
    // S'assurer que le code est unique
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.parentInviteCode.findUnique({
        where: { code }
      });
      
      if (!existing) break;
      
      code = generateInviteCode();
      attempts++;
    }

    // Créer le nouveau code d'invitation
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Valable 24 heures

    const inviteCode = await prisma.parentInviteCode.create({
      data: {
        childId: (session.user as any).id,
        code,
        expiresAt
      }
    });

    return NextResponse.json({
      id: inviteCode.id,
      code: inviteCode.code,
      createdAt: inviteCode.createdAt.toISOString(),
      expiresAt: inviteCode.expiresAt.toISOString(),
      used: inviteCode.used
    });
  } catch (error) {
    console.error('Error generating invite code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
