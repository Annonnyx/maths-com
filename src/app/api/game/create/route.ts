// API ROUTE UNIFIÉE - CRÉATION DE PARTIE
// Remplacer /src/app/api/game/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GameMode } from '@/types/unified-multiplayer';

// POST /api/game/create - Créer une nouvelle session de jeu unifiée
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      gameMode = 'group_quiz',
      maxPlayers = 20,
      questionCount = 20,
      difficulty = 'mixed',
      timePerQuestion = 10,
      timeControl,
      timeLimit,
      isRanked = false
    } = body;

    // Générer un code unique à 6 caractères (seulement pour mode groupe)
    let joinCode = null;
    if (gameMode === 'group_quiz') {
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      joinCode = generateCode();
      
      // Vérifier que le code n'existe pas déjà
      let attempts = 0;
      while (attempts < 10) {
        const existingSession = await prisma.$queryRaw<Array<{id: string}>>`
          SELECT id FROM game_sessions WHERE code = ${joinCode}
        `;
        
        if (existingSession.length === 0) {
          break;
        }
        
        joinCode = generateCode();
        attempts++;
      }

      if (attempts >= 10) {
        return NextResponse.json({ 
          error: 'Unable to generate unique game code' 
        }, { status: 500 });
      }
    }

    // Créer la session de jeu unifiée (temporairement avec l'ancien schéma)
    const gameSession = await prisma.gameSession.create({
      data: {
        hostId: session.user.id,
        code: joinCode || '', // Utiliser le champ existant 'code'
        maxPlayers,
        status: 'waiting'
      }
    });

    // Générer l'URL de rejoindre si mode groupe
    let joinUrl = null;
    if (joinCode) {
      joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/multiplayer/join?code=${joinCode}`;
    }

    return NextResponse.json({
      success: true,
      session: gameSession,
      joinUrl,
      joinCode
    });

  } catch (error) {
    console.error('Error creating game session:', error);
    return NextResponse.json(
      { error: 'Failed to create game session' },
      { status: 500 }
    );
  }
}
