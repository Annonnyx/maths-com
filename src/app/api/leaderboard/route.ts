import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRankFromElo } from '@/lib/elo';

// Old school level to ELO rank conversion
const SCHOOL_LEVEL_TO_ELO: Record<string, number> = {
  'CP': 350,    // ~F
  'CE1': 450,   // ~F+
  'CE2': 550,   // ~E
  'CM1': 650,   // ~E+
  'CM2': 750,   // ~D-
  '6e': 850,    // ~D
  '5e': 950,    // ~D+
  '4e': 1050,   // ~C-
  '3e': 1150,   // ~C
  '2de': 1250,  // ~C+
  '1re': 1350,  // ~B-
  'Tle': 1450,  // ~B
};

// Sanitize rank - convert old school levels to proper ELO ranks
function sanitizeRank(rank: string | null | undefined, elo: number): string {
  if (!rank) return getRankFromElo(elo);
  
  // If it's a school level, convert it
  if (rank in SCHOOL_LEVEL_TO_ELO) {
    return getRankFromElo(elo);
  }
  
  // Valid ELO ranks: F-, F, F+, E-, E, E+, D-, D, D+, C-, C, C+, B-, B, B+, A-, A, A+, S-, S, S+
  const validRanks = ['F-', 'F', 'F+', 'E-', 'E', 'E+', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+'];
  if (validRanks.includes(rank)) {
    return rank;
  }
  
  // Fallback: calculate from ELO
  return getRankFromElo(elo);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const timeFrame = searchParams.get('timeFrame') || 'all'; // 'week', 'month', 'all'
    const scope = searchParams.get('scope') || 'global'; // 'global' or 'friends'
    const mode = searchParams.get('mode') || 'solo'; // 'solo' or 'multiplayer'

    const skip = (page - 1) * limit;

    // Get current user if logged in
    let currentUser = null;
    if (session?.user?.email) {
      currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          username: true,
          displayName: true,
          // SOLO Ranking
          soloElo: true,
          soloRankClass: true,
          soloBestElo: true,
          soloBestRankClass: true,
          // MULTIPLAYER Ranking
          multiplayerElo: true,
          multiplayerRankClass: true,
          multiplayerBestElo: true,
          multiplayerBestRankClass: true,
        }
      });
    }

    // Build filters
    let dateFilter = {};
    if (timeFrame === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { lastTestDate: { gte: weekAgo } };
    } else if (timeFrame === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { lastTestDate: { gte: monthAgo } };
    }

    let friendsFilter = {};
    if (scope === 'friends') {
      if (!currentUser) {
        // Return empty leaderboard for guests trying to view friends
        return NextResponse.json({
          mode,
          leaderboard: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          userRank: null,
          currentUser: null
        });
      }

      // Get user's friends
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { user1Id: currentUser.id },
            { user2Id: currentUser.id }
          ],
          status: 'accepted'
        }
      });

      const friendIds = friendships.map(f => 
        f.user1Id === currentUser.id ? f.user2Id : f.user1Id
      );

      if (friendIds.length === 0) {
        return NextResponse.json({
          mode,
          leaderboard: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          userRank: null,
          currentUser: {
            id: currentUser.id,
            username: currentUser.username,
            displayName: currentUser.displayName,
            stats: {
              currentElo: mode === 'solo' ? currentUser.soloElo : currentUser.multiplayerElo,
              currentRank: mode === 'solo' ? currentUser.soloRankClass : currentUser.multiplayerRankClass,
              totalGames: 0
            }
          }
        });
      }
      
      friendsFilter = { id: { in: friendIds } };
    }

    // Determine which fields and relations to use based on mode
    const eloField = mode === 'solo' ? 'soloElo' : 'multiplayerElo';
    const rankClassField = mode === 'solo' ? 'soloRankClass' : 'multiplayerRankClass';
    const statisticsRelation = mode === 'solo' ? 'soloStatistics' : 'multiplayerStatistics';

    // FORCE 10 PLAYERS MAX
    const effectiveLimit = Math.min(limit, 10);

    // Get leaderboard data with statistics
    const leaderboard = await prisma.user.findMany({
      where: {
        ...dateFilter,
        ...friendsFilter
      },
      include: {
        soloStatistics: mode === 'solo',
        multiplayerStatistics: mode === 'multiplayer'
      },
      orderBy: {
        [eloField]: 'desc'
      },
      skip,
      take: effectiveLimit
    });

    const total = await prisma.user.count({
      where: {
        ...dateFilter,
        ...friendsFilter
      }
    });

    // Calculate additional stats
    const totalUsers = await prisma.user.count();
    
    const leaderboardWithStats = leaderboard.map((user: any, index: number) => {
      const globalRank = skip + index + 1;
      
      // Get stats based on mode
      const stats = mode === 'solo' ? user.soloStatistics : user.multiplayerStatistics;
      
      // Calculate accuracy
      const totalQuestions = stats?.totalQuestions || 0;
      const correctAnswers = stats?.totalCorrect || 0;
      const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      
      // Get total games/tests
      const totalGames = mode === 'solo' 
        ? (stats?.totalTests || 0)
        : (stats?.totalGames || 0);

      // Calculate percentile (top X%)
      const percentile = Math.round(((globalRank - 1) / totalUsers) * 100);

      return {
        ...user,
        globalRank,
        percentile,
        stats: {
          accuracy,
          totalGames,
          currentElo: mode === 'solo' ? user.soloElo : user.multiplayerElo,
          currentRank: sanitizeRank(mode === 'solo' ? user.soloRankClass : user.multiplayerRankClass, mode === 'solo' ? user.soloElo : user.multiplayerElo),
          bestElo: mode === 'solo' ? user.soloBestElo : user.multiplayerBestElo,
          bestRank: sanitizeRank(mode === 'solo' ? user.soloBestRankClass : user.multiplayerBestRankClass, mode === 'solo' ? user.soloBestElo : user.multiplayerBestElo)
        }
      };
    });

    // Get current user's rank among friends
    let userRank = null;
    if (currentUser) {
      const userCount = await prisma.user.count({
        where: {
          ...dateFilter,
          ...friendsFilter,
          soloElo: { gt: currentUser.soloElo }
        }
      });

      userRank = userCount + 1;
    }

    return NextResponse.json({
      leaderboard: leaderboardWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      userRank,
      currentUser: currentUser ? {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        stats: {
          currentElo: mode === 'solo' ? currentUser.soloElo : currentUser.multiplayerElo,
          currentRank: sanitizeRank(mode === 'solo' ? currentUser.soloRankClass : currentUser.multiplayerRankClass, mode === 'solo' ? currentUser.soloElo : currentUser.multiplayerElo),
          totalGames: 0 // Will be populated from actual statistics
        }
      } : null
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
