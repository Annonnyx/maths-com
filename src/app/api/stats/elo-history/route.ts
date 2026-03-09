import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stats/elo-history?mode=solo|multiplayer&period=7d|30d|3m|all
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
    let startDate = new Date(0); // Par défaut: tout

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

    let history: { date: string; elo: number }[] = [];

    if (mode === 'solo') {
      // Récupérer les résultats de tests solo
      const results = await (prisma as any).soloTest.findMany({
        where: {
          userId,
          completedAt: {
            gte: startDate
          }
        },
        orderBy: {
          completedAt: 'asc'
        },
        select: {
          completedAt: true,
          eloBefore: true,
          eloAfter: true,
          eloChange: true
        }
      });

      // Construire l'historique avec le point de départ
      history = [];
      
      if (results.length > 0) {
        // Ajouter le point de départ (ELO avant le premier test)
        history.push({
          date: results[0].completedAt ? new Date(new Date(results[0].completedAt).getTime() - 1000).toISOString() : startDate.toISOString(),
          elo: results[0].eloBefore
        });
        
        // Ajouter les points après chaque test
        results.forEach((r: any) => {
          history.push({
            date: r.completedAt!.toISOString(),
            elo: r.eloAfter
          });
        });
      }
    } else {
      // Pour le multijoueur, on récupère les jeux terminés
      const results = await (prisma as any).multiplayerGame.findMany({
        where: {
          OR: [
            { player1Id: userId },
            { player2Id: userId }
          ],
          status: 'finished',
          finishedAt: {
            gte: startDate
          }
        },
        orderBy: {
          finishedAt: 'asc'
        },
        select: {
          finishedAt: true,
          player1Id: true,
          player1Elo: true,
          player2Elo: true,
          winner: true
        }
      });

      history = results.map((r: any) => {
        // Déterminer l'ELO de l'utilisateur après le match
        const isPlayer1 = r.player1Id === userId;
        const elo = isPlayer1 ? r.player1Elo : r.player2Elo;
        return {
          date: r.finishedAt!.toISOString(),
          elo: elo || 400
        };
      });
    }

    // Si pas assez de données, générer des points de début/fin
    if (history.length === 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          soloElo: true,
          multiplayerElo: true,
          createdAt: true
        }
      });

      if (user) {
        const currentElo = mode === 'solo' ? user.soloElo : user.multiplayerElo;
        history = [
          { date: startDate.toISOString(), elo: currentElo },
          { date: now.toISOString(), elo: currentElo }
        ];
      }
    }

    // Ajouter le point actuel si le dernier point date de plus d'1 heure
    if (history.length > 0) {
      const lastPoint = history[history.length - 1];
      const lastDate = new Date(lastPoint.date);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      if (lastDate < oneHourAgo) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            soloElo: true,
            multiplayerElo: true
          }
        });

        if (user) {
          const currentElo = mode === 'solo' ? user.soloElo : user.multiplayerElo;
          history.push({
            date: now.toISOString(),
            elo: currentElo
          });
        }
      }
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching ELO history:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
}
