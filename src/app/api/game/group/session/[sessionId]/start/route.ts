import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hostParticipating, questionCount } = await req.json();

    // Vérifier que l'utilisateur est l'hôte
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

    if (gameSession.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Only host can start the game' }, { status: 403 });
    }

    // Mettre à jour le statut de la session
    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        status: 'active',
        currentQuestionIndex: 0
      },
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

    // Si l'hôte participe, s'assurer qu'il est dans la liste des joueurs
    if (hostParticipating) {
      const hostPlayer = gameSession.players.find(p => p.userId === session.user.id);
      if (!hostPlayer) {
        await prisma.gamePlayer.create({
          data: {
            sessionId: sessionId,
            userId: session.user.id,
            score: 0,
            isReady: true
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      session: updatedSession
    });

  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}
