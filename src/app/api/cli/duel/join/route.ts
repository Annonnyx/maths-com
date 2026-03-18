import { NextRequest, NextResponse } from 'next/server'
import { authenticateCliKey } from '@/lib/cli-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateCliKey(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { joinCode } = body

    if (!joinCode || typeof joinCode !== 'string') {
      return NextResponse.json({ error: 'Code de rejoindre invalide' }, { status: 400 })
    }

    // Vérifier si l'utilisateur est déjà dans une partie
    const existingGame = await prisma.multiplayerGame.findFirst({
      where: {
        OR: [
          { player1Id: user.id, status: { in: ['waiting', 'playing'] } },
          { player2Id: user.id, status: { in: ['waiting', 'playing'] } }
        ]
      }
    })

    if (existingGame) {
      return NextResponse.json({ 
        error: 'Vous êtes déjà dans une partie',
        gameId: existingGame.id,
        status: existingGame.status 
      }, { status: 400 })
    }

    // Chercher une partie en attente avec ce code
    // Pour simplifier, on cherche par status 'waiting' et gameType 'casual_1v1'
    const waitingGames = await prisma.multiplayerGame.findMany({
      where: {
        status: 'waiting',
        player2Id: null,
        player1Id: { not: user.id },
        gameType: 'casual_1v1'
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    // Pour l'instant, on prend la première partie en attente
    // Dans une version améliorée, on pourrait utiliser le joinCode pour trouver la partie exacte
    const game = waitingGames[0]

    if (!game) {
      return NextResponse.json({ error: 'Aucune partie disponible' }, { status: 404 })
    }

    // Rejoindre la partie
    const updatedGame = await prisma.multiplayerGame.update({
      where: { id: game.id },
      data: {
        player2Id: user.id,
        player2Elo: user.multiplayerElo,
        status: 'playing',
        startedAt: new Date()
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        player2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            multiplayerElo: true,
            multiplayerRankClass: true
          }
        },
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    // Mettre à jour le statut en ligne de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeenAt: new Date() }
    })

    // Formater la première question pour la réponse
    const firstQuestion = updatedGame.questions[0]
    const formattedQuestion = {
      id: firstQuestion.id,
      question: firstQuestion.question,
      type: firstQuestion.type,
      difficulty: firstQuestion.difficulty,
      order: firstQuestion.order,
      timeLimit: Math.floor(updatedGame.timeLimit / updatedGame.questionCount) // Temps par question
    }

    return NextResponse.json({
      gameId: updatedGame.id,
      opponent: {
        username: updatedGame.player1.username,
        multiplayerElo: updatedGame.player1.multiplayerElo
      },
      status: 'playing',
      timeControl: updatedGame.timeControl,
      timeLimit: updatedGame.timeLimit,
      questionCount: updatedGame.questionCount,
      firstQuestion: formattedQuestion
    })
  } catch (error) {
    console.error('Erreur rejoindre duel CLI:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
