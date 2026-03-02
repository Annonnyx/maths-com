import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { soloElo, soloRankClass, hasCompletedOnboarding } = await req.json();

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
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
