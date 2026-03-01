import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        soloElo: true,
        soloRankClass: true,
        multiplayerElo: true,
        multiplayerRankClass: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's solo statistics
    const soloStats = await prisma.soloStatistics.findUnique({
      where: { userId: user.id },
    });

    // Get user's badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      include: {
        badge: true,
      },
    });

    const stats = soloStats ? {
      totalTests: soloStats.totalTests,
      totalQuestions: soloStats.totalQuestions,
      correctAnswers: soloStats.correctAnswers,
      averageTime: soloStats.averageTime,
      bestStreak: soloStats.bestStreak,
    } : null;

    const badges = userBadges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      tier: ub.badge.tier,
    }));

    return NextResponse.json({
      profile: {
        ...user,
        stats,
        badges,
      },
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
