import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEloChange, getRankFromElo, clampElo } from '~lib/elo';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AchievementService } from '@/lib/achievement-service';

// POST /api/tests/[id]/complete - Complete a test with new ELO algorithm
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, soloCurrentStreak: true, lastTestDate: true, soloElo: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: testId } = await params;
    const body = await req.json();
    const { answers, timeTaken } = body;

    // Get test with questions
    const test = await prisma.soloTest.findUnique({
      where: { id: testId },
      include: {
        questions: true,
        user: true
      }
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    if (test.userId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build isCorrectArray and get difficulties
    let correctCount = 0;
    const questionUpdates = [];
    const isCorrectArray: boolean[] = [];
    const difficulties: number[] = [];
    
    for (let i = 0; i < test.questions.length; i++) {
      const question = test.questions[i];
      const userAnswer = answers[i] || '';
      const isCorrect = userAnswer.trim() === question.answer.trim();
      isCorrectArray.push(isCorrect);
      difficulties.push(question.difficulty || 5);
      
      if (isCorrect) correctCount++;

      questionUpdates.push(
        prisma.soloQuestion.update({
          where: { id: question.id },
          data: {
            userAnswer,
            isCorrect
          }
        })
      );
    }

    // Execute all question updates
    await Promise.all(questionUpdates);

    // Calculate score
    const rawScore = (correctCount / test.totalQuestions) * 100;
    const score = Math.min(100, Math.max(0, Math.round(rawScore)));
    
    // Calculate time bonus with custom formula
    const baseTime = Math.max(0, 120 - timeTaken);
    
    let timeBonus = 0;
    if (correctCount === 0) {
      timeBonus = -baseTime;
    } else if (correctCount < 10) {
      timeBonus = -Math.round(baseTime / correctCount);
    } else if (correctCount === test.totalQuestions) {
      timeBonus = baseTime + 20;
    } else {
      timeBonus = Math.round(baseTime / (test.totalQuestions - correctCount));
    }

    // ---- NOUVEL ALGORITHME ELO : calcul question par question ----
    let eloChange = 0;
    let simulatedElo = test.user.soloElo;
    let streak = currentUser.soloCurrentStreak;
    const perQuestionTime = timeTaken / test.totalQuestions;
    const maxTime = 60; // placeholder max time per question

    // Map difficulty (1-10) to ELO equivalent
    const difficultyToElo = (d: number) => clampElo(400 + (d - 1) * 320);

    for (let i = 0; i < test.totalQuestions; i++) {
      const qElo = difficultyToElo(difficulties[i]);
      const scoreReal = isCorrectArray[i] ? 1 : 0;
      const delta = calculateEloChange(
        simulatedElo,
        qElo,
        scoreReal,
        perQuestionTime,
        maxTime,
        streak,
        false // solo mode
      );
      eloChange += delta;
      simulatedElo += delta;
      streak = scoreReal === 1 ? streak + 1 : 0;
    }

    const newElo = clampElo(test.user.soloElo + eloChange);
    const newRank = getRankFromElo(newElo);

    // Check streak
    let newStreak = currentUser.soloCurrentStreak;
    let isStreakTest = false;
    
    if (score >= 80) {
      const lastTest = currentUser.lastTestDate;
      const today = new Date();
      
      if (lastTest) {
        const lastDate = new Date(lastTest);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
          isStreakTest = true;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 0;
    }

    // Update test
    const updatedTest = await prisma.soloTest.update({
      where: { id: testId },
      data: {
        completedAt: new Date(),
        correctAnswers: correctCount,
        score,
        timeTaken,
        timeBonus,
        eloAfter: newElo,
        eloChange,
        isPerfect: score === 100,
        isStreakTest
      },
      include: {
        questions: true
      }
    });

    // Update user
    await prisma.user.update({
      where: { id: test.userId },
      data: {
        soloElo: newElo,
        soloRankClass: newRank,
        soloBestElo: Math.max(test.user.soloBestElo || 0, newElo),
        soloBestRankClass: newElo > (test.user.soloBestElo || 0) ? newRank : (test.user.soloBestRankClass || 'F-'),
        soloCurrentStreak: newStreak,
        soloBestStreak: Math.max(newStreak, currentUser.soloCurrentStreak),
        lastTestDate: new Date()
      }
    });

    // Update statistics
    await updateStatistics(test.userId, test, score, correctCount);

    // Check and award badges automatically
    await AchievementService.checkRankAchievement(test.userId, newRank);
    await AchievementService.checkPerfectTestAchievement(test.userId, score, test.totalQuestions);
    await AchievementService.checkSoloGamesAchievements(test.userId);

    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error('Error completing test:', error);
    return NextResponse.json({ error: 'Failed to complete test' }, { status: 500 });
  }
}

async function updateStatistics(
  userId: string,
  test: any,
  score: number,
  correctCount: number
) {
  const existingStats = await prisma.soloStatistics.findUnique({
    where: { userId }
  });

  if (existingStats) {
    const newTotalTests = existingStats.totalTests + 1;
    const newTotalCorrect = existingStats.totalCorrect + correctCount;
    const newTotalQuestions = existingStats.totalQuestions + test.totalQuestions;
    const newTotalTime = existingStats.totalTime + test.timeTaken;
    
    const newAverageScore = ((existingStats.averageScore * existingStats.totalTests) + score) / newTotalTests;
    const newAverageTime = ((existingStats.averageTime * existingStats.totalTests) + test.timeTaken) / newTotalTests;

    await prisma.soloStatistics.update({
      where: { userId },
      data: {
        totalTests: newTotalTests,
        totalQuestions: newTotalQuestions,
        totalCorrect: newTotalCorrect,
        totalTime: newTotalTime,
        averageScore: newAverageScore,
        averageTime: newAverageTime,
        additionTests: existingStats.additionTests + test.questions.filter((q: any) => q.type === 'addition').length,
        additionCorrect: existingStats.additionCorrect + test.questions.filter((q: any) => q.type === 'addition' && q.isCorrect).length,
        additionTotal: existingStats.additionTotal + test.questions.filter((q: any) => q.type === 'addition').length,
      }
    });
  } else {
    await prisma.soloStatistics.create({
      data: {
        userId,
        totalTests: 1,
        totalQuestions: test.totalQuestions,
        totalCorrect: correctCount,
        totalTime: test.timeTaken,
        averageScore: score,
        averageTime: test.timeTaken,
      }
    });
  }
}
