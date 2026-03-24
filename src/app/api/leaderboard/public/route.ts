import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRankFromElo } from '@/lib/elo';
import { calculateLeaderboardAccuracy } from '@/lib/utils/accuracy';

// School level to ELO rank conversion
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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const mode = searchParams.get('mode') || 'solo'; // 'solo' or 'multiplayer'

    // FORCE 10 PLAYERS MAX
    const effectiveLimit = Math.min(limit, 10);

    // Determine which fields and relations to use based on mode
    const eloField = mode === 'solo' ? 'soloElo' : 'multiplayerElo';
    const rankClassField = mode === 'solo' ? 'soloRankClass' : 'multiplayerRankClass';
    const statisticsRelation = mode === 'solo' ? 'soloStatistics' : 'multiplayerStatistics';

    // Get leaderboard data with statistics (public version - no auth required)
    const leaderboard = await prisma.user.findMany({
      where: {
        // Only include users with some activity
        [eloField]: { gt: 300 } // Minimum ELO to show
      },
      include: {
        soloStatistics: mode === 'solo',
        multiplayerStatistics: mode === 'multiplayer'
      },
      orderBy: {
        [eloField]: 'desc'
      },
      take: effectiveLimit
    });

    const totalUsers = await prisma.user.count({
      where: {
        [eloField]: { gt: 300 }
      }
    });
    
    const leaderboardWithStats = leaderboard.map((user: any, index: number) => {
      const globalRank = index + 1;
      
      // Get stats based on mode
      const stats = mode === 'solo' ? user.soloStatistics : user.multiplayerStatistics;
      
      // Calculate accuracy (solo only - multiplayer uses win rate)
      const accuracy = mode === 'solo' 
        ? calculateLeaderboardAccuracy({
            totalQuestions: stats?.totalQuestions || 0,
            totalCorrect: stats?.totalCorrect || 0
          }, mode as 'solo' | 'multiplayer')
        : 0; // For multiplayer, accuracy is 0 (we show win rate instead)
      
      // Calculate win rate (multiplayer only)
      const totalGames = mode === 'solo' 
        ? (stats?.totalTests || 0)
        : (stats?.totalGames || 0);
      const totalWins = stats?.totalWins || 0;
      const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 
                      (mode === 'multiplayer' ? 0 : null); // For solo, winRate is null

      // Calculate percentile (top X%)
      const percentile = totalUsers > 0 ? Math.round(((globalRank - 1) / totalUsers) * 100) : 0;

      return {
        ...user,
        globalRank,
        percentile,
        stats: {
          accuracy,
          winRate,
          totalGames,
          currentElo: mode === 'solo' ? user.soloElo : user.multiplayerElo,
          currentRank: sanitizeRank(mode === 'solo' ? user.soloRankClass : user.multiplayerRankClass, mode === 'solo' ? user.soloElo : user.multiplayerElo),
          bestElo: mode === 'solo' ? user.soloBestElo : user.multiplayerBestElo,
          bestRank: sanitizeRank(mode === 'solo' ? user.soloBestRankClass : user.multiplayerBestRankClass, mode === 'solo' ? user.soloBestElo : user.multiplayerBestElo)
        },
        // Ensure username is never undefined
        username: user.username || user.displayName || 'Anonymous'
      };
    });

    return NextResponse.json({
      mode,
      leaderboard: leaderboardWithStats,
      pagination: {
        page: 1,
        limit: effectiveLimit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / effectiveLimit)
      },
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching public leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
