// French classes from CP to Pro
export const FRENCH_CLASSES = [
  'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'
] as const;

export type FrenchClass = typeof FRENCH_CLASSES[number];

// Elo thresholds for each French class
export const FRENCH_CLASS_THRESHOLDS: Record<FrenchClass, { min: number; max: number }> = {
  'CP': { min: 0, max: 499 },
  'CE1': { min: 500, max: 749 },
  'CE2': { min: 750, max: 999 },
  'CM1': { min: 1000, max: 1249 },
  'CM2': { min: 1250, max: 1499 },
  '6e': { min: 1500, max: 1749 },
  '5e': { min: 1750, max: 1999 },
  '4e': { min: 2000, max: 2249 },
  '3e': { min: 2250, max: 2499 },
  '2de': { min: 2500, max: 2749 },
  '1re': { min: 2750, max: 2999 },
  'Tle': { min: 3000, max: 3249 },
  'Sup1': { min: 3250, max: 3499 },
  'Sup2': { min: 3500, max: 3749 },
  'Sup3': { min: 3750, max: 3999 },
  'Pro': { min: 4000, max: Infinity }
};

// Colors for each French class
export const FRENCH_CLASS_COLORS: Record<FrenchClass, string> = {
  'CP': 'text-green-600',
  'CE1': 'text-emerald-600',
  'CE2': 'text-teal-600',
  'CM1': 'text-cyan-600',
  'CM2': 'text-blue-600',
  '6e': 'text-indigo-600',
  '5e': 'text-violet-600',
  '4e': 'text-purple-600',
  '3e': 'text-pink-600',
  '2de': 'text-rose-600',
  '1re': 'text-orange-600',
  'Tle': 'text-amber-600',
  'Sup1': 'text-yellow-600',
  'Sup2': 'text-lime-600',
  'Sup3': 'text-green-500',
  'Pro': 'text-red-600'
};

// Background colors for each French class
export const FRENCH_CLASS_BG_COLORS: Record<FrenchClass, string> = {
  'CP': 'bg-green-500/20 border-green-500',
  'CE1': 'bg-emerald-500/20 border-emerald-500',
  'CE2': 'bg-teal-500/20 border-teal-500',
  'CM1': 'bg-cyan-500/20 border-cyan-500',
  'CM2': 'bg-blue-500/20 border-blue-500',
  '6e': 'bg-indigo-500/20 border-indigo-500',
  '5e': 'bg-violet-500/20 border-violet-500',
  '4e': 'bg-purple-500/20 border-purple-500',
  '3e': 'bg-pink-500/20 border-pink-500',
  '2de': 'bg-rose-500/20 border-rose-500',
  '1re': 'bg-orange-500/20 border-orange-500',
  'Tle': 'bg-amber-500/20 border-amber-500',
  'Sup1': 'bg-yellow-500/20 border-yellow-500',
  'Sup2': 'bg-lime-500/20 border-lime-500',
  'Sup3': 'bg-green-500/20 border-green-500',
  'Pro': 'bg-red-500/20 border-red-500'
};

// Clamp ELO within reasonable bounds
export function clampElo(elo: number): number {
  return Math.max(0, Math.min(4000, elo));
}

// Get French class from Elo
export function getClassFromElo(elo: number): FrenchClass {
  for (const [className, { min, max }] of Object.entries(FRENCH_CLASS_THRESHOLDS)) {
    if (elo >= min && elo <= max) {
      return className as FrenchClass;
    }
  }
  return 'CP';
}

// Get next French class
export function getNextClass(currentClass: FrenchClass): FrenchClass | null {
  const index = FRENCH_CLASSES.indexOf(currentClass);
  if (index < FRENCH_CLASSES.length - 1) {
    return FRENCH_CLASSES[index + 1];
  }
  return null;
}

