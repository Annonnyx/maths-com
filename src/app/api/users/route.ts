import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/users - Create a new user (register)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { email, username, password, displayName } = body;

    if (!email || !username) {
      return NextResponse.json(
        { error: 'Email and username required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      let errorMessage = 'Cet email ou nom d\'utilisateur existe déjà';
      if (existingUser.email === email) {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (existingUser.username === username) {
        errorMessage = 'Ce nom d\'utilisateur est déjà pris';
      }
      
      console.log('[API /users] User already exists:', { 
        email, 
        username, 
        existingEmail: existingUser.email, 
        existingUsername: existingUser.username 
      });
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName: displayName || username,
      }
    });

    // Create solo statistics separately
    await prisma.soloStatistics.create({
      data: { 
        userId: user.id, 
        weakPoints: JSON.stringify([]), 
        eloHistory: JSON.stringify([{ date: new Date().toISOString(), elo: 400 }]) 
      }
    });

    // Create multiplayer statistics separately
    await prisma.multiplayerStatistics.create({
      data: { 
        userId: user.id,
        headToHead: JSON.stringify([])
      }
    });

    // Fetch user with both statistics
    const userWithStats = await prisma.user.findUnique({ 
      where: { id: user.id }, 
      include: { 
        soloStatistics: true,
        multiplayerStatistics: true
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
        soloElo: true,
        soloRankClass: true,
        soloBestElo: true,
        soloBestRankClass: true,
        multiplayerElo: true,
        multiplayerRankClass: true,
        multiplayerBestElo: true,
        multiplayerBestRankClass: true,
        hasCompletedOnboarding: true,
        isOnline: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
        soloStatistics: true,
        userBadges: {
          select: {
            id: true,
            earnedAt: true,
            badge: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                category: true,
                rarity: true,
                condition: true,
                createdAt: true
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

// DELETE /api/users - Delete user account
export async function DELETE(req: NextRequest) {
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

    // Delete user and related data
    await prisma.user.delete({
      where: { id: currentUser.id }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
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
