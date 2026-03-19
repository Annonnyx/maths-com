import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/friends/requests - Get friend requests for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get incoming friend requests
    const incomingRequests = await prisma.friendship.findMany({
      where: { 
        user2Id: session.user.id,
        status: 'pending'
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            soloElo: true,
            soloRankClass: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get outgoing friend requests
    const outgoingRequests = await prisma.friendship.findMany({
      where: { 
        user1Id: session.user.id,
        status: 'pending'
      },
      include: {
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            soloElo: true,
            soloRankClass: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      incoming: incomingRequests,
      outgoing: outgoingRequests
    });

  } catch (error: any) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch friend requests',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/friends/requests - Send friend request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId || userId === session.user.id) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if already friends or request exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: userId },
          { user1Id: userId, user2Id: session.user.id }
        ]
      }
    });

    if (existingFriendship) {
      return NextResponse.json({ 
        error: 'Friendship already exists or request pending' 
      }, { status: 409 });
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        user1Id: session.user.id,
        user2Id: userId,
        status: 'pending'
      },
      include: {
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            soloElo: true,
            soloRankClass: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      friendship
    });

  } catch (error: any) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ 
      error: 'Failed to send friend request',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
