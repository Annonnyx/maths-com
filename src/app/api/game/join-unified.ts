// API ROUTE UNIFIÉE - REJOINDRE UNE PARTIE
// Créer /src/app/api/game/join/route.ts

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

    const { code } = await req.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid game code' }, { status: 400 });
    }

    // Trouver la session de jeu
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
      WHERE code = ${code.toUpperCase()} AND status = 'waiting'
    `;

    if (gameSession.length === 0) {
      return NextResponse.json({ error: 'Game not found or already started' }, { status: 404 });
    }

    // Vérifier si le joueur n'est pas déjà dans la partie
    const existingPlayer = await prisma.gamePlayer.findFirst({
      where: {
        sessionId: gameSession[0].id,
        userId: session.user.id
      }
    });

    if (existingPlayer) {
      return NextResponse.json({ error: 'Already in this game' }, { status: 400 });
    }

    // Vérifier si la partie est pleine
    const playerCount = await prisma.gamePlayer.count({
      where: { sessionId: gameSession[0].id }
    });

    if (playerCount >= gameSession[0].max_players) {
      return NextResponse.json({ error: 'Game is full' }, { status: 400 });
    }

    // Ajouter le joueur à la partie
    const player = await prisma.gamePlayer.create({
      data: {
        sessionId: gameSession[0].id,
        userId: session.user.id,
        score: 0,
        isReady: false
      },
      include: {
        user: {
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

    return NextResponse.json({
      success: true,
      session: gameSession[0],
      player
    });

  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}
