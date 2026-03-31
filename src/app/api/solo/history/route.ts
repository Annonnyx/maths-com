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
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    console.log('=== SOLO HISTORY DEBUG ===');
    console.log('User ID:', session.user.id);
    console.log('Limit:', limit, 'Offset:', offset);

    // Validation des paramètres
    if (isNaN(limit) || isNaN(offset)) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Récupérer l'historique des tests solo - seulement les tests complétés
    const tests = await prisma.soloTest.findMany({
      where: {
        userId: session.user.id,
        completedAt: { not: null } // Uniquement les tests terminés
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
        isPerfect: true,
        isStreakTest: true,
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

    console.log('Tests found:', tests.length);
    tests.forEach((test, i) => {
      console.log(`Test ${i+1}: ${test.id}, completed: ${test.completedAt}, score: ${test.score}, eloChange: ${test.eloAfter - test.eloBefore}`);
    });

    // Compter le total des tests complétés
    const total = await prisma.soloTest.count({
      where: {
        userId: session.user.id,
        completedAt: { not: null }
      }
    });

    console.log('Total completed tests:', total);

    // Formatter les données avec validation
    const formattedTests = tests.map(test => {
      try {
        return {
          id: test.id,
          completedAt: test.completedAt?.toISOString() || new Date().toISOString(),
          totalQuestions: test.totalQuestions,
          correctAnswers: test.correctAnswers,
          score: test.score,
          timeTaken: test.timeTaken || 0,
          eloBefore: test.eloBefore || 0,
          eloAfter: test.eloAfter || 0,
          eloChange: (test.eloAfter || 0) - (test.eloBefore || 0),
          isPerfect: test.isPerfect || false,
          isStreakTest: test.isStreakTest || false,
          questions: test.questions || []
        };
      } catch (error) {
        console.error('Error formatting test:', test.id, error);
        return {
          id: test.id,
          completedAt: new Date().toISOString(),
          totalQuestions: 0,
          correctAnswers: 0,
          score: 0,
          timeTaken: 0,
          eloBefore: 0,
          eloAfter: 0,
          eloChange: 0,
          isPerfect: false,
          isStreakTest: false,
          questions: []
        };
      }
    });

    console.log('Formatted tests:', formattedTests.length);
    console.log('=============================');

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
    return NextResponse.json({ error: 'Failed to fetch history', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
