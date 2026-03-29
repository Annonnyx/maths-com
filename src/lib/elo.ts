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
    difficultyBonus: number;
    streakBonus: number;
    baseChange: number;
  };
} {
  const { correctAnswers, totalQuestions, totalTimeSeconds, difficulties, isCorrectArray, currentElo, streak } = result;
  const score = correctAnswers; // Raw correct answers out of 20
  
  // 1. BASE SCORE CALCULATION - Bounded between -16 and +14
  const baseScoreMap: Record<number, number> = {
    0: -16, 1: -14, 2: -12, 3: -10, 4: -8, 5: -7,
    6: -6, 7: -5, 8: -4, 9: -3, 10: 0,
    11: +1, 12: +2, 13: +3, 14: +4, 15: +5,
    16: +6, 17: +7, 18: +10, 19: +12, 20: +14
  };
  
  let baseChange = baseScoreMap[score] || 0;
  
  // 2. BONUSES - Only applied if score >= 10
  let speedBonus = 0;
  let difficultyBonus = 0;
  let streakBonus = 0;
  
  if (score >= 10) {
    // SPEED BONUS
    if (totalTimeSeconds < 120) { // < 2 minutes
      speedBonus = 2;
    } else if (totalTimeSeconds < 300) { // < 5 minutes
      speedBonus = 1;
    } else {
      speedBonus = 0; // >= 5 minutes
    }
    
    // DIFFICULTY BONUS - Need 2 questions from higher level
    if (isCorrectArray && isCorrectArray.length === totalQuestions) {
      // Find questions from higher level (difficulty > user's current level)
      const userLevel = Math.floor(currentElo / 100); // Rough estimate of user level
      const higherLevelQuestions = difficulties
        .map((d, i) => d > userLevel ? i : -1)
        .filter(i => i !== -1);
      
      if (higherLevelQuestions.length >= 2) {
        const correctHigherLevel = higherLevelQuestions.filter(i => isCorrectArray[i]).length;
        if (correctHigherLevel === 2) {
          difficultyBonus = 2;
        } else if (correctHigherLevel === 1) {
          difficultyBonus = 1;
        }
      }
    }
    
    // STREAK BONUS - Based on recent performance
    if (streak >= 16) {
      const streakBonusMap: Record<number, number> = {
        16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0,
        26: 1, 27: 1, 28: 1, 29: 1, 30: 1, 31: 1, 32: 1, 33: 1, 34: 1, 35: 1,
        36: 2, 37: 2, 38: 2, 39: 2, 40: 2, 41: 2, 42: 2, 43: 2, 44: 2, 45: 2,
        46: 2, 47: 2, 48: 2, 49: 2, 50: 2, 51: 2, 52: 2, 53: 2, 54: 2, 55: 2,
        56: 3, 57: 3, 58: 3, 59: 3, 60: 3, 61: 3, 62: 3, 63: 3, 64: 3, 65: 3,
        66: 3, 67: 3, 68: 3, 69: 3, 70: 3, 71: 3, 72: 3, 73: 3, 74: 3, 75: 3,
        76: 3, 77: 3, 78: 3, 79: 3, 80: 3, 81: 3, 82: 3, 83: 3, 84: 3, 85: 3,
        86: 4, 87: 4, 88: 4, 89: 4, 90: 4, 91: 4, 92: 4, 93: 4, 94: 4, 95: 4,
        96: 4, 97: 4, 98: 4, 99: 4, 100: 4
      };
      streakBonus = streakBonusMap[Math.min(streak, 100)] || 4;
    }
  }
  
  // Calculate total ELO change
  const eloChange = baseChange + speedBonus + difficultyBonus + streakBonus;
  
  return {
    eloChange,
    performance: {
      speedBonus,
      difficultyBonus,
      streakBonus,
      baseChange
    }
  };
}

// Calculate rank tier for display - adjusted for new Elo system
export function getPerformanceTier(eloChange: number): {
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  message: string;
} {
  if (eloChange >= 12) return { tier: 'S', color: 'text-yellow-400', message: 'Exceptionnel!' };
  if (eloChange >= 8) return { tier: 'A', color: 'text-green-400', message: 'Excellent!' };
  if (eloChange >= 4) return { tier: 'B', color: 'text-blue-400', message: 'Très bien!' };
  if (eloChange >= 1) return { tier: 'C', color: 'text-teal-400', message: 'Bien joué!' };
  if (eloChange >= -2) return { tier: 'D', color: 'text-gray-400', message: 'Passable' };
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
  
  const baseElo = levelEloMap[finalLevel] || 500;
  
  // Accuracy bonus (0-100%)
  const accuracyBonus = Math.round((accuracy - 0.5) * 200); // -100 to +100
  
  // Time bonus (faster = higher ELO)
  // Average time per question in seconds, lower is better
  const timeBonus = avgTime < 5 ? 50 : avgTime < 10 ? 25 : avgTime < 15 ? 0 : -25;
  
  const finalElo = baseElo + accuracyBonus + timeBonus;
  
  // Clamp between reasonable bounds
  return Math.max(200, Math.min(1500, finalElo));
}
