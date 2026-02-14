import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateAdvancedEloChange, getRankFromElo } from '@/lib/elo';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AchievementService } from '@/lib/achievement-service';

// POST /api/tests - Complete a test and update Elo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const testData = await req.json();
    
    const {
      questions,
      answers,
      timePerQuestion,
      testMode,
      elapsedTime,
      courseType
    } = testData;

    // Calculate results
    let correct = 0;
    const questionResults = questions.map((q: any, i: number) => {
      const isCorrect = q.answer === answers[i];
      if (isCorrect) correct++;
      return {
        type: q.type,
        difficulty: q.difficulty,
        question: q.question,
        answer: q.answer,
        userAnswer: answers[i],
        isCorrect,
        timeTaken: timePerQuestion[i],
        order: i
      };
    });

    const score = Math.round((correct / questions.length) * 100);
    const timeTaken = Math.round(elapsedTime / 1000); // Convert to seconds

    let eloBefore = user.elo;
    let eloAfter = eloBefore;
    let eloChange = 0;

    // Only update Elo for competitive mode
    if (testMode === 'competitive') {
      const eloResult = calculateAdvancedEloChange({
        correctAnswers: correct,
        totalQuestions: questions.length,
        totalTimeSeconds: timeTaken,
        questionTimes: timePerQuestion,
        difficulties: questions.map((q: any) => q.difficulty),
        currentElo: eloBefore,
        streak: user.currentStreak
      });

      eloChange = eloResult.eloChange;
      eloAfter = eloBefore + eloChange;

      // Update user Elo and rank
      const newRankClass = getRankFromElo(eloAfter);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          elo: eloAfter,
          rankClass: newRankClass,
          bestElo: Math.max(user.bestElo, eloAfter),
          bestRankClass: eloAfter > user.bestElo ? newRankClass : user.bestRankClass,
          currentStreak: eloChange > 0 ? user.currentStreak + 1 : 0,
          bestStreak: Math.max(user.bestStreak, eloChange > 0 ? user.currentStreak + 1 : 0),
          lastTestDate: new Date()
        }
      });

      // Check for rank achievement
      await AchievementService.checkRankAchievement(user.id, newRankClass);
    }

    // Create test record
    const test = await prisma.test.create({
      data: {
        userId: user.id,
        completedAt: new Date(),
        totalQuestions: questions.length,
        correctAnswers: correct,
        score,
        timeTaken,
        eloBefore,
        eloAfter,
        eloChange,
        isPerfect: correct === questions.length,
        isStreakTest: testMode === 'competitive' && eloChange > 0,
        questions: {
          create: questionResults
        }
      },
      include: {
        questions: true
      }
    });

    // Check for perfect test achievement
    await AchievementService.checkPerfectTestAchievement(user.id, correct, questions.length);

    // Update statistics
    await prisma.statistics.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalTests: 1,
        totalQuestions: questions.length,
        totalCorrect: correct,
        totalTime: timeTaken,
        averageScore: score,
        averageTime: timeTaken
      },
      update: {
        totalTests: { increment: 1 },
        totalQuestions: { increment: questions.length },
        totalCorrect: { increment: correct },
        totalTime: { increment: timeTaken }
      }
    });

    // Recalculate proper averages
    const stats = await prisma.statistics.findUnique({
      where: { userId: user.id }
    });

    if (stats && stats.totalTests > 0) {
      await prisma.statistics.update({
        where: { userId: user.id },
        data: {
          averageScore: (stats.totalCorrect / stats.totalQuestions) * 100,
          averageTime: stats.totalTime / stats.totalTests
        }
      });
    }

    // Check for solo games achievements
    await AchievementService.checkSoloGamesAchievements(user.id);

    return NextResponse.json({
      success: true,
      test: {
        id: test.id,
        score,
        correct,
        total: questions.length,
        timeTaken,
        eloChange,
        eloBefore,
        eloAfter,
        mode: testMode
      }
    });

  } catch (error) {
    console.error('Error saving test:', error);
    return NextResponse.json(
      { error: 'Failed to save test results' },
      { status: 500 }
    );
  }
}

// GET /api/tests - Get user's tests
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (userId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tests = await prisma.test.findMany({
      where: { userId },
      include: {
        questions: true
      },
      orderBy: {
        startedAt: 'desc'
      }
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}
