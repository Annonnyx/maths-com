import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/game/kahoot/question/[sessionId] - Récupérer la question actuelle synchronisée
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

    // Récupérer la question actuelle synchronisée
    const currentQuestion = await prisma.kahootQuestion.findFirst({
      where: {
        sessionId,
        order: gameSession.currentQuestionIndex
      }
    });

    if (!currentQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Formater la question pour le frontend
    const { QuestionGeneratorFactory } = await import('@/lib/question-generators');
    const generatedQuestion = QuestionGeneratorFactory.generateQuestion('arithmetic', currentQuestion.difficulty);

    return NextResponse.json({
      question: {
        id: currentQuestion.id,
        question: currentQuestion.question,
        answers: generatedQuestion.answers,
        correct: currentQuestion.answer,
        type: currentQuestion.type,
        difficulty: currentQuestion.difficulty,
        order: currentQuestion.order,
        timeLimit: 30 // 30 secondes par question
      },
      currentIndex: gameSession.currentQuestionIndex,
      totalQuestions: await prisma.kahootQuestion.count({
        where: { sessionId }
      })
    });

  } catch (error) {
    console.error('Error fetching Kahoot question:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch question',
      details: (error as Error)?.message || 'Unknown error'
    }, { status: 500 });
  }
}
