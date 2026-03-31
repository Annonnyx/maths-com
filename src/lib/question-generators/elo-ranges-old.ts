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

// ── Seuils Elo pour les rangs (F- → S+, 21 paliers) ─────────────────────────
// Répartis uniformément sur 400-4500 (~195 pts / palier)
export const RANK_ELO_THRESHOLDS: Record<RankTier, number> = {
  'F-': 400,  'F':  595,  'F+':  790,
  'E-': 985,  'E':  1180, 'E+':  1375,
  'D-': 1570, 'D':  1765, 'D+':  1960,
  'C-': 2155, 'C':  2350, 'C+':  2545,
  'B-': 2740, 'B':  2935, 'B+':  3130,
  'A-': 3325, 'A':  3520, 'A+':  3715,
  'S-': 3910, 'S':  4105, 'S+':  4300,
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


// Règles de déblocage : quel rang minimum pour accéder à chaque niveau
export const LEVEL_UNLOCK_AT_ELO: Record<SchoolLevel, number> = {
  CP:    0,
  CE1:   RANK_ELO_THRESHOLDS['F+'],   // F+
  CE2:   RANK_ELO_THRESHOLDS['E'],    // E
  CM1:   RANK_ELO_THRESHOLDS['E+'],   // E+
  CM2:   RANK_ELO_THRESHOLDS['D'],    // D
  '6e':  RANK_ELO_THRESHOLDS['D+'],   // D+
  '5e':  RANK_ELO_THRESHOLDS['C-'],   // C-
  '4e':  RANK_ELO_THRESHOLDS['C'],    // C
  '3e':  RANK_ELO_THRESHOLDS['C+'],   // C+
  '2de': RANK_ELO_THRESHOLDS['B-'],   // B-
  '1re': RANK_ELO_THRESHOLDS['B'],    // B
  'Tle': RANK_ELO_THRESHOLDS['B+'],   // B+
  Sup1:  RANK_ELO_THRESHOLDS['A-'],   // A-
  Sup2:  RANK_ELO_THRESHOLDS['A'],    // A
  Sup3:  RANK_ELO_THRESHOLDS['A+'],   // A+
  Pro:   RANK_ELO_THRESHOLDS['S-'],   // S-
};
