import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/tests - Create a new test
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
    
    // Only handle test creation
    const { totalQuestions, testMode, courseType } = testData;
    
    return await handleTestCreation(testData, user, totalQuestions, testMode, courseType);
    
  } catch (error) {
    console.error('Error in tests API:', error);
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
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
    message: 'Test created successfully',
    testMode: testMode,
    courseType: courseType
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
