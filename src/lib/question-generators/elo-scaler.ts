// ============================================================================
// ELO-SCALER.TS — Scaling des opérandes selon l'Elo global
// ============================================================================
//
// PRINCIPE :
//   Le TYPE de question est déterminé par le niveau scolaire (CP, CE1…).
//   La COMPLEXITÉ DES NOMBRES est déterminée par l'Elo global (400→4500).
//
//   eloFactor = 0.0  →  opérandes minimaux (F-, débutant)
//   eloFactor = 1.0  →  opérandes maximaux (S+, expert)
//
//   Un joueur S+ qui reçoit une question CP aura 18+19 (pas 3+5).
//   Un joueur F- qui reçoit une question CE2 aura 3×4 (pas 9×9).
//
// USAGE dans un générateur :
//   const ops = getScaledOperands(context.userElo, 'CP');
//   const a = ops.addition();
//   const b = ops.addition();
// ============================================================================

import { SchoolLevel, ELO_LEVEL_RANGES, ALL_LEVELS } from './elo-ranges';

const GLOBAL_ELO_MIN = 400;
const GLOBAL_ELO_MAX = 4500;

// Facteur 0.0→1.0 basé sur l'Elo GLOBAL (400→4500)
export function getGlobalEloFactor(userElo: number): number {
  const clamped = Math.max(GLOBAL_ELO_MIN, Math.min(GLOBAL_ELO_MAX, userElo));
  return (clamped - GLOBAL_ELO_MIN) / (GLOBAL_ELO_MAX - GLOBAL_ELO_MIN);
}

// Interpolation linéaire des bornes
export function scaledInt(
  minAtLow: number, maxAtLow: number,
  minAtHigh: number, maxAtHigh: number,
  eloFactor: number
): number {
  const f = Math.max(0, Math.min(1, eloFactor));
  const lo = Math.round(minAtLow + (minAtHigh - minAtLow) * f);
  const hi = Math.round(maxAtLow + (maxAtHigh - maxAtLow) * f);
  const safeMin = Math.min(lo, hi);
  const safeMax = Math.max(lo, hi);
  return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
}

// ── Profils de scaling par niveau ───────────────────────────────────────────
// [minAtLow, maxAtLow, minAtHigh, maxAtHigh]
// F- (factor≈0) → S+ (factor≈1)

type Range4 = [number, number, number, number];

interface LevelScaleProfile {
  addMax:       Range4;
  subMax:       Range4;
  mulA?:        Range4;
  mulB?:        Range4;
  divDivisor?:  Range4;
  divQuotient?: Range4;
}

export const LEVEL_SCALE_PROFILES: Record<SchoolLevel, LevelScaleProfile> = {
  // CP (400-549) : additions jusqu'à 20
  // F-: 2+3  |  S+: 18+19
  CP: {
    addMax: [1, 5,   10, 19],
    subMax: [2, 6,   10, 19],
  },
  // CE1 (550-649) : additions jusqu'à 99, tables 2/5/10
  // F-: 12+8  |  S+: 48+41
  CE1: {
    addMax: [5,  15,  40, 90],
    subMax: [5,  15,  40, 90],
    mulA:   [2,  2,   2,  10],
    mulB:   [1,  5,   5,  10],
  },
  // CE2 (650-799) : tables 1-9, division exacte
  // F-: 2×3  |  S+: 9×9
  CE2: {
    addMax:     [10, 50,  100, 900],
    subMax:     [10, 50,  100, 900],
    mulA:       [2,  4,   7,   9],
    mulB:       [2,  4,   7,   9],
    divDivisor: [2,  3,   7,   9],
    divQuotient:[2,  4,   6,   9],
  },
  // CM1 (800-999)
  // F-: 15×3  |  S+: 87×9
  CM1: {
    addMax:      [10,  200,  500, 9999],
    subMax:      [10,  200,  500, 9999],
    mulA:        [10,  20,   60,  99],
    mulB:        [2,   4,    6,   9],
    divDivisor:  [2,   3,    6,   9],
    divQuotient: [3,   8,   10,  20],
  },
  // CM2 (1000-1199)
  // F-: 18×12  |  S+: 95×78
  CM2: {
    addMax:      [100,  500,  2000, 9999],
    subMax:      [100,  500,  2000, 9999],
    mulA:        [10,   30,   60,   99],
    mulB:        [5,    12,   30,   99],
    divDivisor:  [2,    5,   10,   19],
    divQuotient: [5,   10,   15,   50],
  },
  // 6e et au-delà : la complexité vient du TYPE d'exercice.
  // On scale quand même les valeurs numériques résiduelles.
  '6e':  { addMax: [10, 50,  500, 9999], subMax: [10, 50,  500, 9999] },
  '5e':  { addMax: [10, 80,  800, 9999], subMax: [10, 80,  800, 9999] },
  '4e':  { addMax: [10, 100, 1000,9999], subMax: [10, 100, 1000,9999] },
  '3e':  { addMax: [10, 100, 1000,9999], subMax: [10, 100, 1000,9999] },
  '2de': { addMax: [10, 100, 1000,9999], subMax: [10, 100, 1000,9999] },
  '1re': { addMax: [10, 100, 1000,9999], subMax: [10, 100, 1000,9999] },
  'Tle': { addMax: [10, 100, 1000,9999], subMax: [10, 100, 1000,9999] },
  Sup1:  { addMax: [10, 100, 1000,9999], subMax: [10, 100, 1000,9999] },
  Sup2:  { addMax: [10, 100, 1000,9999], subMax: [10, 100, 1000,9999] },
  Sup3:  { addMax: [10, 100, 1000,9999], subMax: [10, 100, 1000,9999] },
  Pro:   { addMax: [10, 100, 1000,9999], subMax: [10, 100, 1000,9999] },
};

// ── Point d'entrée principal ─────────────────────────────────────────────────

export interface ScaledOperands {
  eloFactor: number;
  addition:       () => number;
  subtraction:    () => number;
  multiplication: () => { a: number; b: number };
  division:       () => { divisor: number; quotient: number };
}

export function getScaledOperands(userElo: number, level: SchoolLevel): ScaledOperands {
  const f = getGlobalEloFactor(userElo);
  const p = LEVEL_SCALE_PROFILES[level];

  return {
    eloFactor: f,

    addition: () => scaledInt(...p.addMax, f),

    subtraction: () => scaledInt(...p.subMax, f),

    multiplication: () => {
      const mulA = p.mulA ?? [2, 5, 10, 99] as Range4;
      const mulB = p.mulB ?? [2, 5,  5,  9] as Range4;
      return {
        a: scaledInt(...mulA, f),
        b: scaledInt(...mulB, f),
      };
    },

    division: () => {
      const dd = p.divDivisor  ?? [2, 3, 5, 9]  as Range4;
      const dq = p.divQuotient ?? [2, 5, 5, 15] as Range4;
      return {
        divisor:  scaledInt(...dd, f),
        quotient: scaledInt(...dq, f),
      };
    },
  };
}
