// ============================================================================
// ELO-RANGES.TS — Source de vérité unique pour tous les seuils Elo
// ============================================================================
//
// CE FICHIER EST LA RÉFÉRENCE ABSOLUE.
// Tous les autres fichiers (types.ts, french-classes.ts, elo-scaler.ts,
// level-unlock.ts, index.ts) doivent importer depuis ici.
//
// Aligné sur le nouveau système de classes françaises
// ============================================================================

import { FrenchClass } from '@/lib/elo';

export type SchoolLevel =
  | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  | '6e' | '5e' | '4e' | '3e'
  | '2de' | '1re' | 'Tle'
  | 'Sup1' | 'Sup2' | 'Sup3' | 'Pro';

export type EloRange = Record<SchoolLevel, { min: number; max: number }>;

// ── Plages Elo par niveau scolaire ──────────────────────────────────────────
// Aligné sur le nouveau système de classes françaises
export const ELO_LEVEL_RANGES: EloRange = {
  CP:    { min: 0,    max: 499  },
  CE1:   { min: 500,  max: 749  },
  CE2:   { min: 750,  max: 999  },
  CM1:   { min: 1000, max: 1249 },
  CM2:   { min: 1250, max: 1499 },
  '6e':  { min: 1500, max: 1749 },
  '5e':  { min: 1750, max: 1999 },
  '4e':  { min: 2000, max: 2249 },
  '3e':  { min: 2250, max: 2499 },
  '2de': { min: 2500, max: 2749 },
  '1re': { min: 2750, max: 2999 },
  'Tle': { min: 3000, max: 3249 },
  Sup1:  { min: 3250, max: 3499 },
  Sup2:  { min: 3500, max: 3749 },
  Sup3:  { min: 3750, max: 3999 },
  Pro:   { min: 4000, max: 4500 },
};

// ── Seuils Elo pour les classes françaises (CP → Pro) ───────────────────────────
// Basé sur le système de classes françaises
export const RANK_ELO_THRESHOLDS: Record<FrenchClass, number> = {
  'CP': 0,     'CE1': 500,  'CE2': 750,  'CM1': 1000, 'CM2': 1250,
  '6e': 1500,  '5e': 1750,  '4e': 2000,  '3e': 2250,  '2de': 2500,
  '1re': 2750, 'Tle': 3000, 'Sup1': 3250, 'Sup2': 3500, 'Sup3': 3750, 'Pro': 4000
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export const ALL_LEVELS: SchoolLevel[] = [
  'CP','CE1','CE2','CM1','CM2',
  '6e','5e','4e','3e',
  '2de','1re','Tle',
  'Sup1','Sup2','Sup3','Pro'
];

export function getLevelFromElo(elo: number): SchoolLevel {
  for (const level of ALL_LEVELS) {
    const r = ELO_LEVEL_RANGES[level];
    if (elo >= r.min && elo <= r.max) return level;
  }
  return 'Pro';
}


// Règles de déblocage : quel classe minimum pour accéder à chaque niveau
export const LEVEL_UNLOCK_AT_ELO: Record<SchoolLevel, number> = {
  CP:    0,
  CE1:   500,   // CE1 threshold
  CE2:   750,   // CE2 threshold
  CM1:   1000,  // CM1 threshold
  CM2:   1250,  // CM2 threshold
  '6e':  1500,  // 6e threshold
  '5e':  1750,  // 5e threshold
  '4e':  2000,  // 4e threshold
  '3e':  2250,  // 3e threshold
  '2de': 2500,  // 2de threshold
  '1re': 2750,  // 1re threshold
  'Tle': 3000,  // Tle threshold
  Sup1:  3250,  // Sup1 threshold
  Sup2:  3500,  // Sup2 threshold
  Sup3:  3750,  // Sup3 threshold
  Pro:   4000,  // Pro threshold
};
