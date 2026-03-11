/**
 * API endpoint pour les profils publics d'utilisateurs
 * Maths-app.com - v1.0 - 3 mars 2026
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatStatsWithAccuracy } from '@/lib/utils/accuracy';

// GET /api/users/[username]/public - Récupérer le profil public d'un utilisateur
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: 'Username requis' },
        { status: 400 }
      );
    }

    console.log('Recherche du profil pour username:', username);

    // Rechercher l'utilisateur par username avec relations
    const user = await prisma.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        soloElo: true,
        soloRankClass: true,
        multiplayerElo: true,
        multiplayerRankClass: true,
        isTeacher: true,
        isAdmin: true,
        createdAt: true,
        soloStatistics: {
          select: {
            totalTests: true,
            totalQuestions: true,
            totalCorrect: true,
            averageTime: true,
            averageScore: true
          }
        },
        userBadges: {
          include: {
            badge: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                rarity: true
              }
            }
          },
          orderBy: {
            earnedAt: 'desc'
          },
          take: 10 // Limiter à 10 badges les plus récents
        }
      }
    });

    console.log('Utilisateur trouvé:', user ? 'OUI' : 'NON');

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé', username: username },
        { status: 404 }
      );
    }

    // Calculer les statistiques supplémentaires avec précision standardisée
    const stats = user.soloStatistics ? formatStatsWithAccuracy({
      totalTests: user.soloStatistics.totalTests,
      totalQuestions: user.soloStatistics.totalQuestions,
      totalCorrect: user.soloStatistics.totalCorrect,
      averageTime: user.soloStatistics.averageTime,
      averageScore: user.soloStatistics.averageScore
    }) : {
      totalTests: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageTime: 0,
      averageScore: 0,
      accuracy: 0
    };

    // Formater les badges
    const badges = user.userBadges ? user.userBadges.map((userBadge: any) => ({
      id: userBadge.badge.id,
      name: userBadge.badge.name,
      description: userBadge.badge.description,
      icon: userBadge.badge.icon,
      tier: userBadge.badge.rarity || 'common'
    })) : [];

    // Construire le profil public
    const publicProfile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      soloElo: user.soloElo,
      soloRankClass: user.soloRankClass,
      multiplayerElo: user.multiplayerElo,
      multiplayerRankClass: user.multiplayerRankClass,
      isTeacher: user.isTeacher,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      stats,
      badges
    };

    return NextResponse.json({ profile: publicProfile });
  } catch (error) {
    console.error('[API /users/[username]/public] ERROR:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du profil' },
      { status: 500 }
    );
  }
}
