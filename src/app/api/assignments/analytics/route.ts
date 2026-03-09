import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les statistiques détaillées d'un devoir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({ error: 'assignmentId requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est le professeur de la classe
    const assignment = await prisma.classAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: { select: { teacherId: true } },
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            questionType: true,
            difficulty: true,
            order: true,
            points: true
          }
        },
        submissions: {
          include: {
            answers: {
              select: {
                id: true,
                questionId: true,
                userAnswer: true,
                selectedOptions: true,
                isCorrect: true,
                pointsEarned: true,
                timeTaken: true
              }
            },
            student: {
              select: {
                id: true,
                displayName: true,
                username: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Devoir non trouvé' }, { status: 404 });
    }

    if (assignment.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Accès réservé au professeur' }, { status: 403 });
    }

    // Calculer les statistiques globales
    const totalSubmissions = assignment.submissions.length;
    const completedSubmissions = assignment.submissions.filter(s => s.status === 'completed');
    const averageScore = completedSubmissions.length > 0
      ? completedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSubmissions.length
      : 0;

    // Statistiques par question
    const questionStats = assignment.questions.map(q => {
      const questionAnswers = assignment.submissions.flatMap(s => 
        s.answers.filter(a => a.questionId === q.id)
      );
      
      const correctAnswers = questionAnswers.filter(a => a.isCorrect).length;
      const totalAnswers = questionAnswers.length;
      const successRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
      
      // Réponses les plus fréquentes (pour les questions à réponse libre)
      const answerFrequency: Record<string, number> = {};
      questionAnswers.forEach(a => {
        const ans = a.userAnswer || a.selectedOptions || '(vide)';
        answerFrequency[ans] = (answerFrequency[ans] || 0) + 1;
      });
      
      const topAnswers = Object.entries(answerFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      return {
        questionId: q.id,
        question: q.question,
        questionType: q.questionType,
        difficulty: q.difficulty,
        points: q.points,
        totalAnswers,
        correctAnswers,
        successRate,
        averagePoints: totalAnswers > 0 
          ? questionAnswers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0) / totalAnswers 
          : 0,
        topAnswers
      };
    });

    // Statistiques par élève
    const studentStats = assignment.submissions.map(s => {
      const correctCount = s.answers.filter(a => a.isCorrect).length;
      const totalQuestions = assignment.questions.length;
      
      return {
        submissionId: s.id,
        studentName: s.student?.displayName || s.student?.username || 'Anonyme',
        status: s.status,
        score: s.score,
        startedAt: s.startedAt,
        completedAt: s.submittedAt,
        correctCount,
        totalQuestions,
        percentage: totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0,
        answers: s.answers.map(a => ({
          questionId: a.questionId,
          answer: a.userAnswer || a.selectedOptions,
          isCorrect: a.isCorrect,
          points: a.pointsEarned
        }))
      };
    });

    // Classement des élèves
    const ranking = [...studentStats]
      .filter(s => s.status === 'completed')
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((s, index) => ({
        ...s,
        rank: index + 1
      }));

    // Distribution des scores
    const scoreDistribution = {
      excellent: completedSubmissions.filter(s => (s.score || 0) >= 90).length,
      good: completedSubmissions.filter(s => (s.score || 0) >= 70 && (s.score || 0) < 90).length,
      average: completedSubmissions.filter(s => (s.score || 0) >= 50 && (s.score || 0) < 70).length,
      poor: completedSubmissions.filter(s => (s.score || 0) < 50).length
    };

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        questionCount: assignment.questionCount,
        totalSubmissions,
        completedCount: completedSubmissions.length,
        averageScore: Math.round(averageScore * 100) / 100,
        scoreDistribution
      },
      questionStats,
      studentStats,
      ranking
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
