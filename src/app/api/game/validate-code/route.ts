import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/game/validate-code?code=XXXXXX - Vérifier si un code de jeu est valide
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || code.length !== 6) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Code invalide' 
      }, { status: 400 });
    }

    // Vérifier si le code existe et n'est pas expiré (moins de 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const gameSession = await prisma.gameSession.findFirst({
      where: {
        code: code.toUpperCase(),
        createdAt: {
          gte: twentyFourHoursAgo
        },
        status: 'waiting' // Uniquement les parties en attente
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            displayName: true
          }
        },
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        }
      }
    });

    if (!gameSession) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Code introuvable ou expiré (plus de 24h)' 
      });
    }

    return NextResponse.json({
      valid: true,
      session: {
        id: gameSession.id,
        code: gameSession.code,
        maxPlayers: gameSession.maxPlayers,
        currentPlayers: gameSession.players.length,
        host: gameSession.host,
        createdAt: gameSession.createdAt,
        expiresAt: new Date(gameSession.createdAt.getTime() + 24 * 60 * 60 * 1000)
      }
    });

  } catch (error) {
    console.error('Error validating game code:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
