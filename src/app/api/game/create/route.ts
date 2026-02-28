import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/game/create - Créer une nouvelle session de jeu
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { maxPlayers = 20 } = body;

    // Générer un code unique à 6 caractères
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let gameCode = generateCode();
    
    // Vérifier que le code n'existe pas déjà
    let attempts = 0;
    while (attempts < 10) {
      const existingSession = await prisma.$queryRaw<Array<{id: string}>>`
        SELECT id FROM game_sessions WHERE code = ${gameCode}
      `;
      
      if (existingSession.length === 0) {
        break;
      }
      
      gameCode = generateCode();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json({ 
        error: 'Unable to generate unique game code' 
      }, { status: 500 });
    }

    // Créer la session de jeu
    const gameSession = await prisma.$queryRaw<Array<{
      id: string;
      code: string;
      host_id: string;
      status: string;
      max_players: number;
      created_at: Date;
    }>>`
      INSERT INTO game_sessions (code, host_id, status, max_players)
      VALUES (${gameCode}, ${session.user.id}, 'waiting', ${maxPlayers})
      RETURNING *
    `;

    console.log('✅ Game session created:', {
      code: gameCode,
      hostId: session.user.id,
      sessionId: gameSession[0].id
    });

    return NextResponse.json({
      success: true,
      session: gameSession[0],
      joinUrl: `/multiplayer/join?code=${gameCode}`
    });

  } catch (error: any) {
    console.error('❌ Error creating game session:', error);
    return NextResponse.json({ 
      error: 'Failed to create game session',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
