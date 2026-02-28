import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/game/kahoot/[sessionId]/next - Passer à la question suivante
export async function POST(
  request: NextRequest,
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
      where: { id: sessionId },
      include: { host: true }
    });

    if (!gameSession) {
      return NextResponse.json({ error: 'Game session not found' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est l'hôte
    if (gameSession.hostId !== session.user.id) {
      return NextResponse.json({ error: 'Only the host can advance questions' }, { status: 403 });
    }

    if (gameSession.status !== 'active') {
      return NextResponse.json({ error: 'Game not active' }, { status: 400 });
    }

    // Compter le nombre total de questions
    const totalQuestions = await prisma.kahootQuestion.count({
      where: { sessionId }
    });

    // Vérifier s'il y a une question suivante
    if (gameSession.currentQuestionIndex >= totalQuestions - 1) {
      // Terminer le jeu
      await prisma.gameSession.update({
        where: { id: sessionId },
        data: { status: 'finished' }
      });

      return NextResponse.json({
        success: true,
        gameFinished: true,
        finalRankings: await getFinalRankings(sessionId)
      });
    }

    // Passer à la question suivante
    const updatedSession = await prisma.gameSession.update({
      where: { id: sessionId },
      data: { 
        currentQuestionIndex: gameSession.currentQuestionIndex + 1
      }
    });

    // Récupérer la nouvelle question
    const nextQuestion = await prisma.kahootQuestion.findFirst({
      where: {
        sessionId,
        order: updatedSession.currentQuestionIndex
      }
    });

    return NextResponse.json({
      success: true,
      currentQuestionIndex: updatedSession.currentQuestionIndex,
      nextQuestion: {
        id: nextQuestion?.id,
        question: nextQuestion?.question,
        type: nextQuestion?.type,
        difficulty: nextQuestion?.difficulty,
        order: nextQuestion?.order
      }
    });

  } catch (error) {
    console.error('Error advancing to next question:', error);
    return NextResponse.json({ error: 'Failed to advance question' }, { status: 500 });
  }
}

async function getFinalRankings(sessionId: string) {
  const players = await prisma.gamePlayer.findMany({
    where: { sessionId },
    include: { user: true },
    orderBy: { score: 'desc' }
  });

  return players.map((player, index) => ({
    rank: index + 1,
    username: player.user.username,
    displayName: player.user.displayName,
    score: player.score,
    avatarUrl: player.user.avatarUrl
  }));
}
