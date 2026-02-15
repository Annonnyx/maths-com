// Rank classes from F- to S+
export const RANK_CLASSES = [
  'F-', 'F', 'F+',
  'E-', 'E', 'E+',
  'D-', 'D', 'D+',
  'C-', 'C', 'C+',
  'B-', 'B', 'B+',
  'A-', 'A', 'A+',
  'S-', 'S', 'S+'
] as const;

export type RankClass = typeof RANK_CLASSES[number];

// Elo thresholds for each rank
export const RANK_THRESHOLDS: Record<RankClass, { min: number; max: number }> = {
  'F-': { min: 0, max: 499 },
  'F': { min: 500, max: 599 },
  'F+': { min: 600, max: 699 },
  'E-': { min: 700, max: 799 },
  'E': { min: 800, max: 899 },
  'E+': { min: 900, max: 999 },
  'D-': { min: 1000, max: 1099 },
  'D': { min: 1100, max: 1199 },
  'D+': { min: 1200, max: 1299 },
  'C-': { min: 1300, max: 1399 },
  'C': { min: 1400, max: 1499 },
  'C+': { min: 1500, max: 1649 },
  'B-': { min: 1650, max: 1799 },
  'B': { min: 1800, max: 1949 },
  'B+': { min: 1950, max: 2099 },
  'A-': { min: 2100, max: 2299 },
  'A': { min: 2300, max: 2499 },
  'A+': { min: 2500, max: 2749 },
  'S-': { min: 2750, max: 2999 },
  'S': { min: 3000, max: 3499 },
  'S+': { min: 3500, max: Infinity }
};

// Colors for each rank tier
export const RANK_COLORS: Record<string, string> = {
  'F': 'text-gray-500',
  'E': 'text-green-500',
  'D': 'text-teal-500',
  'C': 'text-blue-500',
  'B': 'text-purple-500',
  'A': 'text-orange-500',
  'S': 'text-yellow-500'
};

export const RANK_BG_COLORS: Record<string, string> = {
  'F': 'bg-gray-500/20 border-gray-500',
  'E': 'bg-green-500/20 border-green-500',
  'D': 'bg-teal-500/20 border-teal-500',
  'C': 'bg-blue-500/20 border-blue-500',
  'B': 'bg-purple-500/20 border-purple-500',
  'A': 'bg-orange-500/20 border-orange-500',
  'S': 'bg-yellow-500/20 border-yellow-500'
};

// Get rank class from Elo
export function getRankFromElo(elo: number): RankClass {
  for (const [rank, { min, max }] of Object.entries(RANK_THRESHOLDS)) {
    if (elo >= min && elo <= max) {
      return rank as RankClass;
    }
  }
  return 'F-';
}

// Get next rank class
export function getNextRank(currentRank: RankClass): RankClass | null {
  const index = RANK_CLASSES.indexOf(currentRank);
  if (index < RANK_CLASSES.length - 1) {
    return RANK_CLASSES[index + 1];
  }
  return null;
}

