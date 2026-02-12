import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { initializeBadges, awardRankBadge, RANK_BADGES } from '@/lib/badges';

// POST /api/admin/init-badges - Initialize all default badges and sync user rank badges
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'noe.barneron@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Initialize standard badges
    await initializeBadges();

    // Create or update Top 1 badges with fire icons
    let top1Solo = await prisma.badge.findFirst({ where: { id: 'top_1_solo' } });
    if (!top1Solo) {
      top1Solo = await prisma.badge.create({
        data: {
          id: 'top_1_solo',
          name: 'Top 1 Solo Mondial',
          description: 'Être classé numéro 1 au classement solo mondial',
          icon: '🔥',
          category: 'special',
          color: '#00C851',
          requirement: 'Atteindre la première place du classement solo',
          isCustom: false
        }
      });
    } else if (top1Solo.icon !== '🔥') {
      // Update icon if it's not the fire emoji
      top1Solo = await prisma.badge.update({
        where: { id: 'top_1_solo' },
        data: { icon: '🔥', color: '#00C851' }
      });
    }

    let top1Multi = await prisma.badge.findFirst({ where: { id: 'top_1_multi' } });
    if (!top1Multi) {
      top1Multi = await prisma.badge.create({
        data: {
          id: 'top_1_multi',
          name: 'Top 1 Multi Mondial',
          description: 'Être classé numéro 1 au classement multijoueur mondial',
          icon: '🔥',
          category: 'special',
          color: '#ff4444',
          requirement: 'Atteindre la première place du classement multijoueur',
          isCustom: false
        }
      });
    } else if (top1Multi.icon !== '🔥') {
      // Update icon if it's not the fire emoji
      top1Multi = await prisma.badge.update({
        where: { id: 'top_1_multi' },
        data: { icon: '🔥', color: '#ff4444' }
      });
    }

    // Get all users with their stats
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        rankClass: true, 
        multiplayerRankClass: true,
        elo: true,
        multiplayerElo: true,
        multiplayerGames: true,
        statistics: {
          select: {
            totalTests: true
          }
        }
      }
    });

    // Find top 1 users
    const top1SoloUser = users.length > 0 ? users.reduce((max, u) => u.elo > max.elo ? u : max, users[0]) : null;
    const top1MultiUser = users.length > 0 ? users.reduce((max, u) => u.multiplayerElo > max.multiplayerElo ? u : max, users[0]) : null;

    // Get all rank badges
    const allRankBadges = await prisma.badge.findMany({
      where: { category: 'rank' }
    });

    let awardedCount = 0;
    let removedCount = 0;

    for (const user of users) {
      const soloGames = user.statistics?.totalTests || 0;
      const multiGames = user.multiplayerGames || 0;
      
      // Get user's current rank badges
      const userBadges = await prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true }
      });

      // Remove old rank badges (keep only current rank)
      for (const userBadge of userBadges.filter(ub => ub.badge.category === 'rank')) {
        const expectedBadgeName = RANK_BADGES[user.rankClass as keyof typeof RANK_BADGES]?.name;
        if (userBadge.badge.name !== expectedBadgeName) {
          await prisma.userBadge.delete({ where: { id: userBadge.id } });
          removedCount++;
        }
      }

      // Award current rank badge (only if played at least 1 game)
      if (user.rankClass && (soloGames > 0 || multiGames > 0)) {
        await awardRankBadge(user.id, user.rankClass);
        awardedCount++;
      }

      // Award/Remove Top 1 Solo badge
      const hasTop1Solo = userBadges.some(ub => ub.badge.id === 'top_1_solo');
      if (user.id === top1SoloUser?.id) {
        if (!hasTop1Solo) {
          await prisma.userBadge.create({
            data: {
              userId: user.id,
              badgeId: 'top_1_solo'
            }
          });
        }
      } else if (hasTop1Solo) {
        await prisma.userBadge.deleteMany({
          where: { userId: user.id, badgeId: 'top_1_solo' }
        });
      }

      // Award/Remove Top 1 Multi badge
      const hasTop1Multi = userBadges.some(ub => ub.badge.id === 'top_1_multi');
      if (user.id === top1MultiUser?.id) {
        if (!hasTop1Multi) {
          await prisma.userBadge.create({
            data: {
              userId: user.id,
              badgeId: 'top_1_multi'
            }
          });
        }
      } else if (hasTop1Multi) {
        await prisma.userBadge.deleteMany({
          where: { userId: user.id, badgeId: 'top_1_multi' }
        });
      }
    }

    const allBadges = await prisma.badge.findMany({ orderBy: { category: 'asc' } });

    return NextResponse.json({ 
      success: true, 
      message: 'Badges synchronized',
      totalBadges: allBadges.length,
      rankBadgesAwarded: awardedCount,
      rankBadgesRemoved: removedCount,
      top1Solo: top1SoloUser?.id || null,
      top1Multi: top1MultiUser?.id || null,
      totalUsers: users.length
    });

  } catch (error) {
    console.error('Error initializing badges:', error);
    return NextResponse.json({ error: 'Failed to initialize badges' }, { status: 500 });
  }
}
