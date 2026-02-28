import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/game/join - Rejoindre une session de jeu
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json({ 
        error: 'Invalid game code',
        details: 'Code must be exactly 6 characters'
      }, { status: 400 });
    }

    // Vérifier que la session existe et n'est pas pleine
    const gameSession = await prisma.$queryRaw<Array<{
      id: string;
      code: string;
      host_id: string;
      status: string;
      max_players: number;
      created_at: Date;
      current_players: number;
    }>>`
      SELECT gs.*, 
             COUNT(gp.id) as current_players
      FROM game_sessions gs
      LEFT JOIN game_players gp ON gs.id = gp.session_id
      WHERE gs.code = ${code} AND gs.status != 'finished'
      GROUP BY gs.id, gs.code, gs.host_id, gs.status, gs.max_players, gs.created_at
    `;

    if (gameSession.length === 0) {
      return NextResponse.json({ 
        error: 'Game not found',
        details: 'No game session found with this code'
      }, { status: 404 });
    }

    const gameSessionData = gameSession[0];

    if (gameSessionData.status !== 'waiting') {
      return NextResponse.json({ 
        error: 'Game already started',
        details: 'This game has already started or finished'
      }, { status: 400 });
    }

    if (gameSessionData.current_players >= gameSessionData.max_players) {
      return NextResponse.json({ 
        error: 'Game full',
        details: 'This game session is already full'
      }, { status: 400 });
    }

    // Vérifier si le joueur n'est pas déjà dans la session
    const existingPlayer = await prisma.$queryRaw<Array<{id: string}>>`
      SELECT id FROM game_players 
      WHERE session_id = ${gameSessionData.id} AND user_id = ${session.user.id}
    `;

    if (existingPlayer.length > 0) {
      return NextResponse.json({ 
        error: 'Already joined',
        details: 'You are already in this game session'
      }, { status: 400 });
    }

    // Ajouter le joueur à la session
    const player = await prisma.$queryRaw<Array<{
      id: string;
      session_id: string;
      user_id: string;
      score: number;
      joined_at: Date;
      is_ready: boolean;
    }>>`
      INSERT INTO game_players (session_id, user_id, score, is_ready)
      VALUES (${gameSessionData.id}, ${session.user.id}, 0, false)
      RETURNING *
    `;

    console.log('✅ Player joined game:', {
      sessionId: gameSessionData.id,
      userId: session.user.id,
      playerId: player[0].id
    });

    return NextResponse.json({
      success: true,
      session: gameSessionData,
      player: player[0]
    });

  } catch (error: any) {
    console.error('❌ Error joining game:', error);
    return NextResponse.json({ 
      error: 'Failed to join game',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
