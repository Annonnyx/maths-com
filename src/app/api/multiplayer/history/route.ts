import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        username: true,
        multiplayerElo: true,
        multiplayerRankClass: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all games where the user participated
    const games = await prisma.multiplayerGame.findMany({
      where: {
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ]
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
        questions: {
          select: {
            id: true,
            order: true,
            question: true,
            answer: true,
            type: true,
            difficulty: true,
            player1Answer: true,
            player2Answer: true,
            player1Time: true,
            player2Time: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data for frontend
    const transformedGames = games.map(game => ({
      id: game.id,
      player1: game.player1!,
      player2: game.player2 || undefined,
      gameType: game.gameType as any,
      timeControl: game.timeControl as any,
      status: game.status as any,
      createdAt: game.createdAt.toISOString(),
      startedAt: game.startedAt?.toISOString(),
      finishedAt: game.finishedAt?.toISOString(),
      player1Score: game.player1Score,
      player2Score: game.player2Score || 0,
      player1Correct: game.questions?.filter((q: any) => q.player1Answer !== null).length || 0,
      player2Correct: game.questions?.filter((q: any) => q.player2Answer !== null).length || 0,
      player1Time: game.questions?.reduce((sum: number, q: any) => sum + (q.player1Time || 0), 0),
      player2Time: game.questions?.reduce((sum: number, q: any) => sum + (q.player2Time || 0), 0),
      questionCount: game.questionCount,
      timeLimit: game.timeLimit,
      difficulty: game.difficulty
    }));

    return NextResponse.json({
      success: true,
      games: transformedGames
    });

  } catch (error) {
    console.error('Error fetching multiplayer history:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
