import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { RANK_BADGES } from '@/lib/badges';

// POST /api/admin/cleanup-badges - NUCLEAR OPTION: Delete all rank badges and recreate
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'noe.barneron@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Step 1: Delete ALL existing rank badges and their user associations
    const allRankBadges = await prisma.badge.findMany({
      where: { category: 'rank' }
    });

    let deletedUserBadges = 0;
    let deletedBadges = 0;

    for (const badge of allRankBadges) {
      // Delete all userBadges for this badge
      const userBadgesDeleted = await prisma.userBadge.deleteMany({
        where: { badgeId: badge.id }
      });
      deletedUserBadges += userBadgesDeleted.count;
      
      // Delete the badge
      await prisma.badge.delete({ where: { id: badge.id } });
      deletedBadges++;
    }

    // Step 2: Create clean rank badges from RANK_BADGES definition
    const createdBadges = [];
    for (const [rank, badgeInfo] of Object.entries(RANK_BADGES)) {
      const badge = await prisma.badge.create({
        data: {
          name: badgeInfo.name,
          description: badgeInfo.description,
          icon: badgeInfo.icon,
          category: 'rank',
          color: badgeInfo.color,
          requirement: `Atteindre le rang ${rank}`,
          isCustom: false
        }
      });
      createdBadges.push(badge);
    }

    // Step 3: Re-assign rank badges to users based on their current rank
    const users = await prisma.user.findMany({
      select: { id: true, rankClass: true, statistics: { select: { totalTests: true } } }
    });

    let assignedCount = 0;
    for (const user of users) {
      const soloGames = user.statistics?.totalTests || 0;
      
      if (user.rankClass && soloGames > 0) {
        const badgeInfo = RANK_BADGES[user.rankClass as keyof typeof RANK_BADGES];
        if (badgeInfo) {
          const badge = await prisma.badge.findFirst({
            where: { name: badgeInfo.name }
          });
          if (badge) {
            await prisma.userBadge.create({
              data: {
                userId: user.id,
                badgeId: badge.id
              }
            });
            assignedCount++;
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Nuclear cleanup complete',
      deletedBadges,
      deletedUserBadges,
      createdBadges: createdBadges.length,
      assignedToUsers: assignedCount,
      badges: createdBadges.map(b => ({ name: b.name, icon: b.icon }))
    });

  } catch (error) {
    console.error('Error in nuclear cleanup:', error);
    return NextResponse.json({ 
      error: 'Failed to clean up badges', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
