import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stats/summary?mode=solo|multiplayer&period=1h|24h|7d|30d|3m|all
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'solo';
    const period = searchParams.get('period') || '7d';

    const userId = session.user.id;

    // Calculer la date de début selon la période
    const now = new Date();
    let startDate = new Date(0);

    switch (period) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date(0);
    }

    let stats = {
      totalTests: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      averageTime: 0,
      averageScore: 0,
      bestStreak: 0,
      currentStreak: 0,
    };

    if (mode === 'solo' || mode === 'both') {
      // Récupérer les tests solo
      const soloTests = await (prisma as any).soloTest.findMany({
        where: {
          userId,
          completedAt: {
            gte: startDate
          },
          status: 'completed'
        },
        include: {
          questions: true
        }
      });

      // Calculer les stats solo
      let totalQuestions = 0;
      let totalCorrect = 0;
      let totalTime = 0;

      soloTests.forEach((test: any) => {
        totalQuestions += test.questions?.length || 0;
        totalCorrect += test.questions?.filter((q: any) => q.isCorrect).length || 0;
        totalTime += test.totalTime || 0;
      });

      stats.totalTests += soloTests.length;
      stats.totalQuestions += totalQuestions;
      stats.totalCorrect += totalCorrect;
      stats.averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0;
      stats.averageScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    }

    if (mode === 'multiplayer' || mode === 'both') {
      // Récupérer les jeux multijoueur
      const multiplayerGames = await (prisma as any).multiplayerGame.findMany({
        where: {
          OR: [
            { player1Id: userId },
            { player2Id: userId }
          ],
          status: 'finished',
          finishedAt: {
            gte: startDate
          }
        }
      });

      // Calculer les stats multijoueur
      let wins = 0;
      let totalScore = 0;

      multiplayerGames.forEach((game: any) => {
        const isPlayer1 = game.player1Id === userId;
        const playerScore = isPlayer1 ? game.player1Score : game.player2Score;
        totalScore += playerScore || 0;
        
        if (game.winner === userId) {
          wins++;
        }
      });

      stats.totalTests += multiplayerGames.length;
      stats.averageScore = multiplayerGames.length > 0 ? totalScore / multiplayerGames.length : 0;
    }

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error fetching stats summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
