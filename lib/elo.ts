// New ELO calculation utilities – maths-app.com
// ------------------------------------------------
// Author: Cascade AI refactor March 2026
// This file centralises every function related to the new ELO system.
// It deliberately lives at project-root `/lib` to avoid a name-clash with
// the legacy implementation in `src/lib/elo.ts`. Migration of call-sites
// is required so that all gameplay logic relies exclusively on the
// functions exported here.

// ---------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------

export const ELO_MIN = 400;
export const ELO_MAX = 4000;

// Rank mapping – 21 steps from F- to S+
// Each step ≈171 points in the [400, 4000] interval
const RANK_TABLE = [
  { label: 'F-', min: 400, max: 570 },
  { label: 'F',  min: 571, max: 742 },
  { label: 'F+', min: 743, max: 913 },
  { label: 'E-', min: 914, max: 1084 },
  { label: 'E',  min: 1085, max: 1255 },
  { label: 'E+', min: 1256, max: 1426 },
  { label: 'D-', min: 1427, max: 1597 },
  { label: 'D',  min: 1598, max: 1768 },
  { label: 'D+', min: 1769, max: 1939 },
  { label: 'C-', min: 1940, max: 2110 },
  { label: 'C',  min: 2111, max: 2281 },
  { label: 'C+', min: 2282, max: 2452 },
  { label: 'B-', min: 2453, max: 2623 },
  { label: 'B',  min: 2624, max: 2794 },
  { label: 'B+', min: 2795, max: 2965 },
  { label: 'A-', min: 2966, max: 3136 },
  { label: 'A',  min: 3137, max: 3307 },
  { label: 'A+', min: 3308, max: 3478 },
  { label: 'S-', min: 3479, max: 3649 },
  { label: 'S',  min: 3650, max: 3820 },
  { label: 'S+', min: 3821, max: 4000 }
] as const;

export type RankLabel = (typeof RANK_TABLE)[number]['label'];

// French school levels mapping
type SchoolLevel =
  | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  | '6ème' | '5ème' | '4ème' | '3ème'
  | '2nde' | '1ère' | 'Terminale' | 'Pro/Licence';

const LEVEL_TABLE: Array<{ label: SchoolLevel; min: number; max: number }> = [
  { label: 'CP',         min: 400,  max: 570  },
  { label: 'CE1',        min: 571,  max: 742  },
  { label: 'CE2',        min: 743,  max: 913  },
  { label: 'CM1',        min: 914,  max: 1084 },
  { label: 'CM2',        min: 1085, max: 1255 },
  { label: '6ème',       min: 1256, max: 1597 },
  { label: '5ème',       min: 1598, max: 1939 },
  { label: '4ème',       min: 1940, max: 2281 },
  { label: '3ème',       min: 2282, max: 2623 },
  { label: '2nde',       min: 2624, max: 2965 },
  { label: '1ère',       min: 2966, max: 3307 },
  { label: 'Terminale',  min: 3308, max: 3649 },
  { label: 'Pro/Licence',min: 3650, max: 4000 }
];

// ---------------------------------------------------------------------
// CORE HELPERS
// ---------------------------------------------------------------------

/** Clamp an ELO rating in the authorised range */
export function clampElo(elo: number): number {
  return Math.min(ELO_MAX, Math.max(ELO_MIN, Math.round(elo)));
}

/** Determine K-factor according to current ELO */
export function getKFactor(elo: number): number {
  if (elo < 800)  return 16;
  if (elo < 1400) return 14;
  if (elo < 2000) return 12;
  if (elo < 2800) return 10;
  return 8;
}

/** Expected score given player ELO and question difficulty */
function expectedScore(playerElo: number, questionElo: number): number {
  return 1 / (1 + Math.pow(10, (questionElo - playerElo) / 400));
}

/** Time modifier for solo mode (ratio = responseTime / maxTime) */
function timeModifier(ratio: number): number {
  if (ratio < 0.25) return 1.2;
  if (ratio < 0.60) return 1.0;
  if (ratio < 0.90) return 0.9;
  return 0.75;
}

/** Streak modifier (consecutive correct answers) */
function streakModifier(streak: number): number {
  if (streak >= 10) return 1.3;
  if (streak >= 5)  return 1.2;
  if (streak >= 3)  return 1.1;
  return 1.0;
}

/** Difficulty modifier comparing question difficulty to player ELO */
function difficultyModifier(playerElo: number, questionElo: number): number {
  const diff = questionElo - playerElo; // positive if harder
  if (diff > 150)  return 1.3;
  if (diff < -150) return 0.5;
  return 1.0;
}

/**
 * Compute ELO delta for a single question.
 * @param playerElo        Current player ELO before the question
 * @param questionElo      Difficulty of the question expressed in ELO scale
 * @param scoreReal        Real score for the question (1 correct, 0 incorrect, 0.5 partial)
 * @param responseTime     Seconds used by the player to answer (solo only)
 * @param maxTime          Maximum allowed seconds for the question (solo only)
 * @param currentStreak    Number of consecutive correct answers BEFORE this question
 * @param isMultiplayer    If true, time modifier is not applied
 */
