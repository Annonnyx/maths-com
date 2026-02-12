import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AchievementService } from '@/lib/achievement-service';

// POST /api/achievements/monthly - Award monthly top 1 badges
export async function POST(req: NextRequest) {
  try {
    // Simple authentication check (you might want to add proper API key authentication)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await AchievementService.awardMonthlyTop1Badges();

    return NextResponse.json({ 
      success: true, 
      message: 'Monthly top 1 badges awarded successfully' 
    });

  } catch (error) {
    console.error('Error awarding monthly badges:', error);
    return NextResponse.json(
      { error: 'Failed to award monthly badges' },
      { status: 500 }
    );
  }
}

// GET /api/achievements/monthly - Get current top players
export async function GET(req: NextRequest) {
  try {
    const topSoloPlayer = await prisma.user.findFirst({
      orderBy: {
        elo: 'desc'
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        elo: true,
        rankClass: true
      },
      take: 1
    });

    const topMultiplayerPlayer = await prisma.user.findFirst({
      orderBy: {
        multiplayerElo: 'desc'
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        multiplayerElo: true,
        multiplayerRankClass: true
      },
      take: 1
    });

    return NextResponse.json({
      topSoloPlayer,
      topMultiplayerPlayer
    });

  } catch (error) {
    console.error('Error fetching top players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top players' },
      { status: 500 }
    );
  }
}
