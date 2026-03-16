// ============================================================================
// ELO-RANGES.TS — Source de vérité unique pour tous les seuils Elo
// ============================================================================
//
// CE FICHIER EST LA RÉFÉRENCE ABSOLUE.
// Tous les autres fichiers (types.ts, french-classes.ts, elo-scaler.ts,
// level-unlock.ts, index.ts) doivent importer depuis ici.
//
// Ancienne situation : deux définitions contradictoires
//   - french-classes.ts : CP = 0-549, CE1 = 550-649 …
//   - types.ts          : CP = 400-570, CE1 = 571-742 …
//
// Décision : on aligne sur french-classes.ts (référence UI + DB)
// SAUF qu'on démarre à 400 (pas 0) car un Elo < 400 n'existe pas en pratique.
// ============================================================================

export type SchoolLevel =
  | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  | '6e' | '5e' | '4e' | '3e'
  | '2de' | '1re' | 'Tle'
  | 'Sup1' | 'Sup2' | 'Sup3' | 'Pro';

// Rang Elo (21 paliers F- → S+)
export type RankTier =
  | 'F-' | 'F' | 'F+'
  | 'E-' | 'E' | 'E+'
  | 'D-' | 'D' | 'D+'
  | 'C-' | 'C' | 'C+'
  | 'B-' | 'B' | 'B+'
  | 'A-' | 'A' | 'A+'
  | 'S-' | 'S' | 'S+';

// ── Plages Elo par niveau scolaire ──────────────────────────────────────────
// Source : french-classes.ts, avec min CP ajusté à 400
export const ELO_LEVEL_RANGES: Record<SchoolLevel, { min: number; max: number }> = {
  CP:    { min: 400,  max: 549  },
  CE1:   { min: 550,  max: 649  },
  CE2:   { min: 650,  max: 799  },
  CM1:   { min: 800,  max: 999  },
  CM2:   { min: 1000, max: 1199 },
  '6e':  { min: 1200, max: 1399 },
  '5e':  { min: 1400, max: 1599 },
  '4e':  { min: 1600, max: 1799 },
  '3e':  { min: 1800, max: 1999 },
  '2de': { min: 2000, max: 2299 },
  '1re': { min: 2300, max: 2499 },
  'Tle': { min: 2500, max: 2749 },
  Sup1:  { min: 2750, max: 2999 },
  Sup2:  { min: 3000, max: 3499 },
  Sup3:  { min: 3500, max: 3999 },
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
  if (elo < 400) return 'CP';
  return 'Pro';
}

export function getRankFromElo(elo: number): RankTier {
  const entries = Object.entries(RANK_ELO_THRESHOLDS) as [RankTier, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  for (const [rank, threshold] of sorted) {
    if (elo >= threshold) return rank;
  }
  return 'F-';
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
