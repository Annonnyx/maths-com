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

// Elo thresholds for each rank - consistent 100 point gaps
export const RANK_THRESHOLDS: Record<RankClass, { min: number; max: number }> = {
  'F-': { min: 0, max: 399 },
  'F': { min: 400, max: 499 },
  'F+': { min: 500, max: 599 },
  'E-': { min: 600, max: 699 },
  'E': { min: 700, max: 799 },
  'E+': { min: 800, max: 899 },
  'D-': { min: 900, max: 999 },
  'D': { min: 1000, max: 1099 },
  'D+': { min: 1100, max: 1199 },
  'C-': { min: 1200, max: 1299 },
  'C': { min: 1300, max: 1399 },
  'C+': { min: 1400, max: 1499 },
  'B-': { min: 1500, max: 1599 },
  'B': { min: 1600, max: 1699 },
  'B+': { min: 1700, max: 1799 },
  'A-': { min: 1800, max: 1899 },
  'A': { min: 1900, max: 1999 },
  'A+': { min: 2000, max: 2099 },
  'S-': { min: 2100, max: 2249 },
  'S': { min: 2250, max: 2499 },
  'S+': { min: 2500, max: Infinity }
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

// Clamp ELO within reasonable bounds
export function clampElo(elo: number): number {
  return Math.max(0, Math.min(4000, elo));
}

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

// Calculate Elo change based on performance vs expected
export function calculateEloChange(
  playerElo: number,
  questionElo: number,  
  score: number, // 0 or 1
  responseTime: number,
  maxTime: number,
  streak: number,
  isMultiplayer: boolean
): number {
  // Expected score using Elo formula
  const expectedScore = 1 / (1 + Math.pow(10, (questionElo - playerElo) / 400));
  
  // K-factor: higher for multiplayer, lower for high Elo players
  let kFactor = isMultiplayer ? 32 : 24;
  
  // Reduce K-factor for high Elo players to prevent inflation
  if (playerElo > 2000) kFactor *= 0.7;
  else if (playerElo > 1500) kFactor *= 0.85;
  
  // Time bonus/penalty
  let timeBonus = 0;
  const timeRatio = responseTime / maxTime;
  if (score === 1) { // Only apply time bonus for correct answers
    if (timeRatio < 0.3) timeBonus = 5; // Very fast
    else if (timeRatio < 0.5) timeBonus = 3; // Fast
    else if (timeRatio > 1.5) timeBonus = -2; // Slow
  }
  
  // Streak bonus (max +10)
  const streakBonus = Math.min(streak * 2, 10);
  
  // Calculate change
  let eloChange = Math.round(kFactor * (score - expectedScore) + timeBonus + streakBonus);
  
  // Cap changes to prevent extreme swings
  eloChange = Math.max(-20, Math.min(20, eloChange));
  
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
  
  // 2. SPEED BONUS/PENALTY - Only applied if score >= 50%
  let speedBonus = 0;
  let difficultyBonus = 0;
  let accuracyBonus = 0;
  
  if (score >= 50) {
    // Average time per question: target is 5 seconds for competitive
    const avgTimePerQuestion = totalTimeSeconds / totalQuestions;
    
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
    
    // 3. DIFFICULTY BONUS
    const avgDifficulty = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
    difficultyBonus = Math.round((avgDifficulty - 5) * 3); // Bonus for higher difficulty questions
    
    // 4. ACCURACY BONUS for high difficulty questions
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
  } else {
    // For scores < 50%, apply additional penalties instead of bonuses
    const avgTimePerQuestion = totalTimeSeconds / totalQuestions;
    if (avgTimePerQuestion > 15) {
      speedBonus = -15; // Additional penalty for being slow AND wrong
    }
  }
  
  // 5. STREAK BONUS - Only applied if score >= 50%
  const streakBonus = score >= 50 ? Math.min(streak * 5, 50) : 0; // Max 50 for long streaks, only for good performance
  
  // 6. ELO SCALING - Reduce swings for very high and very low Elo players
  let eloScaling = 1;
  if (currentElo >= 1500) {
    eloScaling = 0.65; // S tier players: reduced gains and losses for stability
  } else if (currentElo >= 1300) {
    eloScaling = 0.75; // A tier
  } else if (currentElo >= 1100) {
    eloScaling = 0.85; // B tier
  } else if (currentElo >= 900) {
    eloScaling = 0.90; // C tier
  } else if (currentElo < 600) {
    eloScaling = 1.05; // F/E tier: slightly amplified gains to help beginners progress faster
  }
  
  // Calculate final Elo change with ±16 cap and integer rounding
  const rawChange = baseChange + speedBonus + difficultyBonus + accuracyBonus + streakBonus;
  const scaledChange = Math.round(rawChange * eloScaling);
  
  // Cap the change between -16 and +16
  const eloChange = Math.max(-16, Math.min(16, scaledChange));
  
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

// Calculate rank tier for display - adjusted for new Elo system
export function getPerformanceTier(eloChange: number): {
  tier: 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  message: string;
} {
  if (eloChange >= 15) return { tier: 'SS', color: 'text-purple-400', message: 'Légendaire!' };
  if (eloChange >= 10) return { tier: 'S', color: 'text-yellow-400', message: 'Exceptionnel!' };
  if (eloChange >= 5) return { tier: 'A', color: 'text-green-400', message: 'Excellent!' };
  if (eloChange >= 2) return { tier: 'B', color: 'text-blue-400', message: 'Très bien!' };
  if (eloChange >= 0) return { tier: 'C', color: 'text-teal-400', message: 'Bien joué!' };
  if (eloChange >= -3) return { tier: 'D', color: 'text-gray-400', message: 'Passable' };
  return { tier: 'F', color: 'text-red-400', message: 'À réviser...' };
}

// Get operation types unlocked at each level - adjusted for new rank system
export function getUnlockedOperations(elo: number): string[] {
  const operations = ['addition', 'mental_math', 'logic'];
  
  if (elo >= 400) operations.push('subtraction');  // F rank
  if (elo >= 500) operations.push('percentage');  // F+ rank
  if (elo >= 600) operations.push('multiplication'); // E- rank
  if (elo >= 700) operations.push('fraction');    // E rank
  if (elo >= 800) operations.push('division');    // E+ rank
  if (elo >= 900) operations.push('equation');    // D- rank
  if (elo >= 1000) operations.push('power');      // D rank
  if (elo >= 1100) operations.push('root');       // D+ rank
  if (elo >= 1200) operations.push('factorization'); // C- rank
  
  return operations;
}

// Check if operation is unlocked
export function isOperationUnlocked(elo: number, operation: string): boolean {
  const unlocked = getUnlockedOperations(elo);
  return unlocked.includes(operation);
}

// Calculate initial ELO based on onboarding performance
export function calculateInitialElo(finalLevel: number, accuracy: number, avgTime: number): number {
  // Base ELO according to final level (1-10)
  const levelEloMap: Record<number, number> = {
    1: 300,  // CP
    2: 400,  // CE1
    3: 500,  // CE2
    4: 600,  // CM1
    5: 700,  // CM2
    6: 800,  // 6ème
    7: 900,  // 5ème
    8: 1000, // 4ème
    9: 1100, // 3ème
    10: 1200 // 2nde et plus
  };
  
  let baseElo = levelEloMap[finalLevel] || 500;
  
  // Accuracy bonus (0-100%)
  const accuracyBonus = Math.round((accuracy - 0.5) * 200); // -100 to +100
  
  // Time bonus (faster = higher ELO)
  // Average time per question in seconds, lower is better
  const timeBonus = avgTime < 5 ? 50 : avgTime < 10 ? 25 : avgTime < 15 ? 0 : -25;
  
  const finalElo = baseElo + accuracyBonus + timeBonus;
  
  // Clamp between reasonable bounds
  return Math.max(200, Math.min(1500, finalElo));
}
