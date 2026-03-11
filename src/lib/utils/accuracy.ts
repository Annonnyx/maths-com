/**
 * Utilitaires pour le calcul de la précision (accuracy)
 * Standardisation du calcul dans toute l'application
 */

export interface AccuracyStats {
  totalQuestions?: number;
  totalCorrect?: number;
  totalTests?: number;
  averageScore?: number;
  averageTime?: number;
}

/**
 * Calcule la précision standardisée
 * @param stats - Statistiques de l'utilisateur
 * @returns Précision en pourcentage (0-100)
 */
export function calculateAccuracy(stats: AccuracyStats): number {
  const { totalQuestions = 0, totalCorrect = 0 } = stats;
  
  if (totalQuestions === 0) {
    return 0;
  }
  
  return Math.round((totalCorrect / totalQuestions) * 100);
}

/**
 * Calcule la précision alternative (basée sur le score moyen)
 * @param stats - Statistiques de l'utilisateur  
 * @returns Précision en pourcentage (0-100)
 */
export function calculateAccuracyFromScore(stats: AccuracyStats): number {
  const { averageScore = 0 } = stats;
  
  // Le score moyen est déjà un pourcentage (0-100)
  return Math.round(averageScore);
}

/**
 * Calcule la précision pour le leaderboard
 * @param stats - Statistiques de l'utilisateur
 * @param mode - Mode de jeu ('solo' ou 'multiplayer')
 * @returns Précision en pourcentage ou null pour multiplayer
 */
export function calculateLeaderboardAccuracy(stats: AccuracyStats, mode: 'solo' | 'multiplayer'): number | null {
  if (mode === 'multiplayer') {
    return null; // Le multijoueur ne suit pas les précisions
  }
  
  return calculateAccuracy(stats);
}

/**
 * Formate les statistiques avec précision standardisée
 * @param stats - Statistiques brutes
 * @returns Statistiques formatées avec précision
 */
export function formatStatsWithAccuracy(stats: AccuracyStats) {
  const accuracy = calculateAccuracy(stats);
  
  return {
    totalTests: stats.totalTests || 0,
    totalQuestions: stats.totalQuestions || 0,
    correctAnswers: stats.totalCorrect || 0,
    averageTime: stats.averageTime || 0,
    averageScore: stats.averageScore || 0,
    accuracy
  };
}
