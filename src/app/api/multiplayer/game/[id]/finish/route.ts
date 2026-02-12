import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateMultiplayerEloChange } from '@/lib/multiplayer-elo';

export async function POST(
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

    // Get the complete game with all questions
    const game = await prisma.multiplayerGame.findFirst({
      where: {
        id: gameId,
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ],
        status: 'playing'
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        player2: {
          select: {
            id: true,
            username: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        questions: true
      }
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found or already finished' }, { status: 404 });
    }

    // Calculate final scores
    let player1Score = 0;
    let player2Score = 0;

    game.questions.forEach(question => {
      if (question.player1Correct) player1Score++;
      if (question.player2Correct) player2Score++;
    });

    // Determine winner based on score (not who finished first)
    let winner = null;
    if (player1Score > player2Score) {
      winner = game.player1Id;
    } else if (player2Score > player1Score) {
      winner = game.player2Id;
    }
    // If scores are equal, check who finished first (time-based)
    if (player1Score === player2Score && game.questions) {
      const player1TotalTime = game.questions
        .filter(q => q.player1Time)
        .reduce((sum, q) => sum + (q.player1Time || 0), 0);
      
      const player2TotalTime = game.questions
        .filter(q => q.player2Time)
        .reduce((sum, q) => sum + (q.player2Time || 0), 0);
      
      // Player with less total time wins
      if (player1TotalTime < player2TotalTime) {
        winner = game.player1Id;
      } else if (player2TotalTime < player1TotalTime) {
        winner = game.player2Id;
      }
      // If times are also equal, it's a draw (winner stays null)
    }

    // Calculate Elo changes for ranked games
    let player1EloChange = 0;
    let player2EloChange = 0;

    if (game.gameType === 'ranked') {
      player1EloChange = calculateMultiplayerEloChange(
        game.player1Elo,
        game.player2Elo || 400,
        player1Score,
        player2Score,
        true
      );

      player2EloChange = calculateMultiplayerEloChange(
        game.player2Elo || 400,
        game.player1Elo,
        player2Score,
        player1Score,
        true
      );
    }

    // Update game with final results
    const finishedGame = await prisma.multiplayerGame.update({
      where: { id: gameId },
      data: {
        player1Score,
        player2Score,
        winner,
        status: 'finished', // Always mark as finished, even if abandoned
        finishedAt: new Date()
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        player2: {
          select: {
            id: true,
            username: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        }
      }
    });

    // Update player stats and Elo
    const player1Result = winner === game.player1Id ? 'win' : winner === null ? 'draw' : 'loss';
    const player2Result = winner === game.player2Id ? 'win' : winner === null ? 'draw' : 'loss';

    // Get current user stats for bestMultiplayerElo
    const player1Stats = await prisma.user.findUnique({
      where: { id: game.player1Id },
      select: { bestMultiplayerElo: true }
    });

    // Update Player 1
    await prisma.user.update({
      where: { id: game.player1Id },
      data: {
        multiplayerElo: game.player1Elo + player1EloChange,
        multiplayerGames: { increment: 1 },
        multiplayerWins: player1Result === 'win' ? { increment: 1 } : undefined,
        multiplayerLosses: player1Result === 'loss' ? { increment: 1 } : undefined,
        bestMultiplayerElo: Math.max(game.player1Elo + player1EloChange, player1Stats?.bestMultiplayerElo || 0),
        isOnline: false,
        lastSeenAt: new Date()
      }
    });

    // Update Player 2
    if (game.player2Id && game.player2) {
      const player2Stats = await prisma.user.findUnique({
        where: { id: game.player2Id },
        select: { bestMultiplayerElo: true }
      });

      await prisma.user.update({
        where: { id: game.player2Id },
        data: {
          multiplayerElo: (game.player2Elo || 0) + player2EloChange,
          multiplayerGames: { increment: 1 },
          multiplayerWins: player2Result === 'win' ? { increment: 1 } : undefined,
          multiplayerLosses: player2Result === 'loss' ? { increment: 1 } : undefined,
          bestMultiplayerElo: Math.max((game.player2Elo || 0) + player2EloChange, player2Stats?.bestMultiplayerElo || 0),
          isOnline: false,
          lastSeenAt: new Date()
        }
      });
    }

    // Update multiplayer statistics
    await updateMultiplayerStatistics(game.player1Id, player1Result, game.timeControl);
    if (game.player2Id) {
      await updateMultiplayerStatistics(game.player2Id, player2Result, game.timeControl);
    }

    return NextResponse.json({
      success: true,
      game: finishedGame,
      player1EloChange,
      player2EloChange,
      player1Score,
      player2Score,
      winner
    });

  } catch (error) {
    console.error('Error finishing game:', error);
    return NextResponse.json(
      { error: 'Failed to finish game' },
      { status: 500 }
    );
  }
}

async function updateMultiplayerStatistics(
  userId: string, 
  result: 'win' | 'loss' | 'draw',
  timeControl: string
) {
  const timeControlField = `${timeControl}Games` as keyof any;
  const winField = `${timeControl}Wins` as keyof any;

  await prisma.multiplayerStatistics.upsert({
    where: { userId },
    update: {
      totalGames: { increment: 1 },
      totalWins: result === 'win' ? { increment: 1 } : undefined,
      totalLosses: result === 'loss' ? { increment: 1 } : undefined,
      totalDraws: result === 'draw' ? { increment: 1 } : undefined,
      [timeControlField]: { increment: 1 },
      [winField]: result === 'win' ? { increment: 1 } : undefined,
      currentStreak: result === 'win' ? { increment: 1 } : { set: 0 },
      updatedAt: new Date()
    },
    create: {
      userId,
      totalGames: 1,
      totalWins: result === 'win' ? 1 : 0,
      totalLosses: result === 'loss' ? 1 : 0,
      totalDraws: result === 'draw' ? 1 : 0,
      [timeControlField]: 1,
      [winField]: result === 'win' ? 1 : 0,
      currentStreak: result === 'win' ? 1 : 0
    }
  });
}