// Get progress to next rank (0-100)
export function getRankProgress(elo: number, rank: RankClass): number {
  const threshold = RANK_THRESHOLDS[rank];
  const range = threshold.max - threshold.min;
  const progress = elo - threshold.min;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

// Calculate Elo change based on test performance
export function calculateEloChange(
  correctAnswers: number,
  totalQuestions: number = 20,
  currentStreak: number = 0
): number {
  const score = (correctAnswers / totalQuestions) * 100;
  
  // Base Elo change based on score
  let eloChange = 0;
  
  if (score < 50) {
    // Below 10/20 = lose Elo
    eloChange = -Math.round((50 - score) * 2);
  } else if (score < 60) {
    // 10-11/20 = minimal gain
    eloChange = Math.round((score - 50) * 1.5);
  } else if (score < 80) {
    // 12-15/20 = moderate gain
    eloChange = Math.round((score - 50) * 2);
  } else if (score < 100) {
    // 16-19/20 = good gain
    eloChange = Math.round((score - 50) * 2.5);
  } else {
    // 20/20 = excellent gain + perfect bonus
    eloChange = Math.round((score - 50) * 3) + 50;
  }
  
  // Streak bonus
  if (currentStreak > 0) {
    eloChange += Math.min(currentStreak * 5, 50); // Max +50 for streaks
  }
  
  return eloChange;
}

// Advanced Elo calculation with time, difficulty, and performance metrics
export interface TestResult {
  correctAnswers: number;
  totalQuestions: number;
  totalTimeSeconds: number;
  questionTimes: number[];
  difficulties: number[];
  isCorrectArray?: boolean[]; // Array indicating which questions were correct
  currentElo: number;
  streak: number;
}

export function calculateAdvancedEloChange(result: TestResult): {
  eloChange: number;
  performance: {
    speedBonus: number;
    accuracyBonus: number;
    difficultyBonus: number;
    streakBonus: number;
    baseChange: number;
  };
} {
  const { correctAnswers, totalQuestions, totalTimeSeconds, difficulties, isCorrectArray, currentElo, streak } = result;
  const score = (correctAnswers / totalQuestions) * 100;
  
  // 1. BASE SCORE CALCULATION
  let baseChange = 0;
  if (score < 50) {
    baseChange = -Math.round((50 - score) * 2.5); // More punishing for low scores
  } else if (score < 60) {
    baseChange = Math.round((score - 50) * 1.5);
  } else if (score < 70) {
    baseChange = Math.round((score - 50) * 2);
  } else if (score < 80) {
    baseChange = Math.round((score - 50) * 2.5);
  } else if (score < 90) {
    baseChange = Math.round((score - 50) * 3);
  } else if (score < 100) {
    baseChange = Math.round((score - 50) * 3.5);
  } else {
    baseChange = 100; // Perfect score = flat 100 base
  }
  
  // 2. SPEED BONUS/PENALTY - Always applied, even on failure
  // Average time per question: target is 5 seconds for competitive
  const avgTimePerQuestion = totalTimeSeconds / totalQuestions;
  let speedBonus = 0;
  
  if (avgTimePerQuestion <= 3) {
    speedBonus = 30; // Lightning fast
  } else if (avgTimePerQuestion <= 5) {
    speedBonus = 20; // Very fast
  } else if (avgTimePerQuestion <= 8) {
    speedBonus = 10; // Good speed
  } else if (avgTimePerQuestion <= 12) {
    speedBonus = 0; // Normal
  } else if (avgTimePerQuestion <= 20) {
    speedBonus = -10; // Slow
  } else {
    speedBonus = -20; // Too slow - penalty!
  }
  
  // If score is very low, the time penalty is even worse
  if (score < 50 && avgTimePerQuestion > 15) {
    speedBonus -= 15; // Additional penalty for being slow AND wrong
  }
  
  // 3. DIFFICULTY BONUS
  const avgDifficulty = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
  const difficultyBonus = Math.round((avgDifficulty - 5) * 3); // Bonus for higher difficulty questions
  
  // 4. ACCURACY BONUS for high difficulty questions
  let accuracyBonus = 0;
  const hardQuestionIndices = difficulties
    .map((d, i) => d >= 7 ? i : -1)
    .filter(i => i !== -1);
  const hardQuestions = hardQuestionIndices.length;
  
  // Use isCorrectArray if provided, otherwise fall back to old logic
  let correctHardQuestions = 0;
  if (isCorrectArray && isCorrectArray.length > 0) {
    correctHardQuestions = hardQuestionIndices.filter(i => isCorrectArray[i]).length;
  } else {
    // Fallback: assume first 'correctAnswers' are correct (buggy but backwards compatible)
    correctHardQuestions = difficulties.filter((d, i) => d >= 7 && i < correctAnswers).length;
  }
  
  if (hardQuestions > 0) {
    const hardAccuracy = (correctHardQuestions / hardQuestions) * 100;
    if (hardAccuracy >= 80) {
      accuracyBonus = 25; // Master bonus
    } else if (hardAccuracy >= 60) {
      accuracyBonus = 15;
    } else if (hardAccuracy >= 40) {
      accuracyBonus = 5;
    }
  }
  
  // 5. STREAK BONUS
  const streakBonus = Math.min(streak * 8, 80); // Max 80 for long streaks, higher than before
  
  // 6. ELO SCALING (diminishing returns for high Elo)
  let eloScaling = 1;
  if (currentElo >= 1400) {
    eloScaling = 0.7; // S tier players get reduced gains
  } else if (currentElo >= 1200) {
    eloScaling = 0.8; // A tier
  } else if (currentElo >= 1000) {
    eloScaling = 0.9; // B tier
  } else if (currentElo < 600) {
    eloScaling = 1.2; // Beginners get bonus to climb faster
  }
  
  // Calculate final Elo change
  const rawChange = baseChange + speedBonus + difficultyBonus + accuracyBonus + streakBonus;
  const eloChange = Math.round(rawChange * eloScaling);
  
  return {
    eloChange,
    performance: {
      speedBonus,
      accuracyBonus,
      difficultyBonus,
      streakBonus,
      baseChange
    }
  };
}

// Calculate rank tier for display
export function getPerformanceTier(eloChange: number): {
  tier: 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  message: string;
} {
  if (eloChange >= 150) return { tier: 'SS', color: 'text-purple-400', message: 'Légendaire!' };
  if (eloChange >= 100) return { tier: 'S', color: 'text-yellow-400', message: 'Exceptionnel!' };
  if (eloChange >= 60) return { tier: 'A', color: 'text-green-400', message: 'Excellent!' };
  if (eloChange >= 30) return { tier: 'B', color: 'text-blue-400', message: 'Très bien!' };
  if (eloChange >= 10) return { tier: 'C', color: 'text-teal-400', message: 'Bien joué!' };
  if (eloChange >= 0) return { tier: 'D', color: 'text-gray-400', message: 'Passable' };
  return { tier: 'F', color: 'text-red-400', message: 'À réviser...' };
}

// Get operation types unlocked at each level
export function getUnlockedOperations(elo: number): string[] {
  const operations = ['addition', 'mental_math', 'logic'];
  
  if (elo >= 450) operations.push('subtraction');
  if (elo >= 500) operations.push('percentage');
  if (elo >= 550) operations.push('multiplication');
  if (elo >= 600) operations.push('fraction');
  if (elo >= 700) operations.push('division');
  if (elo >= 800) operations.push('equation');
  if (elo >= 900) operations.push('power');
  if (elo >= 1000) operations.push('root');
  if (elo >= 1100) operations.push('factorization');
  
  return operations;
}

// Check if operation is unlocked
export function isOperationUnlocked(elo: number, operation: string): boolean {
  const unlocked = getUnlockedOperations(elo);
  return unlocked.includes(operation);
}
