import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Récupérer l'historique des tests solo
    const tests = await prisma.soloTest.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        completedAt: true,
        totalQuestions: true,
        correctAnswers: true,
        score: true,
        timeTaken: true,
        eloBefore: true,
        eloAfter: true,
        questions: {
          select: {
            id: true,
            type: true,
            difficulty: true,
            question: true,
            answer: true,
            userAnswer: true,
            isCorrect: true,
            timeTaken: true,
            order: true
          }
        }
      }
    });

    // Compter le total
    const total = await prisma.soloTest.count({
      where: {
        userId: session.user.id
      }
    });

    // Formatter les données
    const formattedTests = tests.map(test => ({
      id: test.id,
      completedAt: test.completedAt?.toISOString() || new Date().toISOString(),
      totalQuestions: test.totalQuestions,
      correctAnswers: test.correctAnswers,
      score: test.score,
      timeTaken: test.timeTaken,
      eloBefore: test.eloBefore,
      eloAfter: test.eloAfter,
      eloChange: test.eloAfter - test.eloBefore,
      isPerfect: test.correctAnswers === test.totalQuestions,
      isStreakTest: test.score > 100, // Supposition
      questions: test.questions
    }));

    return NextResponse.json({
      tests: formattedTests,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching solo history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
