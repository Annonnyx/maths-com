import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin-auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const { username } = await req.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens' },
        { status: 400 }
      );
    }

    // Check if username starts with #
    if (username.startsWith('#')) {
      return NextResponse.json(
        { error: 'Username cannot start with #' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Update username
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username
      }
    });
  } catch (error) {
    console.error('Error updating username:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
