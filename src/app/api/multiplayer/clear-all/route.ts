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
      select: { id: true, username: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clean up ALL games for this user (both waiting and playing)
    const cleanedGames = await prisma.multiplayerGame.updateMany({
      where: {
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ],
        status: { in: ['waiting', 'playing'] }
      },
      data: {
        status: 'aborted',
        finishedAt: new Date()
      }
    });

    // Also clean up user online status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: false,
        lastSeenAt: new Date()
      }
    });

    console.log(`Cleaned up ${cleanedGames.count} games for user ${user.username}`);

    return NextResponse.json({ 
      success: true,
      cleanedGames: cleanedGames.count,
      message: `${cleanedGames.count} partie(s) nettoyée(s)`
    });

  } catch (error) {
    console.error('Error cleaning all games:', error);
    return NextResponse.json(
      { error: 'Failed to clean games' },
      { status: 500 }
    );
  }
}
