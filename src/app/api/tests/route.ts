import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEloChange, getClassFromElo, clampElo } from '@/lib/elo';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AchievementService } from '@/lib/achievement-service';

// POST /api/tests - Create or Complete a test and update Elo
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
    
    console.log('=== TEST DATA RECEIVED ===');
    console.log('Full testData:', JSON.stringify(testData, null, 2));
    console.log('testMode:', testData.testMode);
    console.log('==========================');
    
    // Check if this is test creation or completion
    const { totalQuestions, testMode, courseType, questions, answers, timePerQuestion, elapsedTime, testId } = testData;
    
    if (questions && answers && testId) {
      // This is test completion - use existing logic
      return await handleTestCompletion(testData, user, questions, answers, timePerQuestion, elapsedTime, testMode);
    } else {
      // This is test creation
      return await handleTestCreation(testData, user, totalQuestions, testMode, courseType);
    }
    
  } catch (error) {
    console.error('Error in tests API:', error);
    return NextResponse.json({ error: 'Failed to process test' }, { status: 500 });
  }
}

async function handleTestCreation(testData: any, user: any, totalQuestions: number, testMode: string, courseType?: string) {
  // Create test in database
  const test = await prisma.soloTest.create({
    data: {
      userId: user.id,
      totalQuestions: totalQuestions || 20,
      score: 0, // Will be updated on completion
      timeTaken: 0, // Will be updated on completion
      eloBefore: user.soloElo || 400,
      eloAfter: user.soloElo || 400, // Will be updated on completion
      eloChange: 0 // Will be updated on completion
    }
  });

  return NextResponse.json({ 
    id: test.id,
    message: 'Test created successfully'
  });
}

async function handleTestCompletion(testData: any, user: any, questions: any[], answers: string[], timePerQuestion: number[], elapsedTime: number, testMode: string) {
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

  const eloBefore = user.soloElo;
  let eloAfter = eloBefore;
  let eloChange = 0;

  // ---- NOUVEL ALGORITHME ELO : calcul question par question ----
  if (testMode === 'competitive') {
    console.log('=== COMPETITIVE MODE DETECTED ===');
    console.log('Test mode:', testMode);
    console.log('Questions count:', questions.length);
    
    let simulatedElo = eloBefore;
    let streak = user.soloCurrentStreak;
    const maxTime = 60; // placeholder

    const difficultyToElo = (d: number) => clampElo(400 + (d - 1) * 320);

    for (let i = 0; i < questions.length; i++) {
      const qElo = difficultyToElo(questions[i].difficulty);
      const scoreReal = questionResults[i].isCorrect ? 1 : 0;
      const delta = calculateEloChange(
        simulatedElo,
        qElo,
        scoreReal,
        timePerQuestion[i],
        maxTime,
        streak,
        false // solo mode
      );
      console.log(`Question ${i+1}: delta=${delta}, simulatedElo=${simulatedElo} -> ${simulatedElo + delta}`);
      eloChange += delta;
      simulatedElo += delta;
      streak = scoreReal === 1 ? streak + 1 : 0;
    }

    eloAfter = clampElo(eloBefore + eloChange);
    console.log('Final eloChange:', eloChange);
    console.log('Final eloAfter:', eloAfter);

    // Update user Elo and rank
    const newFrenchClass = getClassFromElo(eloAfter);
    
    console.log('=== ELO UPDATE DEBUG ===');
    console.log('User ID:', user.id);
    console.log('Elo Before:', eloBefore);
    console.log('Elo Change:', eloChange);
    console.log('Elo After:', eloAfter);
    console.log('New French Class:', newFrenchClass);
    console.log('Current soloElo in DB:', user.soloElo);
    console.log('========================');
    
    const updateResult = await prisma.user.update({
      where: { id: user.id },
      data: {
        soloElo: eloAfter,
        soloClass: newFrenchClass,
        soloBestElo: Math.max(user.soloBestElo || 0, eloAfter),
        soloBestClass: eloAfter > (user.soloBestElo || 0) ? newFrenchClass : (user.soloBestClass || 'F-')
      }
    });
    
    console.log('Update result:', updateResult.soloElo, updateResult.soloClass);

    // Check for rank achievement
    await AchievementService.checkRankAchievement(user.id, newFrenchClass);
  } else {
    console.log('=== NOT COMPETITIVE MODE ===');
    console.log('Test mode:', testMode);
    console.log('Elo will not be updated');
    console.log('=============================');
  }

  // Update existing test record instead of creating new one
  const test = await prisma.soloTest.update({
    where: { 
      id: testData.testId,
      userId: user.id 
    },
    data: {
      completedAt: new Date(),
      totalQuestions: questions.length,
      correctAnswers: correct,
      score,
      timeTaken,
      eloBefore,
      eloAfter,
      eloChange,
      isPerfect: correct === questions.length,
      isStreakTest: testMode === 'competitive' && eloChange > 0
    },
    include: {
      questions: true
    }
  });

  // Insert questions separately
  console.log('=== INSERTING QUESTIONS ===');
  console.log('Question results count:', questionResults.length);
  
  for (const questionResult of questionResults) {
    try {
      await prisma.soloQuestion.create({
        data: {
          testId: testData.testId,
          type: questionResult.type,
          difficulty: questionResult.difficulty,
          question: questionResult.question,
          answer: questionResult.answer,
          userAnswer: questionResult.userAnswer,
          isCorrect: questionResult.isCorrect,
          timeTaken: questionResult.timeTaken,
          explanation: null, // Will be added later if needed
          order: questionResult.order
        }
      });
      console.log(`Inserted question: ${questionResult.question.substring(0, 30)}...`);
    } catch (error) {
      console.error('Error inserting question:', error);
    }
  }
  console.log('========================');

  // Check for perfect test achievement
  await AchievementService.checkPerfectTestAchievement(user.id, correct, questions.length);

  // Update statistics
  await prisma.soloStatistics.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      totalTests: 1,
      totalCorrect: correct,
      totalQuestions: questions.length,
      totalTime: timeTaken,
      averageScore: score,
      averageTime: timeTaken
    },
    update: {
      totalTests: { increment: 1 },
      totalCorrect: { increment: correct },
      totalQuestions: { increment: questions.length },
      totalTime: { increment: timeTaken }
    }
  });

  // Recalculate proper averages
  const stats = await prisma.soloStatistics.findUnique({
    where: { userId: user.id }
  });

  if (stats && stats.totalTests > 0) {
    await prisma.soloStatistics.update({
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

    const tests = await prisma.soloTest.findMany({
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
