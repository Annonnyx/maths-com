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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'multiplayer'; // 'solo' or 'multiplayer'
    const timeFrame = searchParams.get('timeFrame') || 'all'; // 'week', 'month', 'all'
    const scope = searchParams.get('scope') || 'global'; // 'global' or 'friends'

    const skip = (page - 1) * limit;

    // Get current user and their friends if needed
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        statistics: true,
        multiplayerStatistics: true,
        sentFriendships: scope === 'friends' ? {
          where: { status: 'accepted' },
          select: { user2Id: true }
        } : false,
        receivedFriendships: scope === 'friends' ? {
          where: { status: 'accepted' },
          select: { user1Id: true }
        } : false
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build friends filter if scope is 'friends'
    let friendsFilter = {};
    if (scope === 'friends') {
      const friendIds = [
        ...currentUser.sentFriendships.map(f => f.user2Id),
        ...currentUser.receivedFriendships.map(f => f.user1Id)
      ];
      
      if (friendIds.length === 0) {
        return NextResponse.json({
          leaderboard: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          userRank: 1,
          currentUser: {
            id: currentUser.id,
            username: currentUser.username,
            displayName: currentUser.displayName,
            stats: {
              currentElo: type === 'multiplayer' ? currentUser.multiplayerElo : currentUser.elo,
              currentRank: type === 'multiplayer' ? currentUser.multiplayerRankClass : currentUser.rankClass,
              totalGames: type === 'multiplayer' ? currentUser.multiplayerGames : (currentUser.statistics?.totalTests || 0)
            }
          }
        });
      }
      
      friendsFilter = { id: { in: friendIds } };
    }

    // Build where clause for time filtering
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

    // Get leaderboard data with statistics
    const [leaderboard, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          ...dateFilter,
          ...friendsFilter,
          // Only include users who have played at least one game
          OR: [
            { statistics: { totalTests: { gt: 0 } } },
            { multiplayerGames: { gt: 0 } }
          ]
        },
        include: {
          statistics: true,
          multiplayerStatistics: true
        },
        orderBy: type === 'multiplayer' 
          ? [{ multiplayerElo: 'desc' }, { multiplayerWins: 'desc' }]
          : [{ elo: 'desc' }, { statistics: { totalTests: 'desc' } }],
        skip,
        take: limit
      }),
      prisma.user.count({
        where: {
          ...dateFilter,
          ...friendsFilter,
          OR: [
            { statistics: { totalTests: { gt: 0 } } },
            { multiplayerGames: { gt: 0 } }
          ]
        }
      })
    ]);

    // Calculate additional stats
    const leaderboardWithStats = leaderboard.map((user, index) => {
      const globalRank = index + 1;
      
      // Calculate win rate for multiplayer
      const winRate = user.multiplayerGames > 0 
        ? Math.round((user.multiplayerWins / user.multiplayerGames) * 100)
        : 0;

      // Calculate accuracy for solo
      const accuracy = user.statistics?.totalQuestions && user.statistics.totalQuestions > 0
        ? Math.round((user.statistics.totalCorrect / user.statistics.totalQuestions) * 100)
        : 0;

      return {
        ...user,
        globalRank,
        stats: {
          winRate,
          accuracy,
          totalGames: type === 'multiplayer' ? user.multiplayerGames : (user.statistics?.totalTests || 0),
          currentElo: type === 'multiplayer' ? user.multiplayerElo : user.elo,
          currentRank: type === 'multiplayer' ? user.multiplayerRankClass : user.rankClass,
          bestElo: type === 'multiplayer' ? user.bestMultiplayerElo : user.elo,
          bestRank: type === 'multiplayer' ? user.bestMultiplayerRankClass : user.rankClass
        }
      };
    });

    // Get current user's rank among friends
    let userRank = null;
    const userCount = await prisma.user.count({
      where: {
        ...dateFilter,
        ...friendsFilter,
        OR: [
          { statistics: { totalTests: { gt: 0 } } },
          { multiplayerGames: { gt: 0 } }
        ],
        AND: type === 'multiplayer' 
          ? [{ multiplayerElo: { gt: currentUser.multiplayerElo } }]
          : [{ elo: { gt: currentUser.elo } }]
      }
    });
    userRank = userCount + 1;

    return NextResponse.json({
      leaderboard: leaderboardWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      userRank,
      currentUser: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        stats: {
          currentElo: type === 'multiplayer' ? currentUser.multiplayerElo : currentUser.elo,
          currentRank: type === 'multiplayer' ? currentUser.multiplayerRankClass : currentUser.rankClass,
          totalGames: type === 'multiplayer' ? currentUser.multiplayerGames : (currentUser.statistics?.totalTests || 0)
        }
      }
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}
