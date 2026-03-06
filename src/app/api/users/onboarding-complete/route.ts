import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Starting onboarding complete API');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Session:', session?.user?.id ? `User ${session.user.id}` : 'No session');
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('🔍 Request body:', body);

    const { soloElo, soloRankClass, hasCompletedOnboarding } = body;

    // Test simple de connexion Prisma
    try {
      const userCount = await prisma.user.count();
      console.log('🔍 Prisma connection test - user count:', userCount);
    } catch (dbError) {
      console.error('❌ Prisma connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Mettre à jour l'utilisateur avec les résultats d'onboarding
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        soloElo: soloElo || 400,
        soloRankClass: soloRankClass || 'F-',
        multiplayerElo: soloElo || 400, // Initialiser multiplayer Elo aussi
        multiplayerRankClass: soloRankClass || 'F-',
        hasCompletedOnboarding: hasCompletedOnboarding ?? true,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        soloElo: true,
        soloRankClass: true,
        multiplayerElo: true,
        multiplayerRankClass: true,
        hasCompletedOnboarding: true,
      }
    });

    console.log(`✅ Onboarding completed for user ${updatedUser.username}: ELO ${updatedUser.soloElo}, Class ${updatedUser.soloRankClass}`);

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error('❌ Error completing onboarding:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
