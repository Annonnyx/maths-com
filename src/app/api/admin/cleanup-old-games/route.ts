import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/cleanup-old-games - Nettoyer les anciennes sessions de jeu
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: session?.user?.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Supprimer les sessions de jeu de plus de 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const deletedSessions = await prisma.gameSession.deleteMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo
        },
        status: {
          in: ['waiting', 'finished'] // Ne pas supprimer les parties en cours
        }
      }
    });

    // Nettoyer aussi les joueurs orphelins
    const deletedPlayers = await prisma.gamePlayer.deleteMany({
      where: {
        session: {
          createdAt: {
            lt: twentyFourHoursAgo
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      deletedSessions: deletedSessions.count,
      deletedPlayers: deletedPlayers.count,
      message: `Nettoyé ${deletedSessions.count} sessions et ${deletedPlayers.count} joueurs de plus de 24h`
    });

  } catch (error) {
    console.error('Error cleaning up old games:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
