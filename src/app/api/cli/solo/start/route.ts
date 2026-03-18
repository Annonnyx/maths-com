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

    // Générer les questions en fonction de la difficulté
    let questions
    const generator = new AdaptiveQuestionGenerator(user.soloElo)

    switch (difficulty) {
      case 'easy':
        // Générer des questions faciles (niveaux CP-CE2)
        questions = []
        for (let i = 0; i < questionCount; i++) {
          const q = generator.generateForLevel('CP')
          questions.push(q)
        }
        break
      case 'medium':
        // Générer des questions moyennes (niveaux CM1-6e)
        questions = []
        for (let i = 0; i < questionCount; i++) {
          const level = i % 2 === 0 ? 'CM1' : '6e'
          const q = generator.generateForLevel(level)
          questions.push(q)
        }
        break
      case 'hard':
        // Générer des questions difficiles (niveaux 5e-Terminale)
        questions = []
        for (let i = 0; i < questionCount; i++) {
          const levels = ['5e', '4e', '3e', '2de', '1re', 'Tle']
          const level = levels[i % levels.length]
          const q = generator.generateForLevel(level as any)
          questions.push(q)
        }
        break
      case 'mixed':
      default:
        // Questions mixtes adaptatives
        questions = generator.generateMixed(questionCount)
        break
    }

    // Formater les questions pour la réponse
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
