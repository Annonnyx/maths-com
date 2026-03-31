export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'skill' | 'milestone' | 'streak' | 'social' | 'special';
  requirement: {
    type: 'score' | 'tests' | 'wins' | 'accuracy' | 'streak' | 'rank';
    value: number | string;
    condition?: string;
  };
  reward: {
    type: 'badge' | 'title' | 'banner' | 'color';
    value: string;
  };
  unlocked?: boolean;
  unlockedAt?: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: {
    type: 'rank' | 'achievement';
    value: string;
  };
  equipped?: boolean;
  unlockedAt?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  // === ACHIEVEMENTS PAR CLASSE FRANÇAISE ===
  {
    id: 'class_cp',
    name: 'Élève CP',
    description: 'Atteindre la classe CP pour la première fois',
    icon: '🎯',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'CP' },
    reward: { type: 'badge', value: 'badge_cp' },
  },
  {
    id: 'class_ce1',
    name: 'Élève CE1',
    description: 'Atteindre la classe CE1',
    icon: '📊',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'CE1' },
    reward: { type: 'badge', value: 'badge_ce1' },
  },
  {
    id: 'class_ce2',
    name: 'Élève CE2',
    description: 'Maîtriser la classe CE2',
    icon: '⭐',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: 'CE2' },
    reward: { type: 'badge', value: 'badge_ce2' },
  },
  {
    id: 'class_cm1',
    name: 'Élève CM1',
    description: 'Atteindre la classe CM1',
    icon: '🎯',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'CM1' },
    reward: { type: 'badge', value: 'badge_cm1' },
  },
  {
    id: 'class_cm2',
    name: 'Élève CM2',
    description: 'Atteindre la classe CM2',
    icon: '📈',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'CM2' },
    reward: { type: 'badge', value: 'badge_cm2' },
  },
  {
    id: 'class_6e',
    name: 'Collégien 6e',
    description: 'Entrer au collège en 6e',
    icon: '⭐',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: '6e' },
    reward: { type: 'badge', value: 'badge_6e' },
  },
  {
    id: 'class_5e',
    name: 'Collégien 5e',
    description: 'Atteindre la classe 5e',
    icon: '🎯',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: '5e' },
    reward: { type: 'badge', value: 'badge_5e' },
  },
  {
    id: 'class_4e',
    name: 'Collégien 4e',
    description: 'Atteindre la classe 4e',
    icon: '📉',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: '4e' },
    reward: { type: 'badge', value: 'badge_4e' },
  },
  {
    id: 'class_3e',
    name: 'Collégien 3e',
    description: 'Maîtriser la classe 3e',
    icon: '⭐',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: '3e' },
    reward: { type: 'badge', value: 'badge_3e' },
  },
  {
    id: 'class_2de',
    name: 'Lycéen 2de',
    description: 'Entrer au lycée en 2de',
    icon: '🎯',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: '2de' },
    reward: { type: 'badge', value: 'badge_2de' },
  },
  {
    id: 'class_1re',
    name: 'Lycéen 1re',
    description: 'Atteindre la classe 1re',
    icon: '📈',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: '1re' },
    reward: { type: 'badge', value: 'badge_1re' },
  },
  {
    id: 'class_tle',
    name: 'Lycéen Tle',
    description: 'Maîtriser la classe Terminale',
    icon: '⭐',
    rarity: 'epic',
    category: 'milestone',
    requirement: { type: 'rank', value: 'Tle' },
    reward: { type: 'badge', value: 'badge_tle' },
  },
  {
    id: 'class_sup1',
    name: 'Étudiant Sup1',
    description: 'Entrer en Supérieur 1ère année',
    icon: '🎯',
    rarity: 'epic',
    category: 'milestone',
    requirement: { type: 'rank', value: 'Sup1' },
    reward: { type: 'badge', value: 'badge_sup1' },
  },
  {
    id: 'class_sup2',
    name: 'Étudiant Sup2',
    description: 'Atteindre la classe Sup2',
    icon: '📈',
    rarity: 'epic',
    category: 'milestone',
    requirement: { type: 'rank', value: 'Sup2' },
    reward: { type: 'badge', value: 'badge_sup2' },
  },
  {
    id: 'class_sup3',
    name: 'Étudiant Sup3',
    description: 'Maîtriser la classe Sup3',
    icon: '⭐',
    rarity: 'legendary',
    category: 'milestone',
    requirement: { type: 'rank', value: 'Sup3' },
    reward: { type: 'badge', value: 'badge_sup3' },
  },
  {
    id: 'class_pro',
    name: 'Professionnel Pro',
    description: 'Atteindre le niveau Professionnel',
    icon: '👑',
    rarity: 'legendary',
    category: 'milestone',
    requirement: { type: 'rank', value: 'Pro' },
    reward: { type: 'badge', value: 'badge_pro' },
  },

  // === ACHIEVEMENTS TOP JOUEURS ===
  {
    id: 'top_1_solo_monthly',
    name: 'Meilleur Joueur Solo du Mois',
    description: 'Terminer premier au classement solo ELO ce mois-ci',
    icon: '🏆',
    rarity: 'epic',
    category: 'social',
    requirement: { type: 'rank', value: 'top_1_solo_monthly' },
    reward: { type: 'badge', value: 'badge_top_solo' },
  },
  {
    id: 'top_1_multiplayer_monthly',
    name: 'Meilleur Joueur Multijoueur du Mois',
    description: 'Terminer premier au classement multijoueur ELO ce mois-ci',
    icon: '🏆',
    rarity: 'epic',
    category: 'social',
    requirement: { type: 'rank', value: 'top_1_multiplayer_monthly' },
    reward: { type: 'badge', value: 'badge_top_multiplayer' },
  },

  // === ACHIEVEMENTS PERFORMANCE ===
  {
    id: 'perfect_20_20',
    name: 'Perfection 20/20',
    description: 'Réussir un test avec 20/20 réponses correctes',
    icon: '🎯',
    rarity: 'rare',
    category: 'skill',
    requirement: { type: 'score', value: 20, condition: 'accuracy_100' },
    reward: { type: 'badge', value: 'badge_perfect' },
  },
  {
    id: 'speed_demon',
    name: 'Démon de la Vitesse',
    description: 'Répondre à 20 questions en moins de 30 secondes',
    icon: '⚡',
    rarity: 'rare',
    category: 'skill',
    requirement: { type: 'score', value: 30, condition: 'time_under_30s' },
    reward: { type: 'badge', value: 'badge_speed' },
  },
  {
    id: 'accuracy_master',
    name: 'Maître de la Précision',
    description: 'Maintenir une précision de 95% sur 100 questions consécutives',
    icon: '🎯',
    rarity: 'epic',
    category: 'skill',
    requirement: { type: 'accuracy', value: 95, condition: 'over_100_questions' },
    reward: { type: 'badge', value: 'badge_accuracy' },
  },

  // === ACHIEVEMENTS SÉRIES ===
  {
    id: 'streak_5',
    name: 'Série de 5',
    description: 'Réussir 5 tests daffilée',
    icon: '🔥',
    rarity: 'common',
    category: 'streak',
    requirement: { type: 'streak', value: 5 },
    reward: { type: 'badge', value: 'badge_streak_5' },
  },
  {
    id: 'streak_10',
    name: 'Série de 10',
    description: 'Réussir 10 tests daffilée',
    icon: '🔥',
    rarity: 'rare',
    category: 'streak',
    requirement: { type: 'streak', value: 10 },
    reward: { type: 'badge', value: 'badge_streak_10' },
  },
  {
    id: 'streak_30',
    name: 'Série de 30',
    description: 'Réussir 30 tests daffilée (un mois entier !)',
    icon: '🔥',
    rarity: 'epic',
    category: 'streak',
    requirement: { type: 'streak', value: 30 },
    reward: { type: 'badge', value: 'badge_streak_30' },
  },

  // === ACHIEVEMENTS MILESTONES ===
  {
    id: 'first_test',
    name: 'Premier Test',
    description: 'Passer ton premier test chronométré',
    icon: '🌟',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'tests', value: 1 },
    reward: { type: 'badge', value: 'badge_first_test' },
  },
  {
    id: 'tests_10',
    name: '10 Tests Réalisés',
    description: 'Compléter 10 tests chronométrés',
    icon: '📊',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'tests', value: 10 },
    reward: { type: 'badge', value: 'badge_tests_10' },
  },
  {
    id: 'tests_50',
    name: '50 Tests Réalisés',
    description: 'Compléter 50 tests chronométrés',
    icon: '📊',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'tests', value: 50 },
    reward: { type: 'badge', value: 'badge_tests_50' },
  },
  {
    id: 'tests_100',
    name: '100 Tests Réalisés',
    description: 'Compléter 100 tests chronométrés',
    icon: '🏆',
    rarity: 'epic',
    category: 'milestone',
    requirement: { type: 'tests', value: 100 },
    reward: { type: 'badge', value: 'badge_tests_100' },
  },
  {
    id: 'tests_500',
    name: '500 Tests Réalisés',
    description: 'Compléter 500 tests chronométrés',
    icon: '🏆',
    rarity: 'legendary',
    category: 'milestone',
    requirement: { type: 'tests', value: 500 },
    reward: { type: 'badge', value: 'badge_tests_500' },
  },

  // === ACHIEVEMENTS PARTIES JOUÉES ===
  {
    id: 'games_10',
    name: '10 Parties Jouées',
    description: 'Jouer 10 parties (solo ou multijoueur)',
    icon: '🎮',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'wins', value: 10 },
    reward: { type: 'badge', value: 'badge_games_10' },
  },
  {
    id: 'games_50',
    name: '50 Parties Jouées',
    description: 'Jouer 50 parties (solo ou multijoueur)',
    icon: '🎮',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'wins', value: 50 },
    reward: { type: 'badge', value: 'badge_games_50' },
  },
  {
    id: 'games_100',
    name: '100 Parties Jouées',
    description: 'Jouer 100 parties (solo ou multijoueur)',
    icon: '🎮',
    rarity: 'epic',
    category: 'milestone',
    requirement: { type: 'wins', value: 100 },
    reward: { type: 'badge', value: 'badge_games_100' },
  },
  {
    id: 'games_500',
    name: '500 Parties Jouées',
    description: 'Jouer 500 parties (solo ou multijoueur)',
    icon: '🎮',
    rarity: 'legendary',
    category: 'milestone',
    requirement: { type: 'wins', value: 500 },
    reward: { type: 'badge', value: 'badge_games_500' },
  },

  // === ACHIEVEMENTS SPÉCIAUX ===
  {
    id: 'early_bird',
    name: 'Matinal',
    description: 'Compléter un test avant 8h du matin',
    icon: '🌅',
    rarity: 'rare',
    category: 'special',
    requirement: { type: 'score', value: 1, condition: 'before_8am' },
    reward: { type: 'badge', value: 'badge_early_bird' },
  },
  {
    id: 'night_owl',
    name: 'Noctambule',
    description: 'Compléter un test après 22h',
    icon: '🦉',
    rarity: 'rare',
    category: 'special',
    requirement: { type: 'score', value: 1, condition: 'after_10pm' },
    reward: { type: 'badge', value: 'badge_night_owl' },
  },
  {
    id: 'weekend_warrior',
    name: 'Guerrier du Week-End',
    description: 'Compléter 5 tests pendant un week-end',
    icon: '⚔️',
    rarity: 'rare',
    category: 'special',
    requirement: { type: 'score', value: 5, condition: 'on_weekend' },
    reward: { type: 'badge', value: 'badge_weekend_warrior' },
  },
];

