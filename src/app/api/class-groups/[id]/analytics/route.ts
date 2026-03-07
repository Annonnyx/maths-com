import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/class-groups/[id]/analytics - Analytics d'une classe spécifique
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const classId = params.id;

    // Vérifier que l'utilisateur est le professeur de cette classe
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                soloElo: true,
                soloRankClass: true
              }
            }
          }
        }
      }
    });

    if (!classGroup) {
      return NextResponse.json({ error: 'Classe introuvable' }, { status: 404 });
    }

    if (classGroup.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer les étudiants de la classe
    const students = classGroup.members.filter(m => m.role === 'student');
    const studentIds = students.map(s => s.user.id);

    if (studentIds.length === 0) {
      return NextResponse.json({
        classInfo: {
          name: classGroup.name,
          studentCount: 0
        },
        globalStats: {
          averageScore: 0,
          averageTime: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          accuracy: 0
        },
        studentsStats: [],
        subjectPerformance: [],
        difficultyPerformance: [],
        timeEvolution: []
      });
    }

    // Récupérer l'historique des questions pour tous les étudiants
    const questionHistory = await prisma.questionHistory.findMany({
      where: {
        userId: { in: studentIds }
      },
      orderBy: {
        answeredAt: 'asc'
      }
    });

    // Calculer les statistiques globales
    const totalQuestions = questionHistory.length;
    const correctAnswers = questionHistory.filter(q => q.correct).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const averageScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averageTime = totalQuestions > 0 
      ? questionHistory.reduce((sum, q) => sum + (q.timeSpent || 0), 0) / totalQuestions 
      : 0;
    const accuracy = totalQuestions > 0 ? averageScore : 0;

    // Statistiques par étudiant
    const studentsStats = studentIds.map(studentId => {
      const student = students.find(s => s.user.id === studentId);
      const studentHistory = questionHistory.filter(q => q.userId === studentId);
      
      const studentCorrect = studentHistory.filter(q => q.correct).length;
      const studentTotal = studentHistory.length;
      const studentAverage = studentTotal > 0 ? (studentCorrect / studentTotal) * 100 : 0;
      const studentAvgTime = studentTotal > 0 
        ? studentHistory.reduce((sum, q) => sum + (q.timeSpent || 0), 0) / studentTotal 
        : 0;

      return {
        id: student?.user.id || studentId,
        username: student?.user.username || 'Unknown',
        displayName: student?.user.displayName || 'Unknown',
        soloElo: student?.user.soloElo || 0,
        soloRankClass: student?.user.soloRankClass || 'F-',
        totalQuestions: studentTotal,
        correctAnswers: studentCorrect,
        wrongAnswers: studentTotal - studentCorrect,
        averageScore: studentAverage,
        averageTime: studentAvgTime,
        accuracy: studentAverage,
        lastActivity: studentHistory.length > 0 
          ? studentHistory[studentHistory.length - 1].answeredAt 
          : null
      };
    }).sort((a, b) => b.averageScore - a.averageScore);

    // Performance par matière
    const subjectPerformance = questionHistory.reduce((acc, q) => {
      const subject = q.subject || 'unknown';
      if (!acc[subject]) {
        acc[subject] = { total: 0, correct: 0, subject };
      }
      acc[subject].total++;
      if (q.correct) acc[subject].correct++;
      return acc;
    }, {} as Record<string, { total: number; correct: number; subject: string }>);

    const subjectStats = Object.values(subjectPerformance).map(stat => ({
      subject: stat.subject,
      totalQuestions: stat.total,
      correctAnswers: stat.correct,
      accuracy: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0
    })).sort((a, b) => b.accuracy - a.accuracy);

    // Performance par difficulté
    const difficultyPerformance = questionHistory.reduce((acc, q) => {
      const difficulty = q.difficulty || 'unknown';
      if (!acc[difficulty]) {
        acc[difficulty] = { total: 0, correct: 0, difficulty };
      }
      acc[difficulty].total++;
      if (q.correct) acc[difficulty].correct++;
      return acc;
    }, {} as Record<string, { total: number; correct: number; difficulty: string }>);

    const difficultyStats = Object.values(difficultyPerformance).map(stat => ({
      difficulty: stat.difficulty,
      totalQuestions: stat.total,
      correctAnswers: stat.correct,
      accuracy: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0
    })).sort((a, b) => {
      const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'unknown': 4 };
      return (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 99) - 
             (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 99);
    });

    // Évolution temporelle (derniers 30 jours)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentHistory = questionHistory.filter(q => q.answeredAt >= thirtyDaysAgo);
    
    const timeEvolution = recentHistory.reduce((acc, q) => {
      const dateKey = q.answeredAt.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, total: 0, correct: 0 };
      }
      acc[dateKey].total++;
      if (q.correct) acc[dateKey].correct++;
      return acc;
    }, {} as Record<string, { date: string; total: number; correct: number }>);

    const evolutionStats = Object.values(timeEvolution)
      .map(stat => ({
        date: stat.date,
        totalQuestions: stat.total,
        correctAnswers: stat.correct,
        accuracy: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      classInfo: {
        name: classGroup.name,
        studentCount: students.length,
        createdAt: classGroup.createdAt
      },
      globalStats: {
        averageScore,
        averageTime,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        accuracy
      },
      studentsStats,
      subjectPerformance: subjectStats,
      difficultyPerformance: difficultyStats,
      timeEvolution: evolutionStats
    });

  } catch (error) {
    console.error('Error fetching class analytics:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
