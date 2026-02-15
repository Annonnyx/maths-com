import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEloChange, getRankFromElo } from '@/lib/elo';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AchievementService } from '@/lib/achievement-service';

// POST /api/tests/[id]/complete - Complete a test
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
      select: { id: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: testId } = await params;
    const body = await req.json();
    const { answers, timeTaken } = body;

    // Get test with questions
    const test = await prisma.test.findUnique({
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

    // Calculate results
    let correctCount = 0;
    const questionUpdates = [];

    for (let i = 0; i < test.questions.length; i++) {
      const question = test.questions[i];
      const userAnswer = answers[i] || '';
      const isCorrect = userAnswer.trim() === question.answer.trim();
      
      if (isCorrect) correctCount++;

      questionUpdates.push(
        prisma.question.update({
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

    // Calculate Elo change
    const score = Math.round((correctCount / test.totalQuestions) * 100);
    
    // Calculate time bonus
    const baseTime = Math.max(0, 120 - timeTaken); // Base: 120 - 1 per second
    const roundedBase = Math.ceil(baseTime); // Round up
    
    let timeBonus = 0;
    if (correctCount === 0) {
      // No correct answers = maximum penalty
      timeBonus = -roundedBase;
    } else if (correctCount < 10) {
      // Malus: negative points
      timeBonus = -Math.ceil(roundedBase / correctCount);
    } else {
      // Bonus: positive points
      if (correctCount === test.totalQuestions) {
        // Perfect score: base + 20
        timeBonus = roundedBase + 20;
      } else {
        // Normal bonus: base / (20 - correctCount)
        timeBonus = Math.ceil(roundedBase / (20 - correctCount));
      }
    }
    
    const eloChange = calculateEloChange(
      correctCount,
      test.totalQuestions,
      test.user.currentStreak
    );
    const newElo = Math.max(0, test.user.elo + eloChange);
    const newRank = getRankFromElo(newElo);

    // Check streak
    let newStreak = test.user.currentStreak;
    let isStreakTest = false;
    
    if (score >= 80) {
      // Check if this is consecutive day
      const lastTest = test.user.lastTestDate;
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
    const updatedTest = await prisma.test.update({
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
        elo: newElo,
        rankClass: newRank,
        bestElo: Math.max(test.user.bestElo, newElo),
        bestRankClass: newElo > test.user.bestElo ? newRank : test.user.bestRankClass,
        currentStreak: newStreak,
        bestStreak: Math.max(test.user.bestStreak, newStreak),
        lastTestDate: new Date(),
        // Unlock operations based on new Elo
        additionLevel: newElo >= 400 ? 1 : 0,
        subtractionLevel: newElo >= 500 ? 1 : 0,
        multiplicationLevel: newElo >= 600 ? 1 : 0,
        divisionLevel: newElo >= 750 ? 1 : 0,
        powerLevel: newElo >= 900 ? 1 : 0,
        rootLevel: newElo >= 1050 ? 1 : 0,
        factorizationLevel: newElo >= 1200 ? 1 : 0,
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
  const existingStats = await prisma.statistics.findUnique({
    where: { userId }
  });

  if (existingStats) {
    // Update existing statistics
    const newTotalTests = existingStats.totalTests + 1;
    const newTotalCorrect = existingStats.totalCorrect + correctCount;
    const newTotalQuestions = existingStats.totalQuestions + test.totalQuestions;
    const newTotalTime = existingStats.totalTime + test.timeTaken;
    
    // Calculate new averages
    const newAverageScore = ((existingStats.averageScore * existingStats.totalTests) + score) / newTotalTests;
    const newAverageTime = ((existingStats.averageTime * existingStats.totalTests) + test.timeTaken) / newTotalTests;

    await prisma.statistics.update({
      where: { userId },
      data: {
        totalTests: newTotalTests,
        totalQuestions: newTotalQuestions,
        totalCorrect: newTotalCorrect,
        totalTime: newTotalTime,
        averageScore: newAverageScore,
        averageTime: newAverageTime,
        // Update by operation type
        additionTests: existingStats.additionTests + test.questions.filter((q: any) => q.type === 'addition').length,
        additionCorrect: existingStats.additionCorrect + test.questions.filter((q: any) => q.type === 'addition' && q.isCorrect).length,
        additionTotal: existingStats.additionTotal + test.questions.filter((q: any) => q.type === 'addition').length,
      }
    });
  } else {
    // Create new statistics
    await prisma.statistics.create({
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
