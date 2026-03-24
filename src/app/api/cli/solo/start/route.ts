import { NextRequest, NextResponse } from 'next/server'
import { authenticateCliKey } from '@/lib/cli-auth'
import { AdaptiveQuestionGenerator } from '@/lib/question-generators'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateCliKey(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { difficulty = 'mixed', questionCount = 10, gameType = 'casual' } = body

    // Valider les paramètres
    if (!['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
      return NextResponse.json({ error: 'Difficulté invalide' }, { status: 400 })
    }

    if (![10, 20].includes(questionCount)) {
      return NextResponse.json({ error: 'Nombre de questions invalide' }, { status: 400 })
    }

    if (!['casual', 'training'].includes(gameType)) {
      return NextResponse.json({ error: 'Type de jeu invalide' }, { status: 400 })
    }

    // Créer un test solo temporaire (sera complété plus tard)
    const test = await prisma.soloTest.create({
      data: {
        userId: user.id,
        totalQuestions: questionCount,
        score: 0, // Sera mis à jour à la complétion
        timeTaken: 0, // Sera mis à jour à la complétion
        eloBefore: user.soloElo,
        eloAfter: user.soloElo, // Sera mis à jour à la complétion
        eloChange: 0 // Sera mis à jour à la complétion
      }
    })

    // Générer les questions en utilisant question-generators (unifié avec le site web)
    const generator = new AdaptiveQuestionGenerator(user.soloElo)
    let questions = generator.generateMixed(questionCount)

    // Formater les questions pour la réponse CLI
    const formattedQuestions = questions.map((q, index) => ({
      id: q.id,
      type: q.type,
      difficulty: q.difficultyElo || 1,
      question: q.question,
      answer: q.answer,
      order: index
    }))

    // Calculer la limite de temps (30 secondes par question en mode casual, 60 en training)
    const timeLimit = gameType === 'casual' ? questionCount * 30 : questionCount * 60

    return NextResponse.json({
      testId: test.id,
      questions: formattedQuestions,
      timeLimit,
      startedAt: test.startedAt.toISOString()
    })
  } catch (error) {
    console.error('Erreur démarrage solo CLI:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
