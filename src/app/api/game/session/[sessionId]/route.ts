import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/game/session/[sessionId] - Récupérer les informations d'une session
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;

    // Récupérer la session de jeu
    const gameSession = await prisma.$queryRaw<Array<{
      id: string;
      code: string;
      host_id: string;
      status: string;
      max_players: number;
      current_question_index: number;
      created_at: Date;
      updated_at: Date;
    }>>`
      SELECT * FROM game_sessions 
      WHERE id = ${sessionId}
    `;

    if (gameSession.length === 0) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    // Récupérer les joueurs de la session
    const players = await prisma.$queryRaw<Array<{
      id: string;
      session_id: string;
      user_id: string;
      score: number;
      joined_at: Date;
      is_ready: boolean;
      updated_at: Date;
      user: {
        username: string;
        displayName?: string;
      };
    }>>`
      SELECT gp.*, u.username, u.displayName
      FROM game_players gp
      JOIN users u ON gp.user_id = u.id
      WHERE gp.session_id = ${sessionId}
      ORDER BY gp.score DESC
    `;

    return NextResponse.json({
      session: gameSession[0],
      players: players
    });

  } catch (error: any) {
    console.error('Error fetching game session:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch game session',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
