import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer la session de jeu avec les joueurs
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                multiplayerElo: true,
                multiplayerRankClass: true
              }
            }
          }
        }
      }
    });

    if (!gameSession) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    return NextResponse.json({
      session: gameSession,
      players: gameSession.players
    });

  } catch (error) {
    console.error('Error fetching game session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est l'hôte
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId }
    });

    if (!gameSession) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    if (gameSession.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Only host can cancel the game' }, { status: 403 });
    }

    // Supprimer tous les joueurs de la session
    await prisma.gamePlayer.deleteMany({
      where: { sessionId }
    });

    // Supprimer la session
    await prisma.gameSession.delete({
      where: { id: sessionId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error cancelling game:', error);
    return NextResponse.json(
      { error: 'Failed to cancel game' },
      { status: 500 }
    );
  }
}