// Get progress to next French class (0-100)
export function getClassProgress(elo: number, currentClass: FrenchClass): number {
  const threshold = FRENCH_CLASS_THRESHOLDS[currentClass];
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

// Calculate performance tier for display - adjusted for French class system
export function getPerformanceTier(eloChange: number): {
  tier: 'Pro' | 'Sup3' | 'Sup2' | 'Sup1' | 'Tle' | '1re' | '2de' | '3e' | '4e' | '5e' | '6e' | 'CM2' | 'CM1' | 'CE2' | 'CE1' | 'CP';
  color: string;
  message: string;
} {
  if (eloChange >= 12) return { tier: 'Pro', color: 'text-red-400', message: 'Exceptionnel!' };
  if (eloChange >= 8) return { tier: 'Sup3', color: 'text-green-400', message: 'Excellent!' };
  if (eloChange >= 4) return { tier: 'Sup2', color: 'text-blue-400', message: 'Très bien!' };
  if (eloChange >= 1) return { tier: 'Sup1', color: 'text-teal-400', message: 'Bien joué!' };
  if (eloChange >= -2) return { tier: 'Tle', color: 'text-gray-400', message: 'Passable' };
  return { tier: 'CP', color: 'text-red-400', message: 'À réviser...' };
}

// Get operation types unlocked at each level - adjusted for French class system
export function getUnlockedOperations(elo: number): string[] {
  const operations = ['addition', 'mental_math', 'logic'];
  
  if (elo >= 500) operations.push('subtraction');  // CE1
  if (elo >= 750) operations.push('percentage');  // CE2
  if (elo >= 1000) operations.push('multiplication'); // CM1
  if (elo >= 1250) operations.push('fraction');    // CM2
  if (elo >= 1500) operations.push('division');    // 6e
  if (elo >= 1750) operations.push('equation');    // 5e
  if (elo >= 2000) operations.push('power');      // 4e
  if (elo >= 2250) operations.push('root');       // 3e
  if (elo >= 2500) operations.push('factorization'); // 2de
  
  return operations;
}

// Check if operation is unlocked
export function isOperationUnlocked(elo: number, operation: string): boolean {
  const unlocked = getUnlockedOperations(elo);
  return unlocked.includes(operation);
}

// Calculate initial ELO based on diagnostic test results
// Uses performance at different ELO levels to find the true skill ceiling
export interface DiagnosticResult {
  levelElo: number;      // ELO level of the question (400, 800, 1200, 1600, 2000)
  isCorrect: boolean;    // Whether answered correctly
  timeTaken: number;     // Time in seconds
}

export function calculateDiagnosticElo(results: DiagnosticResult[]): number {
  if (results.length === 0) return 400;
  
  // Group results by ELO level
  const levelGroups: Record<number, { correct: number; total: number; avgTime: number }> = {};
  
  results.forEach(r => {
    if (!levelGroups[r.levelElo]) {
      levelGroups[r.levelElo] = { correct: 0, total: 0, avgTime: 0 };
    }
    levelGroups[r.levelElo].correct += r.isCorrect ? 1 : 0;
    levelGroups[r.levelElo].total += 1;
    levelGroups[r.levelElo].avgTime += r.timeTaken;
  });
  
  // Calculate accuracy and average time per level
  const levels = Object.entries(levelGroups).map(([elo, data]) => ({
    elo: Number(elo),
    accuracy: data.correct / data.total,
    avgTime: data.avgTime / data.total
  })).sort((a, b) => a.elo - b.elo);
  
  // Find the highest level with >50% accuracy (mastery threshold)
  let masteredLevel = 400; // Start at beginner
  let strugglingLevel: number | null = null;
  
  for (const level of levels) {
    if (level.accuracy >= 0.5) {
      masteredLevel = level.elo;
    } else {
      strugglingLevel = level.elo;
      break; // First level where accuracy drops below 50%
    }
  }
  
  // Calculate fine-tuning based on performance at the ceiling level
  const ceilingLevel = levels.find(l => l.elo === masteredLevel);
  const ceilingAccuracy = ceilingLevel?.accuracy || 0.5;
  const ceilingTime = ceilingLevel?.avgTime || 10;
  
  // Bonus/malus based on accuracy at ceiling level
  // 100% accuracy = +200 ELO, 50% accuracy = 0, <50% = already caught above
  const accuracyBonus = Math.round((ceilingAccuracy - 0.5) * 400);
  
  // Time bonus (faster solving at ceiling = higher ELO)
  const timeBonus = ceilingTime < 5 ? 100 : ceilingTime < 10 ? 50 : ceilingTime < 20 ? 0 : -50;
  
  // Final calculation: mastered level + bonuses
  let finalElo = masteredLevel + accuracyBonus + timeBonus;
  
  // If struggling at higher level, cap at that level minus penalty
  if (strugglingLevel) {
    const maxElo = strugglingLevel - 100; // Stay just below struggling level
    finalElo = Math.min(finalElo, maxElo);
  }
  
  // Clamp between reasonable bounds for new users
  return Math.max(200, Math.min(2200, finalElo));
}

// Legacy function for backward compatibility (kept for non-diagnostic tests)
export function calculateInitialElo(finalClass: FrenchClass, accuracy: number, avgTime: number): number {
  // Use diagnostic calculation with single-level simulation
  const classToElo: Record<FrenchClass, number> = {
    'CP': 400, 'CE1': 600, 'CE2': 800, 'CM1': 1000, 'CM2': 1200,
    '6e': 1500, '5e': 1750, '4e': 2000, '3e': 2250, '2de': 2500,
    '1re': 2750, 'Tle': 3000, 'Sup1': 3250, 'Sup2': 3500, 'Sup3': 3750, 'Pro': 4000
  };
  
  const levelElo = classToElo[finalClass] || 1000;
  
  // Simulate diagnostic results at that level
  return calculateDiagnosticElo([
    { levelElo, isCorrect: accuracy > 0.5, timeTaken: avgTime },
    { levelElo, isCorrect: accuracy > 0.3, timeTaken: avgTime },
    { levelElo, isCorrect: accuracy > 0.7, timeTaken: avgTime }
  ]);
}
