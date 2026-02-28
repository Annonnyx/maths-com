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
    const timeFrame = searchParams.get('timeFrame') || 'all'; // 'week', 'month', 'all'
    const scope = searchParams.get('scope') || 'global'; // 'global' or 'friends'

    const skip = (page - 1) * limit;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        username: true,
        displayName: true,
        elo: true,
        rankClass: true,
        bestElo: true,
        bestRankClass: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
          leaderboard: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          userRank: 1,
          currentUser: {
            id: currentUser.id,
            username: currentUser.username,
            displayName: currentUser.displayName,
            stats: {
              currentElo: currentUser.elo,
              currentRank: currentUser.rankClass,
              totalGames: 0
            }
          }
        });
      }
      
      friendsFilter = { id: { in: friendIds } };
    }

    // Get leaderboard data with statistics
    const leaderboard = await prisma.user.findMany({
      where: {
        ...dateFilter,
        ...friendsFilter,
        statistics: {
          totalTests: { gt: 0 }
        }
      },
      include: {
        statistics: true
      },
      orderBy: [
        { elo: 'desc' }, 
        { statistics: { totalTests: 'desc' } }
      ],
      skip,
      take: limit
    });

    const total = await prisma.user.count({
      where: {
        ...dateFilter,
        ...friendsFilter,
        statistics: {
          totalTests: { gt: 0 }
        }
      }
    });

    // Calculate additional stats
    const leaderboardWithStats = leaderboard.map((user, index) => {
      const globalRank = index + 1;
      
      // Calculate accuracy for solo
      const accuracy = user.statistics?.totalQuestions && user.statistics.totalQuestions > 0
        ? Math.round((user.statistics.totalCorrect / user.statistics.totalQuestions) * 100)
        : 0;

      return {
        ...user,
        globalRank,
        stats: {
          accuracy,
          totalGames: user.statistics?.totalTests || 0,
          currentElo: user.elo,
          currentRank: user.rankClass,
          bestElo: user.bestElo,
          bestRank: user.bestRankClass
        }
      };
    });

    // Get current user's rank among friends
    let userRank = null;
    const userCount = await prisma.user.count({
      where: {
        ...dateFilter,
        ...friendsFilter,
        statistics: {
          totalTests: { gt: 0 }
        },
        elo: { gt: currentUser.elo }
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
          currentElo: currentUser.elo,
          currentRank: currentUser.rankClass,
          totalGames: 0 // Pas de statistics dans le select
        }
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
