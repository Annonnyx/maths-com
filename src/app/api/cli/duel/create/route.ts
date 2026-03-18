import { NextRequest, NextResponse } from 'next/server'
import { authenticateCliKey } from '@/lib/cli-auth'
import { generateMultiplayerQuestions } from '@/lib/question-generators'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateCliKey(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { difficulty = 'mixed', timeControl = 'blitz', questionCount = 10 } = body

    // Valider les paramètres
    if (!['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
      return NextResponse.json({ error: 'Difficulté invalide' }, { status: 400 })
    }

    if (!['bullet', 'blitz', 'rapid'].includes(timeControl)) {
      return NextResponse.json({ error: 'Contrôle du temps invalide' }, { status: 400 })
    }

    if (![10, 20].includes(questionCount)) {
      return NextResponse.json({ error: 'Nombre de questions invalide' }, { status: 400 })
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

    // Générer un code de rejoindre unique
    const joinCode = generateJoinCode()

    // Calculer la limite de temps en fonction du timeControl
    const timeLimitMap = {
      bullet: 60,    // 1 minute
      blitz: 180,    // 3 minutes  
      rapid: 300     // 5 minutes
    }

    // Créer la partie multijoueur privée
    const game = await prisma.multiplayerGame.create({
      data: {
        player1Id: user.id,
        player1Elo: user.multiplayerElo,
        status: 'waiting',
        gameType: 'casual_1v1',
        timeControl,
        timeLimit: timeLimitMap[timeControl as keyof typeof timeLimitMap],
        questionCount,
        difficulty,
        // Générer les questions maintenant pour optimiser
        questions: {
          create: generateMultiplayerQuestions(
            user.multiplayerElo,
            user.multiplayerElo, // En attente d'un adversaire, utiliser le même ELO
            questionCount
          ).map((q, index) => ({
            order: index,
            question: q.question,
            answer: q.answer,
            type: q.type,
            difficulty: q.difficultyElo || 1
          }))
        }
      },
      include: {
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

    return NextResponse.json({
      gameId: game.id,
      joinCode,
      status: 'waiting',
      timeControl,
      timeLimit: timeLimitMap[timeControl as keyof typeof timeLimitMap],
      questionCount
    })
  } catch (error) {
    console.error('Erreur création duel CLI:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Générer un code de rejoindre aléatoire (ex: ABC123)
function generateJoinCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  
  let code = ''
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length))
  }
  
  return code
}
