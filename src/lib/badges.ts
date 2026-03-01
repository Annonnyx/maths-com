import { prisma } from './prisma';

// Badges de rang - attribués automatiquement
export const RANK_BADGES = {
  'S+': { name: 'Maître S+', icon: '🌟', color: '#FFD700', description: 'Atteint le rang S+' },
  'S': { name: 'Légende S', icon: '⭐', color: '#FFA500', description: 'Atteint le rang S' },
  'S-': { name: 'Elite S-', icon: '💎', color: '#C0C0C0', description: 'Atteint le rang S-' },
  'A+': { name: 'Expert A+', icon: '�', color: '#FF6B35', description: 'Atteint le rang A+' },
  'A': { name: 'Vétéran A', icon: '🎖️', color: '#FF8C42', description: 'Atteint le rang A' },
  'A-': { name: 'Spécialiste A-', icon: '🎯', color: '#FF9F5A', description: 'Atteint le rang A-' },
  'B+': { name: 'Confirmé B+', icon: '⚔️', color: '#9B59B6', description: 'Atteint le rang B+' },
  'B': { name: 'Adepte B', icon: '🛡️', color: '#AF7AC5', description: 'Atteint le rang B' },
  'B-': { name: 'Initié B-', icon: '🔮', color: '#C39BD3', description: 'Atteint le rang B-' },
  'C+': { name: 'Avancé C+', icon: '⚡', color: '#3498DB', description: 'Atteint le rang C+' },
  'C': { name: 'Intermédiaire C', icon: '🔷', color: '#5DADE2', description: 'Atteint le rang C' },
  'C-': { name: 'Débutant+ C-', icon: '💠', color: '#85C1E9', description: 'Atteint le rang C-' },
  'D+': { name: 'Novice D+', icon: '🌱', color: '#1ABC9C', description: 'Atteint le rang D+' },
  'D': { name: 'Apprenti D', icon: '🍃', color: '#48C9B0', description: 'Atteint le rang D' },
  'D-': { name: 'Recrue D-', icon: '🌿', color: '#76D7C4', description: 'Atteint le rang D-' },
  'E+': { name: 'Stagiaire E+', icon: '📗', color: '#27AE60', description: 'Atteint le rang E+' },
  'E': { name: 'Débutant E', icon: '📘', color: '#52BE80', description: 'Atteint le rang E' },
  'E-': { name: 'Initié E-', icon: '📙', color: '#7DCEA0', description: 'Atteint le rang E-' },
  'F+': { name: 'Amateur F+', icon: '📝', color: '#95A5A6', description: 'Atteint le rang F+' },
  'F': { name: 'Novice F', icon: '✏️', color: '#B2BABB', description: 'Atteint le rang F' },
  'F-': { name: 'Débutant F-', icon: '📋', color: '#CFD8DC', description: 'Bienvenue dans le classement !' },
};

// Badges d'accomplissements
const ACHIEVEMENT_BADGES = [
  { id: 'first_win', name: 'Première Victoire', icon: '🏅', color: '#FFD700', description: 'Gagner sa première partie multijoueur', category: 'achievement' },
  { id: 'win_streak_5', name: 'Série de 5', icon: '🔥', color: '#FF5722', description: 'Gagner 5 parties consécutives', category: 'achievement' },
  { id: 'win_streak_10', name: 'Invincible', icon: '👑', color: '#FFD700', description: 'Gagner 10 parties consécutives', category: 'achievement' },
  { id: 'perfect_score', name: 'Score Parfait', icon: '💯', color: '#E91E63', description: 'Répondre correctement à 20/20 questions', category: 'achievement' },
  { id: 'speed_demon', name: 'Vitesse Supersonique', icon: '⚡', color: '#00BCD4', description: 'Compléter un test en moins de 60 secondes', category: 'achievement' },
  { id: 'math_wizard', name: 'Magicien des Maths', icon: '🧙', color: '#9C27B0', description: 'Atteindre 1000 Elo en solo', category: 'achievement' },
  { id: 'multi_master', name: 'Maître du Multi', icon: '⚔️', color: '#F44336', description: 'Atteindre 1000 Elo en multijoueur', category: 'achievement' },
  { id: 'dedicated', name: 'Dévoué', icon: '📅', color: '#3F51B5', description: 'Jouer 7 jours consécutifs', category: 'achievement' },
  { id: 'collector', name: 'Collectionneur', icon: '🎯', color: '#FF9800', description: 'Débloquer toutes les opérations', category: 'achievement' },
  { id: 'teacher', name: 'Professeur', icon: '📚', color: '#4CAF50', description: 'Compléter tous les cours', category: 'achievement' },
];

