import { prisma } from './prisma';

// Helper functions for rarity
function getRarityFromRank(frenchClass: string): string {
  // Classes les plus avancées ont les rarités les plus élevées
  if (frenchClass === 'Pro') return 'legendary';
  if (frenchClass.startsWith('Sup')) return 'legendary';
  if (['Tle', '1re', '2de'].includes(frenchClass)) return 'epic';
  if (['3e', '4e', '5e', '6e'].includes(frenchClass)) return 'rare';
  return 'common'; // CP, CE1, CE2, CM1, CM2
}

function getAchievementRarity(id: string): string {
  if (id.includes('streak_10') || id === 'perfect_score') return 'legendary';
  if (id.includes('streak_5') || id === 'math_wizard' || id === 'multi_master') return 'epic';
  if (id === 'first_win' || id === 'speed_demon') return 'rare';
  return 'common';
}

// Badges de rang - attribués automatiquement (système de classes françaises)
export const RANK_BADGES = {
  'Pro': { name: 'Mathématicien Pro', icon: '🌟', color: '#FFD700', description: 'Atteint la classe Pro' },
  'Sup3': { name: 'Expert Sup3', icon: '⭐', color: '#FFA500', description: 'Atteint la classe Sup3' },
  'Sup2': { name: 'Spécialiste Sup2', icon: '💎', color: '#C0C0C0', description: 'Atteint la classe Sup2' },
  'Sup1': { name: 'Vétéran Sup1', icon: '🎖️', color: '#FF6B35', description: 'Atteint la classe Sup1' },
  'Tle': { name: 'Confirmé Tle', icon: '⚔️', color: '#9B59B6', description: 'Atteint la classe Tle' },
  '1re': { name: 'Adepte 1re', icon: '🛡️', color: '#AF7AC5', description: 'Atteint la classe 1re' },
  '2de': { name: 'Initié 2de', icon: '🔮', color: '#C39BD3', description: 'Atteint la classe 2de' },
  '3e': { name: 'Avancé 3e', icon: '⚡', color: '#3498DB', description: 'Atteint la classe 3e' },
  '4e': { name: 'Intermédiaire 4e', icon: '🔷', color: '#5DADE2', description: 'Atteint la classe 4e' },
  '5e': { name: 'Débutant+ 5e', icon: '💠', color: '#85C1E9', description: 'Atteint la classe 5e' },
  '6e': { name: 'Novice 6e', icon: '🌱', color: '#1ABC9C', description: 'Atteint la classe 6e' },
  'CM2': { name: 'Apprenti CM2', icon: '🍃', color: '#48C9B0', description: 'Atteint la classe CM2' },
  'CM1': { name: 'Recrue CM1', icon: '🌿', color: '#76D7C4', description: 'Atteint la classe CM1' },
  'CE2': { name: 'Stagiaire CE2', icon: '📗', color: '#27AE60', description: 'Atteint la classe CE2' },
  'CE1': { name: 'Débutant CE1', icon: '📘', color: '#52BE80', description: 'Atteint la classe CE1' },
  'CP': { name: 'Élève CP', icon: '�', color: '#7DCEA0', description: 'Bienvenue dans le système éducatif !' },
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
            rarity: getRarityFromRank(rank),
            condition: `Atteindre la classe ${rank}`,
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
            rarity: getAchievementRarity(badge.id),
            condition: badge.description,
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
    await awardRankBadge(userId, user.soloClass || 'CP');

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
