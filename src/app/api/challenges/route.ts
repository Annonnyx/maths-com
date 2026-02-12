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

    // Get all challenges (sent and received)
    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { challengerId: user.id },
          { challengedId: user.id }
        ]
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            displayName: true,
            isOnline: true,
            lastSeenAt: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        challenged: {
          select: {
            id: true,
            username: true,
            displayName: true,
            isOnline: true,
            lastSeenAt: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format challenges to show the other user
    const formattedChallenges = challenges.map(challenge => {
      const isChallenger = challenge.challengerId === user.id;
      const opponent = isChallenger ? challenge.challenged : challenge.challenger;
      
      return {
        id: challenge.id,
        status: challenge.status,
        gameType: challenge.gameType,
        timeControl: challenge.timeControl,
        timeLimit: challenge.timeLimit,
        questionCount: challenge.questionCount,
        difficulty: challenge.difficulty,
        createdAt: challenge.createdAt,
        expiresAt: challenge.expiresAt,
        respondedAt: challenge.respondedAt,
        isChallenger,
        opponent,
        game: null // Remove gameId reference for now
      };
    });

    // Separate by status
    const pendingReceived = formattedChallenges.filter(c => c.status === 'pending' && !c.isChallenger);
    const pendingSent = formattedChallenges.filter(c => c.status === 'pending' && c.isChallenger);
    const accepted = formattedChallenges.filter(c => c.status === 'accepted');
    const declined = formattedChallenges.filter(c => c.status === 'declined');
    const expired = formattedChallenges.filter(c => c.status === 'expired');

    return NextResponse.json({
      challenges: formattedChallenges,
      pendingReceived,
      pendingSent,
      accepted,
      declined,
      expired
    });
  } catch (error) {
    console.error('Error getting challenges:', error);
    return NextResponse.json(
      { error: 'Failed to get challenges' },
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

    const { challengedId, gameType, timeControl, timeLimit, questionCount, difficulty } = await req.json();

    if (!challengedId || !gameType || !timeControl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if users are friends
    const areFriends = await prisma.friendship.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { user1Id: user.id, user2Id: challengedId },
          { user1Id: challengedId, user2Id: user.id }
        ]
      }
    });

    if (!areFriends) {
      return NextResponse.json({ error: 'You can only challenge friends' }, { status: 400 });
    }

    // Check if there's already a pending challenge between these users
    const existingChallenge = await prisma.challenge.findFirst({
      where: {
        status: 'pending',
        OR: [
          { challengerId: user.id, challengedId },
          { challengerId: challengedId, challengedId: user.id }
        ]
      }
    });

    if (existingChallenge) {
      return NextResponse.json({ error: 'A challenge is already pending between you' }, { status: 400 });
    }

    // Create challenge
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Challenges expire in 24 hours

    const challenge = await prisma.challenge.create({
      data: {
        challengerId: user.id,
        challengedId,
        gameType,
        timeControl,
        timeLimit: timeLimit || 180, // Default 3 minutes
        questionCount: questionCount || 20,
        difficulty: difficulty || 'mixed',
        expiresAt
      },
      include: {
        challenger: {
          select: {
            id: true,
            username: true,
            displayName: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        challenged: {
          select: {
            id: true,
            username: true,
            displayName: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        }
      }
    });

    // Create notification message
    await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: challengedId,
        content: `te défi en ${gameType === 'ranked' ? 'classé' : 'amical'} (${timeControl})`,
        type: 'challenge',
        metadata: JSON.stringify({
          challengeId: challenge.id,
          gameType,
          timeControl
        })
      }
    });

    return NextResponse.json({
      success: true,
      challenge
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
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

    const { challengeId, action } = await req.json();

    if (!challengeId || !action) {
      return NextResponse.json({ error: 'Challenge ID and action are required' }, { status: 400 });
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the challenge
    const challenge = await prisma.challenge.findFirst({
      where: {
        id: challengeId,
        challengedId: user.id, // Only the challenged user can respond
        status: 'pending'
      }
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    let updatedChallenge;

    if (action === 'accept') {
      // Create multiplayer game
      const game = await prisma.multiplayerGame.create({
        data: {
          player1Id: challenge.challengerId,
          player2Id: challenge.challengedId,
          status: 'waiting',
          gameType: challenge.gameType,
          timeControl: challenge.timeControl,
          timeLimit: challenge.timeLimit,
          questionCount: challenge.questionCount,
          difficulty: challenge.difficulty,
          player1Elo: 0, // Will be updated when players join
          player2Elo: 0
        }
      });

      // Update challenge
      updatedChallenge = await prisma.challenge.update({
        where: { id: challengeId },
        data: { 
          status: 'accepted',
          respondedAt: new Date()
        }
      });

      // Create notification
      await prisma.message.create({
        data: {
          senderId: user.id,
          receiverId: challenge.challengerId,
          content: 'a accepté ton défi !',
          type: 'challenge_accepted',
          metadata: JSON.stringify({
            challengeId: challenge.id,
            gameId: game.id
          })
        }
      });
    } else {
      // Decline challenge
      updatedChallenge = await prisma.challenge.update({
        where: { id: challengeId },
        data: { 
          status: 'declined',
          respondedAt: new Date()
        }
      });

      // Create notification
      await prisma.message.create({
        data: {
          senderId: user.id,
          receiverId: challenge.challengerId,
          content: 'a décliné ton défi',
          type: 'challenge_declined',
          metadata: JSON.stringify({
            challengeId: challenge.id
          })
        }
      });
    }

    return NextResponse.json({
      success: true,
      action,
      challenge: updatedChallenge
    });
  } catch (error) {
    console.error('Error responding to challenge:', error);
    return NextResponse.json(
      { error: 'Failed to respond to challenge' },
      { status: 500 }
    );
  }
}
