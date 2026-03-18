import { NextRequest, NextResponse } from 'next/server'
import { authenticateCliKey } from '@/lib/cli-auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params
    const user = await authenticateCliKey(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { questionIndex, answer, timeTaken } = body

    // Valider les paramètres
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return NextResponse.json({ error: 'Index de question invalide' }, { status: 400 })
    }

    if (!answer || typeof answer !== 'string') {
      return NextResponse.json({ error: 'Réponse invalide' }, { status: 400 })
    }

    if (typeof timeTaken !== 'number' || timeTaken < 0) {
      return NextResponse.json({ error: 'Temps invalide' }, { status: 400 })
    }

    // Récupérer la partie
    const game = await prisma.multiplayerGame.findFirst({
      where: {
        id: gameId,
        status: 'playing',
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ]
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            multiplayerElo: true
          }
        },
        player2: {
          select: {
            id: true,
            username: true,
            multiplayerElo: true
          }
        },
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!game) {
      return NextResponse.json({ error: 'Partie non trouvée ou terminée' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est bien dans cette partie
    const isPlayer1 = game.player1Id === user.id
    const isPlayer2 = game.player2Id === user.id

    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json({ error: 'Vous ne participez pas à cette partie' }, { status: 403 })
    }

    // Vérifier que la question existe
    if (questionIndex >= game.questions.length) {
      return NextResponse.json({ error: 'Index de question hors limites' }, { status: 400 })
    }

    const question = game.questions[questionIndex]

    // Normaliser la réponse pour la comparaison
    const normalizedAnswer = normalizeAnswer(answer)
    const normalizedCorrectAnswer = normalizeAnswer(question.answer)
    const isCorrect = normalizedAnswer === normalizedCorrectAnswer

    // Mettre à jour la réponse du joueur
    const updateData: any = {}
    if (isPlayer1) {
      updateData.player1Answer = answer
      updateData.player1Time = timeTaken
      updateData.player1Correct = isCorrect
    } else {
      updateData.player2Answer = answer
      updateData.player2Time = timeTaken
      updateData.player2Correct = isCorrect
    }

    await prisma.multiplayerQuestion.update({
      where: { id: question.id },
      data: updateData
    })

    // Calculer les scores actuels
    let player1Score = 0
    let player2Score = 0

    for (const q of game.questions) {
      if (q.player1Correct) player1Score++
      if (q.player2Correct) player2Score++
    }

    // Préparer la réponse
    const response: any = {
      isCorrect,
      correctAnswer: question.answer,
      yourScore: isPlayer1 ? player1Score : player2Score,
      opponentScore: isPlayer1 ? player2Score : player1Score
    }

    // Ajouter la prochaine question si elle existe
    const nextQuestionIndex = questionIndex + 1
    if (nextQuestionIndex < game.questions.length) {
      const nextQuestion = game.questions[nextQuestionIndex]
      response.nextQuestion = {
        id: nextQuestion.id,
        question: nextQuestion.question,
        type: nextQuestion.type,
        difficulty: nextQuestion.difficulty,
        order: nextQuestion.order,
        timeLimit: Math.floor(game.timeLimit / game.questionCount)
      }
    } else {
      response.nextQuestion = null
      // Si c'est la dernière question, vérifier si la partie est terminée
      await checkGameEnd(game.id)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erreur réponse duel CLI:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Fonction pour normaliser les réponses
function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(',', '.')
}

// Fonction pour vérifier si la partie est terminée
async function checkGameEnd(gameId: string) {
  const game = await prisma.multiplayerGame.findUnique({
    where: { id: gameId },
    include: {
      questions: true
    }
  })

  if (!game) return

  // Vérifier si toutes les questions ont été répondues par les deux joueurs
  const allAnswered = game.questions.every(q => 
    q.player1Answer !== null && q.player2Answer !== null
  )

  if (allAnswered) {
    // Calculer le score final
    let player1Score = 0
    let player2Score = 0

    for (const q of game.questions) {
      if (q.player1Correct) player1Score++
      if (q.player2Correct) player2Score++
    }

    // Déterminer le gagnant
    let winner: string | null = null
    if (player1Score > player2Score) winner = game.player1Id
    else if (player2Score > player1Score) winner = game.player2Id

    // Mettre à jour la partie
    await prisma.multiplayerGame.update({
      where: { id: gameId },
      data: {
        status: 'finished',
        finishedAt: new Date(),
        player1Score,
        player2Score,
        winner
      }
    })
  }
}
