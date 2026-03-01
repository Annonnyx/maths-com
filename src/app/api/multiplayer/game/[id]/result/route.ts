import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;
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

    const game = await prisma.multiplayerGame.findFirst({
      where: {
        id: gameId,
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ],
        status: 'finished'
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        player2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        questions: true
      }
    });

    if (!game) {
      return NextResponse.json({ error: 'Game result not found' }, { status: 404 });
    }

    // Calculate Elo changes
    const { calculateMultiplayerEloChange } = await import('@/lib/multiplayer-elo');
    
    let player1EloChange = 0;
    let player2EloChange = 0;

    if (game.gameType === 'ranked') {
      player1EloChange = calculateMultiplayerEloChange(
        game.player1Elo,
        game.player2Elo || 400,
        game.player1Score,
        game.player2Score,
        true
      );

      player2EloChange = calculateMultiplayerEloChange(
        game.player2Elo || 400,
        game.player1Elo,
        game.player2Score,
        game.player1Score,
        true
      );
    }

    return NextResponse.json({ 
      game,
      player1EloChange,
      player2EloChange
    });
  } catch (error) {
    console.error('Error fetching game result:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game result' },
      { status: 500 }
    );
  }
}
