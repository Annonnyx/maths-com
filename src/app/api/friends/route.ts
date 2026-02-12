import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get all friendships (both sent and received)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id }
        ]
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
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Format friendships to show the other user
    const formattedFriends = friendships.map(friendship => {
      const isUser1 = friendship.user1Id === user.id;
      const otherUser = isUser1 ? friendship.user2 : friendship.user1;
      
      return {
        id: friendship.id,
        status: friendship.status,
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt,
        user: otherUser,
        isInitiator: isUser1
      };
    });

    // Separate by status
    const acceptedFriends = formattedFriends.filter(f => f.status === 'accepted');
    const pendingRequests = formattedFriends.filter(f => f.status === 'pending' && !f.isInitiator);
    const sentRequests = formattedFriends.filter(f => f.status === 'pending' && f.isInitiator);

    return NextResponse.json({
      friends: acceptedFriends,
      pendingRequests,
      sentRequests
    });
  } catch (error) {
    console.error('Error getting friends:', error);
    return NextResponse.json(
      { error: 'Failed to get friends' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === user.id) {
      return NextResponse.json({ error: 'Cannot add yourself as friend' }, { status: 400 });
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: targetUser.id },
          { user1Id: targetUser.id, user2Id: user.id }
        ]
      }
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      } else if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
      } else if (existingFriendship.status === 'blocked') {
        return NextResponse.json({ error: 'Cannot send friend request' }, { status: 400 });
      }
    }

    // Create new friendship request
    const friendship = await prisma.friendship.create({
      data: {
        user1Id: user.id,
        user2Id: targetUser.id,
        status: 'pending'
      },
      include: {
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

    // Create notification message
    await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: targetUser.id,
        content: `t'envoie une demande d'ami`,
        type: 'friend_request'
      }
    });

    return NextResponse.json({
      success: true,
      friendship: {
        ...friendship,
        user: friendship.user2,
        isInitiator: true
      }
    });
  } catch (error) {
    console.error('Error creating friend request:', error);
    return NextResponse.json(
      { error: 'Failed to create friend request' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    const { friendshipId, action } = await req.json();

    if (!friendshipId || !action) {
      return NextResponse.json({ error: 'Friendship ID and action are required' }, { status: 400 });
    }

    if (!['accept', 'decline', 'block'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: friendshipId,
        user2Id: user.id, // Only the receiver can respond
        status: 'pending'
      }
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    let updatedFriendship;

    switch (action) {
      case 'accept':
        updatedFriendship = await prisma.friendship.update({
          where: { id: friendshipId },
          data: { status: 'accepted', updatedAt: new Date() }
        });
        break;
      case 'decline':
        updatedFriendship = await prisma.friendship.delete({
          where: { id: friendshipId }
        });
        break;
      case 'block':
        updatedFriendship = await prisma.friendship.update({
          where: { id: friendshipId },
          data: { status: 'blocked', updatedAt: new Date() }
        });
        break;
    }

    return NextResponse.json({
      success: true,
      action,
      friendship: updatedFriendship
    });
  } catch (error) {
    console.error('Error updating friendship:', error);
    return NextResponse.json(
      { error: 'Failed to update friendship' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    const { friendshipId } = await req.json();

    if (!friendshipId) {
      return NextResponse.json({ error: 'Friendship ID is required' }, { status: 400 });
    }

    // Check if user is part of this friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: friendshipId,
        OR: [
          { user1Id: user.id },
          { user2Id: user.id }
        ]
      }
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: friendshipId }
    });

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting friendship:', error);
    return NextResponse.json(
      { error: 'Failed to delete friendship' },
      { status: 500 }
    );
  }
}
