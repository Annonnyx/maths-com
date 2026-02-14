import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const currentUser = session?.user?.email
      ? await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        })
      : null;

    const isSelf = currentUser?.id === id;

    // Get recent games for the user
    const games = await prisma.test.findMany({
      where: {
        userId: id
      },
      include: isSelf
        ? { questions: true }
        : undefined,
      orderBy: { startedAt: 'desc' },
      take: 50
    });

    // Get multiplayer games
    const multiplayerGames = await prisma.multiplayerGame.findMany({
      where: {
        OR: [
          { player1Id: id },
          { player2Id: id }
        ]
      },
      include: {
        player1: {
          select: { id: true, username: true, displayName: true }
        },
        player2: {
          select: { id: true, username: true, displayName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Format games
    const formattedGames = [
      ...games.map(game => ({
        id: game.id,
        type: 'solo' as const,
        score: game.score,
        totalQuestions: game.totalQuestions,
        accuracy: (game.correctAnswers / game.totalQuestions) * 100,
        timeSpent: game.timeTaken,
        completedAt: game.startedAt,
        difficulty: 5, // Default difficulty since not in schema
        operation: 'mixed', // Default operation since not in schema
        result: game.score >= game.totalQuestions * 0.8 ? 'win' : 'loss'
      })),
      ...multiplayerGames.map(game => {
        const isPlayer1 = game.player1Id === id;
        const opponent = isPlayer1 ? game.player2 : game.player1;
        const win = isPlayer1 ? game.player1Score > game.player2Score : game.player2Score > game.player1Score;
        
        return {
          id: game.id,
          type: 'multiplayer' as const,
          score: isPlayer1 ? game.player1Score : game.player2Score,
          totalQuestions: game.questionCount,
          accuracy: 0, // Not tracked in multiplayer games
          timeSpent: game.timeLimit * 1000, // Approximate
          completedAt: game.createdAt,
          difficulty: 5, // Default difficulty
          opponent,
          result: win ? 'win' : game.player1Score === game.player2Score ? 'draw' : 'loss'
        };
      })
    ].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    return NextResponse.json({ games: formattedGames });
  } catch (error) {
    console.error('Error fetching user games:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
