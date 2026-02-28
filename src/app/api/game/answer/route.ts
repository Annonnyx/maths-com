import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/game/answer - Soumettre une réponse
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, answer, isCorrect } = body;

    if (!sessionId || answer === undefined || isCorrect === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'sessionId, answer, and isCorrect are required'
      }, { status: 400 });
    }

    // Mettre à jour le score du joueur
    const points = isCorrect ? 10 : 0;
    
    await prisma.$queryRaw`
      UPDATE game_players 
      SET score = score + ${points}
      WHERE session_id = ${sessionId} AND user_id = ${session.user.id}
    `;

    console.log('✅ Answer submitted:', {
      sessionId,
      userId: session.user.id,
      answer,
      isCorrect,
      points
    });

    return NextResponse.json({
      success: true,
      points,
      totalScore: points
    });

  } catch (error: any) {
    console.error('❌ Error submitting answer:', error);
    return NextResponse.json({ 
      error: 'Failed to submit answer',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
