import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { QuestionGeneratorFactory } from '@/lib/question-generators';

// POST /api/game/group/[sessionId]/start - Démarrer une session de groupe avec questions synchronisées
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
      return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
    }

    if (gameSession.status !== 'waiting') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }

    // Utiliser une difficulté mixte fixe pour les jeux de groupe (no ELO)
    const difficulty = 5; // Mixed difficulty for group games
    
    // Générer 10 questions synchronisées
    const questions = QuestionGeneratorFactory.generateMixedQuestions(difficulty, 10);

    // Sauvegarder les questions dans la base de données
    const savedQuestions = await Promise.all(
      questions.map((q, index) =>
        prisma.kahootQuestion.create({
          data: {
            sessionId,
            question: q.question,
            answer: q.correct,
            type: q.answers[0], // Pour l'instant, on utilise la première réponse comme type
            difficulty: q.difficulty,
            order: index
          }
        })
      )
    );

    // Mettre à jour le statut de la session
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { 
        status: 'active',
        currentQuestionIndex: 0
      }
    });

    return NextResponse.json({
      success: true,
      questions: savedQuestions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        difficulty: q.difficulty,
        order: q.order
      }))
    });

  } catch (error) {
    console.error('Error starting group game:', error);
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
