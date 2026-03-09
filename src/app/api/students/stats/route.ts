import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les statistiques d'un élève
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    // Si studentId est fourni, on récupère les stats de cet élève (pour le prof)
    // Sinon, on récupère les stats de l'utilisateur connecté
    const targetStudentId = studentId || session.user.id;

    // Vérifier les permissions si on consulte un autre élève
    if (studentId && studentId !== session.user.id) {
      // Vérifier que l'utilisateur est professeur de la classe
      const classGroup = await prisma.classGroup.findFirst({
        where: {
          id: classId || undefined,
          teacherId: session.user.id
        }
      });

      if (!classGroup) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
    }

    // Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: targetStudentId },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        level: true,
        xp: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer toutes les soumissions de l'élève
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: targetStudentId },
      include: {
        assignment: {
          include: {
            class: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        answers: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculer les statistiques globales
    const completedAssignments = submissions.filter(s => s.status === 'completed');
    const totalAssignments = submissions.length;
    const completedCount = completedAssignments.length;
    
    const averageScore = completedCount > 0
      ? completedAssignments.reduce((sum, s) => sum + (s.score || 0), 0) / completedCount
      : 0;

    const totalPoints = completedAssignments.reduce((sum, s) => {
      return sum + s.answers.reduce((aSum, a) => aSum + a.points, 0);
    }, 0);

    // Progression dans le temps
    const progressByMonth: Record<string, { completed: number; avgScore: number }> = {};
    completedAssignments.forEach(s => {
      const month = new Date(s.completedAt || s.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short'
      });
      if (!progressByMonth[month]) {
        progressByMonth[month] = { completed: 0, avgScore: 0 };
      }
      progressByMonth[month].completed++;
    });

    // Calculer les moyennes par mois
    Object.keys(progressByMonth).forEach(month => {
      const monthSubmissions = completedAssignments.filter(s => 
        new Date(s.completedAt || s.createdAt).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'short'
        }) === month
      );
      progressByMonth[month].avgScore = 
        monthSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / monthSubmissions.length;
    });

    // Répartition par difficulté
    const difficultyStats: Record<number, { total: number; correct: number }> = {};
    submissions.forEach(s => {
      s.answers.forEach(a => {
        // On récupère la difficulté depuis la question associée
        // Pour simplifier, on utilise les points comme proxy de difficulté
        const difficulty = Math.ceil(a.points / 2) || 1;
        if (!difficultyStats[difficulty]) {
          difficultyStats[difficulty] = { total: 0, correct: 0 };
        }
        difficultyStats[difficulty].total++;
        if (a.isCorrect) {
          difficultyStats[difficulty].correct++;
        }
      });
    });

    // Temps moyen par devoir (si on a les données de temps)
    const avgTimePerAssignment = completedCount > 0
      ? completedAssignments.reduce((sum, s) => {
          if (s.completedAt && s.startedAt) {
            const duration = new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime();
            return sum + duration / 1000 / 60; // en minutes
          }
          return sum;
        }, 0) / completedCount
      : 0;

    // Derniers devoirs
    const recentAssignments = submissions.slice(0, 10).map(s => ({
      id: s.id,
      assignmentTitle: s.assignment.title,
      className: s.assignment.class?.name || 'Classe inconnue',
      status: s.status,
      score: s.score,
      completedAt: s.completedAt,
      correctCount: s.answers.filter(a => a.isCorrect).length,
      totalQuestions: s.answers.length
    }));

    // Classement dans les classes (si l'élève est dans des classes)
    const classMemberships = await prisma.classMember.findMany({
      where: { userId: targetStudentId },
      include: {
        class: {
          include: {
            members: true
          }
        }
      }
    });

    const classRankings = await Promise.all(
      classMemberships.map(async (membership) => {
        const allSubmissions = await prisma.assignmentSubmission.findMany({
          where: {
            assignment: {
              classId: membership.class.id
            },
            status: 'completed'
          },
          select: {
            studentId: true,
            score: true
          }
        });

        // Calculer le score moyen par élève
        const studentScores: Record<string, number[]> = {};
        allSubmissions.forEach(s => {
          if (!studentScores[s.studentId || '']) {
            studentScores[s.studentId || ''] = [];
          }
          if (s.score !== null) {
            studentScores[s.studentId || ''].push(s.score);
          }
        });

        const avgScores = Object.entries(studentScores).map(([id, scores]) => ({
          studentId: id,
          avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
        }));

        avgScores.sort((a, b) => b.avgScore - a.avgScore);
        const rank = avgScores.findIndex(s => s.studentId === targetStudentId) + 1;
        const totalStudents = avgScores.length;

        return {
          classId: membership.class.id,
          className: membership.class.name,
          rank,
          totalStudents,
          percentile: totalStudents > 0 ? ((totalStudents - rank) / totalStudents) * 100 : 0
        };
      })
    );

    return NextResponse.json({
      student: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        level: user.level,
        xp: user.xp,
        joinedAt: user.createdAt
      },
      stats: {
        totalAssignments,
        completedCount,
        completionRate: totalAssignments > 0 ? (completedCount / totalAssignments) * 100 : 0,
        averageScore: Math.round(averageScore * 100) / 100,
        totalPoints,
        avgTimePerAssignment: Math.round(avgTimePerAssignment * 10) / 10
      },
      progressByMonth,
      difficultyStats,
      recentAssignments,
      classRankings
    });

  } catch (error) {
    console.error('Error fetching student stats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
