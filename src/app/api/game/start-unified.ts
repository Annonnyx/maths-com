// API ROUTE UNIFIÉE - DÉMARRER UNE PARTIE
// Mettre à jour /src/app/api/game/start/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { QuestionGeneratorFactory } from '@/lib/question-generators';

// POST /api/game/start - Démarrer une session de jeu unifiée
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();

    // Récupérer la session de jeu
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: { 
        host: true,
        players: {
          include: { user: true }
        }
      }
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

    // Calculer la difficulté moyenne basée sur les joueurs
    const avgElo = gameSession.players.reduce((sum, player) => 
      sum + (player.user.multiplayerElo || 400), 0) / gameSession.players.length;
    const difficulty = Math.max(1, Math.min(10, Math.round(avgElo / 100)));

    // Générer les questions selon le mode (temporairement mode groupe uniquement)
    let questions;
    // Pour l'instant, on génère toujours des questions synchronisées
    questions = QuestionGeneratorFactory.generateMixedQuestions(difficulty, 20);

    // Insérer les questions dans la base de données
    const createdQuestions = await prisma.kahootQuestion.createMany({
      data: questions.map((q, index) => ({
        sessionId: gameSession.id,
        question: q.question,
        answer: q.answers[0], // Utiliser la première réponse
        type: 'mixed', // Type par défaut
        difficulty: q.difficulty,
        order: index + 1
      }))
    });

    // Marquer tous les joueurs comme prêts
    await prisma.gamePlayer.updateMany({
      where: { sessionId: gameSession.id },
      data: { isReady: true }
    });

    // Mettre à jour le statut de la session
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        status: 'active'
      }
    });

    return NextResponse.json({
      success: true,
      questionsCreated: createdQuestions.count,
      gameStarted: true
    });

  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}
