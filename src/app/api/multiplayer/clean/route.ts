import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Clean up old games for this user
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const cleanedGames = await prisma.multiplayerGame.updateMany({
      where: {
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ],
        status: 'playing',
        createdAt: { lt: thirtyMinutesAgo }
      },
      data: {
        status: 'aborted',
        finishedAt: new Date()
      }
    });

    // Also clean up waiting games older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const cleanedWaitingGames = await prisma.multiplayerGame.updateMany({
      where: {
        player1Id: user.id,
        status: 'waiting',
        createdAt: { lt: fiveMinutesAgo }
      },
      data: {
        status: 'aborted',
        finishedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      cleanedPlayingGames: cleanedGames.count,
      cleanedWaitingGames: cleanedWaitingGames.count
    });

  } catch (error) {
    console.error('Error cleaning games:', error);
    return NextResponse.json(
      { error: 'Failed to clean games' },
      { status: 500 }
    );
  }
}
