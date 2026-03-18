import { NextRequest, NextResponse } from 'next/server'
import { authenticateCliKey } from '@/lib/cli-auth'
import { calculateEloChange, getRankFromElo, clampElo } from '@/lib/elo'
import { prisma } from '@/lib/prisma'
import { AchievementService } from '@/lib/achievement-service'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await context.params
    const user = await authenticateCliKey(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { answers, timeTaken } = body

    // Valider que le test appartient bien à l'utilisateur
    const test = await prisma.soloTest.findFirst({
      where: {
        id: testId,
        userId: user.id
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test non trouvé' }, { status: 404 })
    }

    if (test.completedAt) {
      return NextResponse.json({ error: 'Test déjà complété' }, { status: 400 })
    }

    // Traiter les réponses
    let correct = 0
    const questionResults = answers.map((answer: any) => {
      const isCorrect = normalizeAnswer(answer.answer) === normalizeAnswer(answer.correctAnswer)
      if (isCorrect) correct++
      
      return {
        type: answer.type || 'numeric',
        difficulty: answer.difficulty || 1,
        question: answer.question,
        answer: answer.correctAnswer,
        userAnswer: answer.answer,
        isCorrect,
        timeTaken: answer.timeTaken || 0,
        order: answer.order
      }
    })

    const score = Math.round((correct / answers.length) * 100)

    // Calculer le changement ELO
    let eloBefore = user.soloElo
    let eloAfter = eloBefore
    let eloChange = 0

    // Utiliser l'algorithme ELO existant
    const maxTime = 60 // temps moyen par question

    for (let i = 0; i < questionResults.length; i++) {
      const questionElo = questionResults[i].difficulty * 200 // Mapping simple
      const scoreReal = questionResults[i].isCorrect ? 1 : 0
      const delta = calculateEloChange(
        eloAfter,
        questionElo,
        scoreReal,
        questionResults[i].timeTaken,
        maxTime,
        user.soloCurrentStreak,
        false // solo mode
      )
      eloChange += delta
      eloAfter += delta
    }

    eloAfter = clampElo(eloAfter)

    // Mettre à jour l'utilisateur
    const newRankClass = getRankFromElo(eloAfter)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        soloElo: eloAfter,
        soloRankClass: newRankClass,
        soloBestElo: Math.max(user.soloBestElo || 0, eloAfter),
        soloBestRankClass: eloAfter > (user.soloBestElo || 0) ? newRankClass : (user.soloBestRankClass || 'F-'),
        soloCurrentStreak: eloChange > 0 ? user.soloCurrentStreak + 1 : 0
      }
    })

    // Mettre à jour le test
    const updatedTest = await prisma.soloTest.update({
      where: { id: testId },
      data: {
        completedAt: new Date(),
        correctAnswers: correct,
        score,
        timeTaken,
        eloBefore,
        eloAfter,
        eloChange,
        isPerfect: correct === answers.length,
        isStreakTest: eloChange > 0,
        questions: {
          create: questionResults
        }
      },
      include: {
        questions: true
      }
    })

    // Vérifier les achievements
    await AchievementService.checkRankAchievement(user.id, newRankClass)
    await AchievementService.checkPerfectTestAchievement(user.id, correct, answers.length)
    await AchievementService.checkSoloGamesAchievements(user.id)

    // Mettre à jour les statistiques
    await prisma.soloStatistics.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalTests: 1,
        totalCorrect: correct,
        totalQuestions: answers.length,
        totalTime: timeTaken,
        averageScore: score,
        averageTime: timeTaken
      },
      update: {
        totalTests: { increment: 1 },
        totalCorrect: { increment: correct },
        totalQuestions: { increment: answers.length },
        totalTime: { increment: timeTaken }
      }
    })

    return NextResponse.json({
      success: true,
      testId: updatedTest.id,
      score,
      correctAnswers: correct,
      totalQuestions: answers.length,
      timeTaken,
      eloBefore,
      eloAfter,
      eloChange,
      isPerfect: correct === answers.length,
      questions: updatedTest.questions
    })
  } catch (error) {
    console.error('Erreur complétion solo CLI:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Fonction pour normaliser les réponses (comparaison flexible)
function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(',', '.')
}
