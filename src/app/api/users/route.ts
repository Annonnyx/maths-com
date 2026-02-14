import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/users - Create a new user (register)
export async function POST(req: NextRequest) {
  console.log('[API /users] POST started');
  try {
    const body = await req.json();
    console.log('[API /users] Body parsed:', { email: body?.email, username: body?.username });
    
    const { email, username, password, displayName } = body;

    if (!email || !username) {
      console.log('[API /users] Missing required fields');
      return NextResponse.json(
        { error: 'Email and username required' },
        { status: 400 }
      );
    }

    console.log('[API /users] Checking existing user...');
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });
    console.log('[API /users] Existing user check done:', !!existingUser);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      );
    }

    console.log('[API /users] Hashing password...');
    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    console.log('[API /users] Password hashed:', !!hashedPassword);

    console.log('[API /users] Creating user...');
    // Create user with statistics
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName: displayName || username,
        statistics: {
          create: {
            weakPoints: JSON.stringify([]),
            eloHistory: JSON.stringify([{ date: new Date().toISOString(), elo: 400 }])
          }
        }
      },
      include: {
        statistics: true
      }
    });
    console.log('[API /users] User created:', user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('[API /users] ERROR:', error?.message, error?.code, error?.stack?.slice(0, 200));
    return NextResponse.json({ 
      error: 'Failed to create user',
      details: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN'
    }, { status: 500 });
  }
}

// GET /api/users - Get user by ID or username
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');

    if (!id && !username) {
      return NextResponse.json(
        { error: 'ID or username required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: id ? { id } : { username: username! },
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/users - Update user
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { displayName, avatarUrl, hasCompletedOnboarding } = body;

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(displayName && { displayName }),
        ...(avatarUrl && { avatarUrl }),
        ...(hasCompletedOnboarding !== undefined && { hasCompletedOnboarding })
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
