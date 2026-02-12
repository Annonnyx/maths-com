import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/users - Create a new user (register)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password, displayName } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

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

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
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
      include: {
        statistics: true,
        tests: {
          orderBy: { startedAt: 'desc' },
          take: 5,
          include: {
            questions: {
              select: {
                type: true,
                isCorrect: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/users - Update user
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, displayName, avatarUrl, hasCompletedOnboarding } = body;

    const user = await prisma.user.update({
      where: { id },
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
