import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/game/group/question/[sessionId] - Récupérer toutes les questions d'une session de groupe
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
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId }
    });

    if (!gameSession) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    if (gameSession.status !== 'active') {
      return NextResponse.json({ error: 'Game not active' }, { status: 400 });
    }

    // Récupérer toutes les questions de la session, triées par ordre
    const questions = await prisma.gameQuestion.findMany({
      where: { sessionId },
      orderBy: { order: 'asc' }
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions found' }, { status: 404 });
    }

    return NextResponse.json({
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        type: q.type,
        difficulty: q.difficulty,
        order: q.order
      })),
      currentIndex: gameSession.currentQuestionIndex,
      totalQuestions: questions.length
    });

  } catch (error) {
    console.error('Error fetching group questions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch questions',
      details: (error as Error)?.message || 'Unknown error'
    }, { status: 500 });
  }
}
