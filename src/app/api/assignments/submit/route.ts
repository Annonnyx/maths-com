import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Créer une soumission pour un devoir partagé
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, studentName, shareCode, answers } = body;

    if (!assignmentId || !studentName || !shareCode) {
      return NextResponse.json(
        { error: 'assignmentId, studentName et shareCode requis' },
        { status: 400 }
      );
    }

    // Vérifier que le devoir existe et que le partage est activé
    const assignment = await prisma.classAssignment.findFirst({
      where: {
        id: assignmentId,
        shareCode,
        shareEnabled: true
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Devoir non trouvé ou partage désactivé' },
        { status: 404 }
      );
    }

    // Créer un utilisateur anonyme pour les soumissions partagées
    const anonymousUser = await prisma.user.create({
      data: {
        email: `anonymous_${Date.now()}@temp.com`,
        username: `anonymous_${Date.now()}`,
        displayName: studentName.trim()
      }
    });

    // Créer la soumission
    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: anonymousUser.id,
        status: 'in_progress',
        startedAt: new Date()
      }
    });

    // Créer les réponses vides pour chaque question
    const questions = await prisma.assignmentQuestion.findMany({
      where: { assignmentId }
    });

    await prisma.assignmentAnswer.createMany({
      data: questions.map(q => ({
        submissionId: submission.id,
        questionId: q.id,
        userAnswer: '',
        isCorrect: false,
        pointsEarned: 0
      }))
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id
    });

  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une soumission avec les réponses
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, answers, completed } = body;

    if (!submissionId || !answers) {
      return NextResponse.json(
        { error: 'submissionId et answers requis' },
        { status: 400 }
      );
    }

    // Mettre à jour chaque réponse
    for (const answer of answers) {
      await prisma.assignmentAnswer.updateMany({
        where: {
          submissionId,
          questionId: answer.questionId
        },
        data: {
          userAnswer: answer.value,
          isCorrect: answer.isCorrect || false,
          pointsEarned: answer.points || 0
        }
      });
    }

    // Si le devoir est terminé, mettre à jour la soumission
    if (completed) {
      const submission = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'submitted',
          submittedAt: new Date()
        },
        include: {
          answers: true
        }
      });

      // Calculer le score total
      const totalPoints = submission.answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
      const maxPoints = submission.answers.length;
      const percentage = (totalPoints / maxPoints) * 100;

      await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          score: percentage
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET - Récupérer une soumission avec les questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json(
        { error: 'submissionId requis' },
        { status: 400 }
      );
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
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
        },
        answers: true
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Soumission non trouvée' },
        { status: 404 }
      );
    }

    // Parser les options des questions
    const questionsWithParsedOptions = submission.assignment.questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null
    }));

    return NextResponse.json({
      submission: {
        ...submission,
        assignment: {
          ...submission.assignment,
          questions: questionsWithParsedOptions
        }
      }
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