export const BADGES: Badge[] = [
  // === BADGES DE CLASSE FRANÇAISE ===
  {
    id: 'badge_cp',
    name: 'Badge CP',
    description: 'Badge pour les élèves de classe CP',
    icon: '🥉',
    color: '#7DCEA0',
    requirement: { type: 'rank', value: 'CP' },
  },
  {
    id: 'badge_ce1',
    name: 'Badge CE1',
    description: 'Badge pour les élèves de classe CE1',
    icon: '🥉',
    color: '#52BE80',
    requirement: { type: 'rank', value: 'CE1' },
  },
  {
    id: 'badge_ce2',
    name: 'Badge CE2',
    description: 'Badge pour les élèves de classe CE2',
    icon: '⭐',
    color: '#27AE60',
    requirement: { type: 'rank', value: 'CE2' },
  },
  {
    id: 'badge_cm1',
    name: 'Badge CM1',
    description: 'Badge pour les élèves de classe CM1',
    icon: '🥉',
    color: '#76D7C4',
    requirement: { type: 'rank', value: 'CM1' },
  },
  {
    id: 'badge_cm2',
    name: 'Badge CM2',
    description: 'Badge pour les élèves de classe CM2',
    icon: '�',
    color: '#48C9B0',
    requirement: { type: 'rank', value: 'CM2' },
  },
  {
    id: 'badge_6e',
    name: 'Badge 6e',
    description: 'Badge pour les collégiens de classe 6e',
    icon: '⭐',
    color: '#1ABC9C',
    requirement: { type: 'rank', value: '6e' },
  },
  {
    id: 'badge_5e',
    name: 'Badge 5e',
    description: 'Badge pour les collégiens de classe 5e',
    icon: '🥉',
    color: '#85C1E9',
    requirement: { type: 'rank', value: '5e' },
  },
  {
    id: 'badge_4e',
    name: 'Badge 4e',
    description: 'Badge pour les collégiens de classe 4e',
    icon: '🥉',
    color: '#5DADE2',
    requirement: { type: 'rank', value: '4e' },
  },
  {
    id: 'badge_3e',
    name: 'Badge 3e',
    description: 'Badge pour les collégiens de classe 3e',
    icon: '⭐',
    color: '#3498DB',
    requirement: { type: 'rank', value: '3e' },
  },
  {
    id: 'badge_2de',
    name: 'Badge 2de',
    description: 'Badge pour les lycéens de classe 2de',
    icon: '⭐',
    color: '#C39BD3',
    requirement: { type: 'rank', value: '2de' },
  },
  {
    id: 'badge_1re',
    name: 'Badge 1re',
    description: 'Badge pour les lycéens de classe 1re',
    icon: '🥉',
    color: '#AF7AC5',
    requirement: { type: 'rank', value: '1re' },
  },
  {
    id: 'badge_tle',
    name: 'Badge Tle',
    description: 'Badge pour les lycéens de classe Terminale',
    icon: '⭐',
    color: '#9B59B6',
    requirement: { type: 'rank', value: 'Tle' },
  },
  {
    id: 'badge_sup1',
    name: 'Badge Sup1',
    description: 'Badge pour les étudiants de classe Sup1',
    icon: '🎖️',
    color: '#FF6B35',
    requirement: { type: 'rank', value: 'Sup1' },
  },
  {
    id: 'badge_sup2',
    name: 'Badge Sup2',
    description: 'Badge pour les étudiants de classe Sup2',
    icon: '💎',
    color: '#C0C0C0',
    requirement: { type: 'rank', value: 'Sup2' },
  },
  {
    id: 'badge_sup3',
    name: 'Badge Sup3',
    description: 'Badge pour les étudiants de classe Sup3',
    icon: '⭐',
    color: '#FFA500',
    requirement: { type: 'rank', value: 'Sup3' },
  },
  {
    id: 'badge_pro',
    name: 'Badge Pro',
    description: 'Badge pour les professionnels de classe Pro',
    icon: '🏆',
    color: '#FFD700',
    requirement: { type: 'rank', value: 'Pro' },
  },

  // === BADGES SPÉCIAUX ===
  {
    id: 'badge_top_solo',
    name: 'Top Solo',
    description: 'Badge pour le meilleur joueur solo du mois',
    icon: '🏆',
    color: '#ffd700',
    requirement: { type: 'achievement', value: 'top_1_solo_monthly' },
  },
  {
    id: 'badge_top_multiplayer',
    name: 'Top Multijoueur',
    description: 'Badge pour le meilleur joueur multijoueur du mois',
    icon: '🏆',
    color: '#ff6b35',
    requirement: { type: 'achievement', value: 'top_1_multiplayer_monthly' },
  },
  {
    id: 'badge_perfect',
    name: 'Perfection',
    description: 'Badge pour un test parfait 20/20',
    icon: '🎯',
    color: '#22c55e',
    requirement: { type: 'achievement', value: 'perfect_20_20' },
  },
  {
    id: 'badge_speed',
    name: 'Vitesse',
    description: 'Badge pour démon de la vitesse',
    icon: '⚡',
    color: '#064e3b',
    requirement: { type: 'achievement', value: 'speed_demon' },
  },
  {
    id: 'badge_accuracy',
    name: 'Précision',
    description: 'Badge pour maître de la précision',
    icon: '🎯',
    color: '#10b981',
    requirement: { type: 'achievement', value: 'accuracy_master' },
  },
  {
    id: 'badge_streak_5',
    name: 'Série 5',
    description: 'Badge pour une série de 5 tests',
    icon: '🔥',
    color: '#f59e0b',
    requirement: { type: 'achievement', value: 'streak_5' },
  },
  {
    id: 'badge_streak_10',
    name: 'Série 10',
    description: 'Badge pour une série de 10 tests',
    icon: '🔥',
    color: '#fbbf24',
    requirement: { type: 'achievement', value: 'streak_10' },
  },
  {
    id: 'badge_streak_30',
    name: 'Série 30',
    description: 'Badge pour une série de 30 tests',
    icon: '🔥',
    color: '#ff6b35',
    requirement: { type: 'achievement', value: 'streak_30' },
  },
  {
    id: 'badge_first_test',
    name: 'Premier Test',
    description: 'Badge pour le premier test',
    icon: '🌟',
    color: '#22c55e',
    requirement: { type: 'achievement', value: 'first_test' },
  },
  {
    id: 'badge_tests_10',
    name: '10 Tests',
    description: 'Badge pour 10 tests complétés',
    icon: '📊',
    color: '#10b981',
    requirement: { type: 'achievement', value: 'tests_10' },
  },
  {
    id: 'badge_tests_50',
    name: '50 Tests',
    description: 'Badge pour 50 tests complétés',
    icon: '📊',
    color: '#064e3b',
    requirement: { type: 'achievement', value: 'tests_50' },
  },
  {
    id: 'badge_tests_100',
    name: '100 Tests',
    description: 'Badge pour 100 tests complétés',
    icon: '🏆',
    color: '#16a34a',
    requirement: { type: 'achievement', value: 'tests_100' },
  },
  {
    id: 'badge_tests_500',
    name: '500 Tests',
    description: 'Badge pour 500 tests complétés',
    icon: '🏆',
    color: '#fbbf24',
    requirement: { type: 'achievement', value: 'tests_500' },
  },
  {
    id: 'badge_games_10',
    name: '10 Parties',
    description: 'Badge pour 10 parties jouées',
    icon: '🎮',
    color: '#22c55e',
    requirement: { type: 'achievement', value: 'games_10' },
  },
  {
    id: 'badge_games_50',
    name: '50 Parties',
    description: 'Badge pour 50 parties jouées',
    icon: '🎮',
    color: '#064e3b',
    requirement: { type: 'achievement', value: 'games_50' },
  },
  {
    id: 'badge_games_100',
    name: '100 Parties',
    description: 'Badge pour 100 parties jouées',
    icon: '🎮',
    color: '#16a34a',
    requirement: { type: 'achievement', value: 'games_100' },
  },
  {
    id: 'badge_games_500',
    name: '500 Parties',
    description: 'Badge pour 500 parties jouées',
    icon: '🎮',
    color: '#fbbf24',
    requirement: { type: 'achievement', value: 'games_500' },
  },
  {
    id: 'badge_early_bird',
    name: 'Matinal',
    description: 'Badge pour les tests du matin',
    icon: '🌅',
    color: '#fbbf24',
    requirement: { type: 'achievement', value: 'early_bird' },
  },
  {
    id: 'badge_night_owl',
    name: 'Noctambule',
    description: 'Badge pour les tests du soir',
    icon: '🦉',
    color: '#064e3b',
    requirement: { type: 'achievement', value: 'night_owl' },
  },
  {
    id: 'badge_weekend_warrior',
    name: 'Week-End Warrior',
    description: 'Badge pour les guerriers du week-end',
    icon: '⚔️',
    color: '#ff6b35',
    requirement: { type: 'achievement', value: 'weekend_warrior' },
  },
];

