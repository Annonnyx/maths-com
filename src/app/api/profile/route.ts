import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // If userId is provided, allow fetching any user profile (for multiplayer banners)
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bannerUrl: true,
          customBannerId: true,
          selectedBadgeIds: true,
          elo: true,
          rankClass: true,
          bestElo: true,
          bestRankClass: true,
          hasCompletedOnboarding: true,
          isOnline: true,
          lastSeenAt: true,
          multiplayerElo: true,
          multiplayerRankClass: true,
          bestMultiplayerElo: true,
          bestMultiplayerRankClass: true,
          multiplayerGames: true,
          multiplayerWins: true,
          multiplayerLosses: true,
          createdAt: true,
          updatedAt: true,
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

      return NextResponse.json({
        user,
        statistics: user.statistics
      });
    }

    // Otherwise, require authentication and return current user's profile
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        statistics: true,
        tests: {
          orderBy: { completedAt: 'desc' },
          take: 10,
          include: {
            questions: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent multiplayer games
    const recentGames = await prisma.multiplayerGame.findMany({
      where: {
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ],
        status: { in: ['finished', 'playing'] }
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        player2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Return user data without password
    const { password, ...userData } = user;
    
    return NextResponse.json({
      user: userData,
      recentTests: user.tests,
      recentGames,
      statistics: user.statistics
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user profile (displayName, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { displayName } = await req.json();

    if (displayName === undefined) {
      return NextResponse.json({ error: 'displayName is required' }, { status: 400 });
    }

    // Validate displayName length
    if (displayName.length < 2 || displayName.length > 30) {
      return NextResponse.json({ error: 'Display name must be between 2 and 30 characters' }, { status: 400 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { displayName: displayName || null },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        elo: true,
        rankClass: true,
        bestElo: true,
        bestRankClass: true,
        bannerUrl: true,
        selectedBadgeIds: true,
      }
    });

    return NextResponse.json({ user: updatedUser });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
