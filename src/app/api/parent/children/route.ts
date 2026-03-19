import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || (session.user as any).role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parentLinks = await prisma.parentChildLink.findMany({
      where: {
        parentId: (session.user as any).id,
        isActive: true
      },
      include: {
        child: true
      }
    });

    // Pour chaque enfant, récupérer les statistiques détaillées
    const children = await Promise.all(
      parentLinks.map(async (link) => {
        const child = link.child;
        
        // Récupérer les statistiques de l'enfant
        const stats = await getChildStats(child.id);
        
        return {
          id: child.id,
          firstName: child.displayName || child.username,
          lastName: '',
          class: child.classe || 'Non défini',
          rank: child.soloRankClass || 'Débutant',
          elo: child.soloElo || 1000,
          weeklyTime: stats.weeklyTime,
          successRate: stats.successRate,
          lastLogin: child.lastSeenAt || new Date().toISOString(),
          recentCourses: stats.recentCourses,
          recentTrainings: stats.recentTrainings,
          eloProgression: stats.eloProgression,
          subjectPerformance: stats.subjectPerformance
        };
      })
    );

    return NextResponse.json(children);
  } catch (error) {
    console.error('Error fetching parent children:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getChildStats(childId: string) {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Temps passé cette semaine (mock data pour l'instant)
  const weeklyTime = Math.floor(Math.random() * 300) + 60; // 60-360 minutes

  // Taux de réussite global (mock data)
  const successRate = Math.floor(Math.random() * 30) + 70; // 70-100%

  // Cours récents (mock data)
  const recentCourses = [
    {
      id: '1',
      title: 'Nombres et calculs',
      completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45
    },
    {
      id: '2', 
      title: 'Géométrie plane',
      completedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 30
    }
  ];

  // Entraînements récents (mock data)
  const recentTrainings = [
    {
      id: '1',
      type: 'Calcul mental',
      score: 85,
      completedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'Problèmes',
      score: 92,
      completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'Géométrie',
      score: 78,
      completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Progression ELO sur 30 jours (mock data)
  const eloProgression = [];
  let currentElo = 1000;
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    currentElo += Math.floor(Math.random() * 20) - 5; // -5 à +15
    eloProgression.push({
      date: date.toISOString().split('T')[0],
      elo: currentElo
    });
  }

  // Performance par matière (mock data)
  const subjectPerformance = [
    {
      subject: 'Calcul',
      successRate: 85,
      progression: 5,
      totalQuestions: 120
    },
    {
      subject: 'Géométrie',
      successRate: 78,
      progression: -2,
      totalQuestions: 85
    },
    {
      subject: 'Algèbre',
      successRate: 92,
      progression: 8,
      totalQuestions: 95
    },
    {
      subject: 'Mesures',
      successRate: 81,
      progression: 3,
      totalQuestions: 70
    }
  ];

  return {
    weeklyTime,
    successRate,
    recentCourses,
    recentTrainings,
    eloProgression,
    subjectPerformance
  };
}
