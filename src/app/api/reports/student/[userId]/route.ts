import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import StudentReport from '@/components/pdf/StudentReport';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId: targetUserId } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les autorisations
    const hasAccess = await checkReportAccess(session.user.id, targetUserId, (session.user as any).role);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Récupérer les informations de l'élève
    const student = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Récupérer les statistiques détaillées
    const stats = await getStudentStats(targetUserId);

    // Générer le PDF
    const pdfStream = await renderToStream(
      StudentReport({
        student: {
          firstName: student.displayName || student.username,
          lastName: '',
          class: student.classe || 'Non défini',
          rank: student.soloRankClass || 'Débutant',
          elo: student.soloElo || 1000
        },
        stats: stats
      })
    );

    // Créer le nom de fichier
    const date = new Date().toISOString().split('T')[0];
    const firstName = (student.displayName || student.username).toLowerCase().replace(' ', '-');
    const fileName = `rapport_${firstName}_${date}.pdf`;

    // Retourner le PDF en stream
    return new NextResponse(pdfStream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkReportAccess(requesterId: string, targetUserId: string, requesterRole: string): Promise<boolean> {
  // Les admins peuvent tout voir
  if (requesterRole === 'admin') {
    return true;
  }

  // Les teachers peuvent voir les élèves de leur classe (à implémenter)
  if (requesterRole === 'teacher') {
    // Pour l'instant, autoriser tous les teachers (à affiner plus tard)
    return true;
  }

  // Les parents peuvent voir leurs enfants liés
  if (requesterRole === 'parent') {
    const link = await prisma.parentChildLink.findFirst({
      where: {
        parentId: requesterId,
        childId: targetUserId,
        isActive: true
      }
    });
    return !!link;
  }

  // Les élèves peuvent voir leur propre rapport
  if (requesterRole === 'student') {
    return requesterId === targetUserId;
  }

  return false;
}

async function getStudentStats(studentId: string) {
  const now = new Date();
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Statistiques mock (à remplacer avec de vraies données)
  return {
    periodStart: monthStart.toISOString(),
    periodEnd: now.toISOString(),
    totalSessions: Math.floor(Math.random() * 20) + 10,
    totalTime: Math.floor(Math.random() * 600) + 180, // 3-13 heures
    globalSuccessRate: Math.floor(Math.random() * 25) + 75, // 75-100%
    weeklyTime: Math.floor(Math.random() * 180) + 60, // 1-4 heures
    lastLogin: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
    eloProgression: generateEloProgression(),
    subjectPerformance: [
      {
        subject: 'Calcul',
        successRate: Math.floor(Math.random() * 20) + 80,
        progression: Math.floor(Math.random() * 10) - 5,
        totalQuestions: Math.floor(Math.random() * 50) + 100
      },
      {
        subject: 'Géométrie',
        successRate: Math.floor(Math.random() * 20) + 70,
        progression: Math.floor(Math.random() * 10) - 5,
        totalQuestions: Math.floor(Math.random() * 40) + 80
      },
      {
        subject: 'Algèbre',
        successRate: Math.floor(Math.random() * 20) + 75,
        progression: Math.floor(Math.random() * 10) - 5,
        totalQuestions: Math.floor(Math.random() * 30) + 60
      },
      {
        subject: 'Mesures',
        successRate: Math.floor(Math.random() * 20) + 70,
        progression: Math.floor(Math.random() * 10) - 5,
        totalQuestions: Math.floor(Math.random() * 30) + 50
      }
    ],
    recentCourses: [
      {
        title: 'Nombres et calculs',
        completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 45
      },
      {
        title: 'Géométrie plane',
        completedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 30
      },
      {
        title: 'Problèmes',
        completedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60
      }
    ],
    recentTrainings: [
      {
        type: 'Calcul mental',
        score: Math.floor(Math.random() * 30) + 70,
        completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'Problèmes',
        score: Math.floor(Math.random() * 30) + 70,
        completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        type: 'Géométrie',
        score: Math.floor(Math.random() * 30) + 70,
        completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    badges: [
      {
        name: '🎯 Tireur d\'élite',
        description: '10 sessions consécutives > 90%',
        earnedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: '📚 Lecteur assidu',
        description: '5 cours complétés cette semaine',
        earnedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: '⚡ Rapide comme l\'éclair',
        description: 'Réponse moyenne < 2 secondes',
        earnedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
}

function generateEloProgression() {
  const progression = [];
  let currentElo = 1000;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    currentElo += Math.floor(Math.random() * 20) - 5; // -5 à +15
    currentElo = Math.max(800, Math.min(2000, currentElo)); // Limiter entre 800 et 2000
    
    progression.push({
      date: date.toISOString().split('T')[0],
      elo: currentElo
    });
  }
  
  return progression;
}