// Initialiser les badges de base dans la base de données
export async function initializeBadges() {
  try {
    // Créer les badges de rang
    for (const [rank, badge] of Object.entries(RANK_BADGES)) {
      const existing = await prisma.badge.findFirst({
        where: { name: badge.name }
      });
      
      if (!existing) {
        await prisma.badge.create({
          data: {
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: 'rank',
            color: badge.color,
            requirement: `Atteindre le rang ${rank}`,
            isCustom: false
          }
        });
        console.log(`Created rank badge: ${badge.name}`);
      }
    }

    // Créer les badges d'accomplissements
    for (const badge of ACHIEVEMENT_BADGES) {
      const existing = await prisma.badge.findFirst({
        where: { id: badge.id }
      });
      
      if (!existing) {
        await prisma.badge.create({
          data: {
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            color: badge.color,
            requirement: badge.description,
            isCustom: false
          }
        });
        console.log(`Created achievement badge: ${badge.name}`);
      }
    }

    console.log('Badge initialization complete');
  } catch (error) {
    console.error('Error initializing badges:', error);
  }
}

// Attribuer un badge de rang
export async function awardRankBadge(userId: string, rankClass: string) {
  try {
    const badgeInfo = RANK_BADGES[rankClass as keyof typeof RANK_BADGES];
    if (!badgeInfo) return;

    const badge = await prisma.badge.findFirst({
      where: { name: badgeInfo.name }
    });

    if (!badge) return;

    // Vérifier si déjà possédé
    const existing = await prisma.userBadge.findFirst({
      where: { userId, badgeId: badge.id }
    });

    if (existing) return;

    // Attribuer le badge
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id
      }
    });

    console.log(`Awarded rank badge ${badgeInfo.name} to user ${userId}`);
  } catch (error) {
    console.error('Error awarding rank badge:', error);
  }
}

// Attribuer un badge d'accomplissement
export async function awardAchievementBadge(userId: string, badgeId: string) {
  try {
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });

    if (!badge) return;

    // Vérifier si déjà possédé
    const existing = await prisma.userBadge.findFirst({
      where: { userId, badgeId: badge.id }
    });

    if (existing) return;

    // Attribuer le badge
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id
      }
    });

    console.log(`Awarded achievement badge ${badge.name} to user ${userId}`);
  } catch (error) {
    console.error('Error awarding achievement badge:', error);
  }
}

// Vérifier et attribuer les badges basés sur les statistiques
export async function checkAndAwardBadges(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        soloStatistics: true,
        multiplayerStatistics: true
      }
    });

    if (!user) return;

    // Badge de rang actuel
    await awardRankBadge(userId, user.soloRankClass);

    // Badge premier victoire multijoueur
    if ((user.multiplayerStatistics?.totalWins || 0) >= 1) {
      await awardAchievementBadge(userId, 'first_win');
    }

    // Badge série de victoires
    if ((user.multiplayerStatistics?.multiplayerCurrentStreak || 0) >= 5) {
      await awardAchievementBadge(userId, 'win_streak_5');
    }
    if ((user.multiplayerStatistics?.multiplayerBestStreak || 0) >= 10) {
      await awardAchievementBadge(userId, 'win_streak_10');
    }

    // Badge Elo solo
    if (user.soloElo >= 1000) {
      await awardAchievementBadge(userId, 'math_wizard');
    }

    // Badge Elo multi
    if (user.multiplayerElo >= 1000) {
      await awardAchievementBadge(userId, 'multi_master');
    }

  } catch (error) {
    console.error('Error checking badges:', error);
  }
}
