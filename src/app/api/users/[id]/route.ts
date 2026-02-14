import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const currentUser = session?.user?.email
      ? await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, email: true }
        })
      : null;

    const isSelf = currentUser?.id === id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        ...(isSelf ? { email: true } : {}),
        avatarUrl: true,
        bannerUrl: true,
        customBannerId: true,
        selectedBadgeIds: true,
        elo: true,
        rankClass: true,
        bestElo: true,
        bestRankClass: true,
        currentStreak: true,
        bestStreak: true,
        multiplayerElo: true,
        multiplayerRankClass: true,
        multiplayerGames: true,
        multiplayerWins: true,
        multiplayerLosses: true,
        createdAt: true,
        lastSeenAt: true,
        isOnline: true,
        statistics: true,
        userBadges: {
          select: {
            id: true,
            earnedAt: true,
            expiresAt: true,
            badge: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                category: true,
                color: true,
                requirement: true,
                isCustom: true,
                isTemporary: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
