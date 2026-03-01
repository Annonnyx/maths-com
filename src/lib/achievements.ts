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
  // === ACHIEVEMENTS PAR CLASSE ===
  {
    id: 'class_f_minus',
    name: 'Débutant F-',
    description: 'Atteindre la classe F- pour la première fois',
    icon: '🎯',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'F-' },
    reward: { type: 'badge', value: 'badge_f_minus' },
  },
  {
    id: 'class_f',
    name: 'Calculateur F',
    description: 'Atteindre la classe F',
    icon: '📊',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'F' },
    reward: { type: 'badge', value: 'badge_f' },
  },
  {
    id: 'class_f_plus',
    name: 'Calculateur F+',
    description: 'Maîtriser la classe F',
    icon: '⭐',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: 'F+' },
    reward: { type: 'badge', value: 'badge_f_plus' },
  },
  {
    id: 'class_e_minus',
    name: 'Débutant E-',
    description: 'Atteindre la classe E- pour la première fois',
    icon: '🎯',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'E-' },
    reward: { type: 'badge', value: 'badge_e_minus' },
  },
  {
    id: 'class_e',
    name: 'Calculateur E',
    description: 'Atteindre la classe E',
    icon: '📈',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'E' },
    reward: { type: 'badge', value: 'badge_e' },
  },
  {
    id: 'class_e_plus',
    name: 'Calculateur E+',
    description: 'Maîtriser la classe E',
    icon: '⭐',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: 'E+' },
    reward: { type: 'badge', value: 'badge_e_plus' },
  },
  {
    id: 'class_d_minus',
    name: 'Débutant D-',
    description: 'Atteindre la classe D- pour la première fois',
    icon: '🎯',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'D-' },
    reward: { type: 'badge', value: 'badge_d_minus' },
  },
  {
    id: 'class_d',
    name: 'Calculateur D',
    description: 'Atteindre la classe D',
    icon: '📉',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'D' },
    reward: { type: 'badge', value: 'badge_d' },
  },
  {
    id: 'class_d_plus',
    name: 'Calculateur D+',
    description: 'Maîtriser la classe D',
    icon: '⭐',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: 'D+' },
    reward: { type: 'badge', value: 'badge_d_plus' },
  },
  {
    id: 'class_c_minus',
    name: 'Débutant C-',
    description: 'Atteindre la classe C- pour la première fois',
    icon: '🎯',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'C-' },
    reward: { type: 'badge', value: 'badge_c_minus' },
  },
  {
    id: 'class_c',
    name: 'Calculateur C',
    description: 'Atteindre la classe C',
    icon: '📈',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'C' },
    reward: { type: 'badge', value: 'badge_c' },
  },
  {
    id: 'class_c_plus',
    name: 'Calculateur C+',
    description: 'Maîtriser la classe C',
    icon: '⭐',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: 'C+' },
    reward: { type: 'badge', value: 'badge_c_plus' },
  },
  {
    id: 'class_b_minus',
    name: 'Débutant B-',
    description: 'Atteindre la classe B- pour la première fois',
    icon: '🎯',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'B-' },
    reward: { type: 'badge', value: 'badge_b_minus' },
  },
  {
    id: 'class_b',
    name: 'Calculateur B',
    description: 'Atteindre la classe B',
    icon: '📉',
    rarity: 'common',
    category: 'milestone',
    requirement: { type: 'rank', value: 'B' },
    reward: { type: 'badge', value: 'badge_b' },
  },
  {
    id: 'class_b_plus',
    name: 'Calculateur B+',
    description: 'Maîtriser la classe B',
    icon: '⭐',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: 'B+' },
    reward: { type: 'badge', value: 'badge_b_plus' },
  },
  {
    id: 'class_a_minus',
    name: 'Débutant A-',
    description: 'Atteindre la classe A- pour la première fois',
    icon: '🎯',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: 'A-' },
    reward: { type: 'badge', value: 'badge_a_minus' },
  },
  {
    id: 'class_a',
    name: 'Calculateur A',
    description: 'Atteindre la classe A',
    icon: '📈',
    rarity: 'rare',
    category: 'milestone',
    requirement: { type: 'rank', value: 'A' },
    reward: { type: 'badge', value: 'badge_a' },
  },
  {
    id: 'class_a_plus',
    name: 'Calculateur A+',
    description: 'Maîtriser la classe A+',
    icon: '👑',
    rarity: 'epic',
    category: 'milestone',
    requirement: { type: 'rank', value: 'A+' },
    reward: { type: 'badge', value: 'badge_a_plus' },
  },
  {
    id: 'class_s_minus',
    name: 'Débutant S-',
    description: 'Atteindre la classe S- pour la première fois',
    icon: '🎯',
    rarity: 'epic',
    category: 'milestone',
    requirement: { type: 'rank', value: 'S-' },
    reward: { type: 'badge', value: 'badge_s_minus' },
  },
  {
    id: 'class_s',
    name: 'Calculateur S',
    description: 'Atteindre la classe S',
    icon: '📈',
    rarity: 'epic',
    category: 'milestone',
    requirement: { type: 'rank', value: 'S' },
    reward: { type: 'badge', value: 'badge_s' },
  },
  {
    id: 'class_s_plus',
    name: 'Mathématicien S+',
    description: 'Atteindre la classe S+',
    icon: '👑',
    rarity: 'legendary',
    category: 'milestone',
    requirement: { type: 'rank', value: 'S+' },
    reward: { type: 'badge', value: 'badge_s_plus' },
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
  // === BADGES DE CLASSE ===
  {
    id: 'badge_f_minus',
    name: 'Badge F-',
    description: 'Badge pour les joueurs de classe F-',
    icon: '🥉',
    color: '#ef4444',
    requirement: { type: 'rank', value: 'F-' },
  },
  {
    id: 'badge_f',
    name: 'Badge F',
    description: 'Badge pour les joueurs de classe F',
    icon: '🥉',
    color: '#f59e0b',
    requirement: { type: 'rank', value: 'F' },
  },
  {
    id: 'badge_f_plus',
    name: 'Badge F+',
    description: 'Badge pour les joueurs experts de classe F',
    icon: '⭐',
    color: '#fbbf24',
    requirement: { type: 'rank', value: 'F+' },
  },
  {
    id: 'badge_e_minus',
    name: 'Badge E-',
    description: 'Badge pour les joueurs de classe E-',
    icon: '🥉',
    color: '#eab308',
    requirement: { type: 'rank', value: 'E-' },
  },
  {
    id: 'badge_e',
    name: 'Badge E',
    description: 'Badge pour les joueurs de classe E',
    icon: '🥈',
    color: '#22c55e',
    requirement: { type: 'rank', value: 'E' },
  },
  {
    id: 'badge_e_plus',
    name: 'Badge E+',
    description: 'Badge pour les joueurs experts de classe E',
    icon: '⭐',
    color: '#10b981',
    requirement: { type: 'rank', value: 'E+' },
  },
  {
    id: 'badge_d_minus',
    name: 'Badge D-',
    description: 'Badge pour les joueurs de classe D-',
    icon: '🥉',
    color: '#3b82f6',
    requirement: { type: 'rank', value: 'D-' },
  },
  {
    id: 'badge_d',
    name: 'Badge D',
    description: 'Badge pour les joueurs de classe D',
    icon: '🥉',
    color: '#8b5cf6',
    requirement: { type: 'rank', value: 'D' },
  },
  {
    id: 'badge_d_plus',
    name: 'Badge D+',
    description: 'Badge pour les joueurs experts de classe D',
    icon: '⭐',
    color: '#064e3b',
    requirement: { type: 'rank', value: 'D+' },
  },
  {
    id: 'badge_c_minus',
    name: 'Badge C-',
    description: 'Badge pour les joueurs de classe C-',
    icon: '🥉',
    color: '#dc2626',
    requirement: { type: 'rank', value: 'C-' },
  },
  {
    id: 'badge_c',
    name: 'Badge C',
    description: 'Badge pour les joueurs de classe C',
    icon: '🥉',
    color: '#059669',
    requirement: { type: 'rank', value: 'C' },
  },
  {
    id: 'badge_c_plus',
    name: 'Badge C+',
    description: 'Badge pour les joueurs experts de classe C',
    icon: '⭐',
    color: '#16a34a',
    requirement: { type: 'rank', value: 'C+' },
  },
  {
    id: 'badge_b_minus',
    name: 'Badge B-',
    description: 'Badge pour les joueurs de classe B-',
    icon: '🥉',
    color: '#64748b',
    requirement: { type: 'rank', value: 'B-' },
  },
  {
    id: 'badge_b',
    name: 'Badge B',
    description: 'Badge pour les joueurs de classe B',
    icon: '🥉',
    color: '#84cc16',
    requirement: { type: 'rank', value: 'B' },
  },
  {
    id: 'badge_b_plus',
    name: 'Badge B+',
    description: 'Badge pour les joueurs experts de classe B',
    icon: '⭐',
    color: '#22c55e',
    requirement: { type: 'rank', value: 'B+' },
  },
  {
    id: 'badge_a_minus',
    name: 'Badge A-',
    description: 'Badge pour les joueurs de classe A-',
    icon: '🥉',
    color: '#f59e0b',
    requirement: { type: 'rank', value: 'A-' },
  },
  {
    id: 'badge_a',
    name: 'Badge A',
    description: 'Badge pour les joueurs de classe A',
    icon: '🥉',
    color: '#eab308',
    requirement: { type: 'rank', value: 'A' },
  },
  {
    id: 'badge_a_plus',
    name: 'Badge A+',
    description: 'Badge pour les joueurs experts de classe A',
    icon: '🏆',
    color: '#fbbf24',
    requirement: { type: 'rank', value: 'A+' },
  },
  {
    id: 'badge_s_minus',
    name: 'Badge S-',
    description: 'Badge pour les joueurs de classe S-',
    icon: '🥉',
    color: '#8b5cf6',
    requirement: { type: 'rank', value: 'S-' },
  },
  {
    id: 'badge_s',
    name: 'Badge S',
    description: 'Badge pour les joueurs de classe S',
    icon: '🥉',
    color: '#059669',
    requirement: { type: 'rank', value: 'S' },
  },
  {
    id: 'badge_s_plus',
    name: 'Badge S+',
    description: 'Badge pour les mathématiciens de classe S+',
    icon: '🏆',
    color: '#16a34a',
    requirement: { type: 'rank', value: 'S+' },
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
      return userStats.rank === value;
    
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
      return userStats.rank === value;
    
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
