import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer un devoir par son code de partage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareCode = searchParams.get('code');

    if (!shareCode) {
      return NextResponse.json({ error: 'Code de partage requis' }, { status: 400 });
    }

    const assignment = await prisma.classAssignment.findUnique({
      where: { shareCode },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacher: {
              select: {
                id: true,
                displayName: true,
                username: true
              }
            }
          }
        },
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            questionType: true,
            options: true,
            difficulty: true,
            points: true,
            order: true
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Devoir non trouvé' }, { status: 404 });
    }

    if (!assignment.shareEnabled) {
      return NextResponse.json({ error: 'Le partage est désactivé pour ce devoir' }, { status: 403 });
    }

    // Ne pas renvoyer les réponses correctes pour les questions
    const sanitizedQuestions = assignment.questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null
    }));

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        questionCount: assignment.questionCount,
        difficulty: assignment.difficulty,
        timeLimit: assignment.timeLimit,
        negativePoints: assignment.negativePoints,
        dueDate: assignment.dueDate,
        class: assignment.class,
        questions: sanitizedQuestions
      }
    });

  } catch (error) {
    console.error('Error fetching shared assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
