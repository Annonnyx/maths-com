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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // Optional filter by type
    const friendId = searchParams.get('friendId'); // Optional filter by friend

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      OR: [
        { senderId: user.id },
        { receiverId: user.id }
      ]
    };

    if (type) {
      whereClause.type = type;
    }

    if (friendId) {
      whereClause.OR = [
        { senderId: user.id, receiverId: friendId },
        { senderId: friendId, receiverId: user.id }
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              isOnline: true,
              lastSeenAt: true
            }
          },
          receiver: {
            select: {
              id: true,
              username: true,
              displayName: true,
              isOnline: true,
              lastSeenAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({ where: whereClause })
    ]);

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: user.id,
        read: false
      }
    });

    // Group messages by conversation (friend)
    const conversations = new Map<string, any[]>();
    
    messages.forEach(message => {
      const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
      const otherUser = message.senderId === user.id ? message.receiver : message.sender;
      
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, []);
      }
      conversations.get(otherUserId)!.push({
        ...message,
        otherUser
      });
    });

    // Format conversations with latest message and unread count
    const formattedConversations = Array.from(conversations.entries()).map(([friendId, msgs]) => {
      const latestMessage = msgs[0]; // Already sorted by desc
      const unreadInConversation = msgs.filter(m => !m.read && m.receiverId === user.id).length;
      
      return {
        friendId,
        friend: latestMessage.otherUser,
        latestMessage: {
          id: latestMessage.id,
          content: latestMessage.content,
          type: latestMessage.type,
          createdAt: latestMessage.createdAt,
          isFromMe: latestMessage.senderId === user.id
        },
        unreadCount: unreadInConversation,
        totalMessages: msgs.length
      };
    });

    // Sort conversations by latest message
    formattedConversations.sort((a, b) => 
      new Date(b.latestMessage.createdAt).getTime() - new Date(a.latestMessage.createdAt).getTime()
    );

    return NextResponse.json({
      conversations: formattedConversations,
      messages: messages, // For backward compatibility
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
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

    const { receiverId, content, type = 'chat', metadata } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Receiver ID and content are required' }, { status: 400 });
    }

    // Check if users are friends (for chat messages)
    if (type === 'chat') {
      const areFriends = await prisma.friendship.findFirst({
        where: {
          status: 'accepted',
          OR: [
            { user1Id: user.id, user2Id: receiverId },
            { user1Id: receiverId, user2Id: user.id }
          ]
        }
      });

      if (!areFriends) {
        return NextResponse.json({ error: 'Can only send messages to friends' }, { status: 400 });
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content,
        type,
        metadata: metadata ? JSON.stringify(metadata) : null
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            isOnline: true,
            lastSeenAt: true
          }
        },
        receiver: {
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

    return NextResponse.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
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

    const { messageIds, markAll = false, friendId } = await req.json();

    if (markAll && friendId) {
      // Mark all messages from a specific friend as read
      const result = await prisma.message.updateMany({
        where: {
          senderId: friendId,
          receiverId: user.id,
          read: false
        },
        data: {
          read: true
        }
      });

      return NextResponse.json({
        success: true,
        markedAsRead: result.count
      });
    }

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json({ error: 'Message IDs are required' }, { status: 400 });
    }

    // Mark specific messages as read
    const result = await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: user.id,
        read: false
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({
      success: true,
      markedAsRead: result.count
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
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

    const { messageId, deleteAll = false, friendId } = await req.json();

    if (deleteAll && friendId) {
      // Delete all messages from a specific friend
      const result = await prisma.message.deleteMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: friendId },
            { senderId: friendId, receiverId: user.id }
          ]
        }
      });

      return NextResponse.json({
        success: true,
        deletedCount: result.count
      });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Check if user owns the message (as receiver)
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        receiverId: user.id
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId }
    });

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
