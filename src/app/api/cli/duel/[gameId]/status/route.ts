import { NextRequest, NextResponse } from 'next/server'
import { authenticateCliKey } from '@/lib/cli-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await context.params
    const user = await authenticateCliKey(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la partie
    const game = await prisma.multiplayerGame.findFirst({
      where: {
        id: gameId,
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
      return NextResponse.json({ error: 'Partie non trouvée' }, { status: 404 })
    }

    // Calculer les scores actuels
    let player1Score = 0
    let player2Score = 0
    let currentQuestion = 0

    for (let i = 0; i < game.questions.length; i++) {
      const q = game.questions[i]
      
      // Compter les scores
      if (q.player1Correct) player1Score++
      if (q.player2Correct) player2Score++
      
      // Déterminer la question actuelle (première question sans réponse de l'utilisateur)
      const isPlayer1 = game.player1Id === user.id
      const hasAnswered = isPlayer1 ? q.player1Answer !== null : q.player2Answer !== null
      
      if (!hasAnswered && currentQuestion === 0) {
        currentQuestion = i + 1 // 1-based index pour l'affichage
      }
    }

    // Déterminer le score de l'utilisateur et de l'adversaire
    const isPlayer1 = game.player1Id === user.id
    const yourScore = isPlayer1 ? player1Score : player2Score
    const opponentScore = isPlayer1 ? player2Score : player1Score

    // Préparer la réponse
    const response: any = {
      status: game.status,
      yourScore,
      opponentScore,
      totalQuestions: game.questionCount
    }

    // Ajouter des informations supplémentaires selon le statut
    if (game.status === 'waiting') {
      response.waitingForOpponent = true
      response.joinCode = 'ABC123' // Placeholder, devrait être stocké avec la partie
    } else if (game.status === 'playing') {
      response.currentQuestion = currentQuestion
      response.timeLimit = game.timeLimit
      response.timeControl = game.timeControl
    } else if (game.status === 'finished') {
      response.winner = game.winner === user.id ? 'you' : (game.winner ? 'opponent' : 'draw')
      response.finalScores = {
        you: yourScore,
        opponent: opponentScore
      }
      response.finishedAt = game.finishedAt
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erreur statut duel CLI:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
