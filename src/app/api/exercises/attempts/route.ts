import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Exercise, OperationType } from '@/lib/exercises';

// POST /api/exercises/attempt - Record an exercise attempt
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      type,
      difficulty,
      question,
      answer,
      userAnswer,
      isCorrect,
      timeTaken
    } = body;

    const attempt = await prisma.exerciseAttempt.create({
      data: {
        userId,
        type,
        difficulty,
        question,
        answer,
        userAnswer,
        isCorrect,
        timeTaken
      }
    });

    return NextResponse.json(attempt);
  } catch (error) {
    console.error('Error recording exercise attempt:', error);
    return NextResponse.json({ error: 'Failed to record attempt' }, { status: 500 });
  }
}

// GET /api/exercises/attempts - Get user's exercise attempts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') as OperationType | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const attempts = await prisma.exerciseAttempt.findMany({
      where: {
        userId,
        ...(type && { type })
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Error fetching exercise attempts:', error);
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
  }
}
