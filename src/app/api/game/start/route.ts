import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/game/start - Démarrer une session de jeu
export async function POST(req: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions);
    
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ 
        error: 'Missing session ID',
        details: 'sessionId is required'
      }, { status: 400 });
    }

    // Vérifier que l'utilisateur est l'hôte de la partie
    const gameSession = await prisma.$queryRaw<Array<{
      id: string;
      host_id: string;
      status: string;
    }>>`
      SELECT id, host_id, status FROM game_sessions 
      WHERE id = ${sessionId}
    `;

    if (gameSession.length === 0) {
      return NextResponse.json({ 
        error: 'Game session not found',
        details: 'No game session found with this ID'
      }, { status: 404 });
    }

    const sessionData = gameSession[0];

    if (sessionData.host_id !== authSession.user.id) {
      return NextResponse.json({ 
        error: 'Not authorized',
        details: 'Only the host can start the game'
      }, { status: 403 });
    }

    if (sessionData.status !== 'waiting') {
      return NextResponse.json({ 
        error: 'Game already started',
        details: 'This game has already been started'
      }, { status: 400 });
    }

    // Mettre à jour le statut de la session
    await prisma.$queryRaw`
      UPDATE game_sessions 
      SET status = 'active', updated_at = NOW()
      WHERE id = ${sessionId}
    `;

    console.log('✅ Game started:', {
      sessionId,
      hostId: authSession.user.id
    });

    return NextResponse.json({
      success: true,
      message: 'Game started successfully'
    });

  } catch (error: any) {
    console.error('❌ Error starting game:', error);
    return NextResponse.json({ 
      error: 'Failed to start game',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
