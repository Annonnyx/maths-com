/**
 * API endpoint pour les profils publics d'utilisateurs
 * Maths-app.com - v1.0 - 3 mars 2026
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[username]/public - Récupérer le profil public d'un utilisateur
export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    if (!username) {
      return NextResponse.json(
        { error: 'Username requis' },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur par username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        customBannerId: true,
        selectedBadgeIds: true,
        soloElo: true,
        soloRankClass: true,
        soloBestElo: true,
        soloBestRankClass: true,
        multiplayerElo: true,
        multiplayerRankClass: true,
        multiplayerBestElo: true,
        multiplayerBestRankClass: true,
        hasCompletedOnboarding: true,
        isOnline: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
        soloStatistics: true,
        userBadges: {
          select: {
            id: true,
            earnedAt: true,
            expiresAt: true,
            badge: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                category: true,
                color: true,
                requirement: true,
                isCustom: true,
                isTemporary: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Calculer les statistiques supplémentaires
    const stats = user.soloStatistics ? {
      totalTests: user.soloStatistics.totalTests || 0,
      totalQuestions: user.soloStatistics.totalQuestions || 0,
      correctAnswers: user.soloStatistics.totalCorrect || 0,
      averageTime: user.soloStatistics.averageTime || 0,
      averageScore: user.soloStatistics.averageScore || 0,
    } : null;

    // Formater les badges
    const badges = user.userBadges.map(userBadge => ({
      id: userBadge.badge.id,
      name: userBadge.badge.name,
      description: userBadge.badge.description,
      icon: userBadge.badge.icon,
      tier: userBadge.badge.color || 'bronze'
    }));

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
