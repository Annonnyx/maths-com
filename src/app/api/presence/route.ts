import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/presence - Update user's online status
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isOnline } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update online status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: isOnline ?? true,
        lastSeenAt: new Date()
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating presence:', error);
    return NextResponse.json(
      { error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}

// GET /api/presence - Get online status of friends
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all friends with their online status
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id }
        ],
        status: 'accepted'
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            isOnline: true,
            lastSeenAt: true
          }
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            isOnline: true,
            lastSeenAt: true
          }
        }
      }
    });

    // Format to get the other user (friend)
    const friends = friendships.map(f => {
      const isUser1 = f.user1Id === user.id;
      const friend = isUser1 ? f.user2 : f.user1;
      return {
        id: friend.id,
        username: friend.username,
        displayName: friend.displayName,
        isOnline: friend.isOnline,
        lastSeenAt: friend.lastSeenAt
      };
    });

    return NextResponse.json({ friends });

  } catch (error) {
    console.error('Error getting presence:', error);
    return NextResponse.json(
      { error: 'Failed to get presence' },
      { status: 500 }
    );
  }
}