export function calculateEloChange(
  playerElo: number,
  questionElo: number,
  scoreReal: number,
  responseTime: number | undefined,
  maxTime: number | undefined,
  currentStreak: number,
  isMultiplayer: boolean = false
): number {
  const scoreRealClamped = Math.max(0, Math.min(1, scoreReal));
  const scoreExpected = expectedScore(playerElo, questionElo);

  const k = getKFactor(playerElo);

  // Base delta from standard elo formula
  let delta = k * (scoreRealClamped - scoreExpected);

  // Apply modifiers
  const modTime = isMultiplayer || maxTime === undefined || responseTime === undefined
    ? 1.0
    : timeModifier(responseTime / maxTime);
  const modStreak = streakModifier(currentStreak);
  const modDiff = difficultyModifier(playerElo, questionElo);

  delta *= modTime * modStreak * modDiff;

  // Clamp to ±16
  delta = Math.max(-16, Math.min(16, delta));

  return delta;
}

// ---------------------------------------------------------------------
// RANK & LEVEL HELPERS
// ---------------------------------------------------------------------

export function getRankFromElo(elo: number): RankLabel {
  const rating = clampElo(elo);
  return (
    RANK_TABLE.find(r => rating >= r.min && rating <= r.max) || RANK_TABLE[0]
  ).label as RankLabel;
}

export function getLevelFromElo(elo: number): SchoolLevel {
  const rating = clampElo(elo);
  return (
    LEVEL_TABLE.find(l => rating >= l.min && rating <= l.max) || LEVEL_TABLE[0]
  ).label;
}

// ---------------------------------------------------------------------
// Convenience helpers for external use
// ---------------------------------------------------------------------

export interface EloComputationInput {
  playerElo: number;
  questionElo: number;
  correct: boolean;
  responseTime?: number; // seconds
  maxTime?: number;      // seconds
  streak?: number;       // consecutive correct answers BEFORE question
  multiplayer?: boolean; // set true in versus mode
}

export function computeNewElo({
  playerElo,
  questionElo,
  correct,
  responseTime = undefined,
  maxTime = undefined,
  streak = 0,
  multiplayer = false
}: EloComputationInput): { newElo: number; delta: number } {
  const scoreReal = correct ? 1 : 0;
  const delta = calculateEloChange(
    playerElo,
    questionElo,
    scoreReal,
    responseTime,
    maxTime,
    streak,
    multiplayer
  );
  const unclamped = playerElo + delta;
  return { newElo: clampElo(unclamped), delta };
}

// ---------------------------------------------------------------------------
// VISUAL CONSTANTS (legacy compatibility)
// ---------------------------------------------------------------------------

export const RANK_COLORS: Record<string, string> = {
  'F-': 'text-gray-400',
  'F': 'text-gray-500',
  'F+': 'text-gray-600',
  'E-': 'text-green-400',
  'E': 'text-green-500',
  'E+': 'text-green-600',
  'D-': 'text-blue-400',
  'D': 'text-blue-500',
  'D+': 'text-blue-600',
  'C-': 'text-yellow-400',
  'C': 'text-yellow-500',
  'C+': 'text-yellow-600',
  'B-': 'text-orange-400',
  'B': 'text-orange-500',
  'B+': 'text-orange-600',
  'A-': 'text-red-400',
  'A': 'text-red-500',
  'A+': 'text-red-600',
  'S-': 'text-purple-400',
  'S': 'text-purple-500',
  'S+': 'text-purple-600'
};

export const RANK_BG_COLORS: Record<string, string> = {
  'F-': 'bg-gray-500/20',
  'F': 'bg-gray-600/20',
  'F+': 'bg-gray-700/20',
  'E-': 'bg-green-500/20',
  'E': 'bg-green-600/20',
  'E+': 'bg-green-700/20',
  'D-': 'bg-blue-500/20',
  'D': 'bg-blue-600/20',
  'D+': 'bg-blue-700/20',
  'C-': 'bg-yellow-500/20',
  'C': 'bg-yellow-600/20',
  'C+': 'bg-yellow-700/20',
  'B-': 'bg-orange-500/20',
  'B': 'bg-orange-600/20',
  'B+': 'bg-orange-700/20',
  'A-': 'bg-red-500/20',
  'A': 'bg-red-600/20',
  'A+': 'bg-red-700/20',
  'S-': 'bg-purple-500/20',
  'S': 'bg-purple-600/20',
  'S+': 'bg-purple-700/20'
};

// Simplified performance tier helper (legacy compatibility)
export function getPerformanceTier(eloChange: number): { tier: string; color: string; message: string } {
  if (eloChange >= 50) return { tier: 'S', color: 'text-purple-400', message: 'Performance exceptionnelle !' };
  if (eloChange >= 30) return { tier: 'A', color: 'text-green-400', message: 'Excellente performance !' };
  if (eloChange >= 10) return { tier: 'B', color: 'text-blue-400', message: 'Bonne performance' };
  if (eloChange >= 0) return { tier: 'C', color: 'text-yellow-400', message: 'Performance correcte' };
  if (eloChange >= -20) return { tier: 'D', color: 'text-orange-400', message: 'À améliorer' };
  return { tier: 'F', color: 'text-red-400', message: 'À réviser...' };
}