// Fonctions utilitaires
export const getAchievementsForUser = (userStats: any) => {
  const unlockedAchievements: Achievement[] = [];
  
  // Vérifier chaque achievement
  ACHIEVEMENTS.forEach(achievement => {
    const isUnlocked = checkAchievementRequirement(achievement, userStats);
    
    if (isUnlocked && !userStats.achievements?.includes(achievement.id)) {
      unlockedAchievements.push({
        ...achievement,
        unlocked: true,
        unlockedAt: new Date(),
      });
    }
  });
  
  return unlockedAchievements;
};

export const getBadgesForUser = (userStats: any) => {
  const unlockedBadges: Badge[] = [];
  
  // Vérifier chaque badge
  BADGES.forEach(badge => {
    const isUnlocked = checkBadgeRequirement(badge, userStats);
    
    if (isUnlocked && !userStats.badges?.includes(badge.id)) {
      unlockedBadges.push({
        ...badge,
        equipped: false,
        unlockedAt: new Date(),
      });
    }
  });
  
  return unlockedBadges;
};

const checkAchievementRequirement = (achievement: Achievement, userStats: any): boolean => {
  const { type, value, condition } = achievement.requirement;
  
  switch (type) {
    case 'rank':
      return userStats.soloClass === value;
    
    case 'score':
      if (condition === 'accuracy_100') {
        return userStats.lastTest?.accuracy === 100;
      }
      if (condition === 'time_under_30s') {
        return userStats.lastTest?.timeSpent && userStats.lastTest.timeSpent <= 30;
      }
      if (condition === 'before_8am') {
        const testHour = new Date(userStats.lastTest?.completedAt).getHours();
        return testHour >= 6 && testHour < 8;
      }
      if (condition === 'after_10pm') {
        const testHour = new Date(userStats.lastTest?.completedAt).getHours();
        return testHour >= 22;
      }
      if (condition === 'on_weekend') {
        const testDate = new Date(userStats.lastTest?.completedAt);
        const dayOfWeek = testDate.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Dimanche ou Samedi
      }
      return userStats.bestScore >= value;
    
    case 'tests':
      return userStats.totalTests >= value;
    
    case 'wins':
      return userStats.totalGames >= value;
    
    case 'accuracy':
      return userStats.averageAccuracy >= value;
    
    case 'streak':
      return (userStats as any).soloCurrentStreak >= value;
    
    default:
      return false;
  }
};

const checkBadgeRequirement = (badge: Badge, userStats: any): boolean => {
  const { type, value } = badge.requirement;
  
  switch (type) {
    case 'rank':
      return userStats.soloClass === value;
    
    case 'achievement':
      return userStats.achievements?.includes(value);
    
    default:
      return false;
  }
};

export const getTopPlayerRole = (category: 'solo' | 'multiplayer'): string => {
  switch (category) {
    case 'solo':
      return 'Top Solo';
    case 'multiplayer':
      return 'Top Multijoueur';
    default:
      return 'Joueur';
  }
};
