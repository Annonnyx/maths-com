// ============================================================================
// LEVEL-UNLOCK.TS — Distribution pondérée des niveaux selon l'Elo
// ============================================================================
//
// PRINCIPE :
//   - Le niveau "courant" (selon Elo) a le poids le plus fort (~45%)
//   - Les niveaux inférieurs débloqués ont des poids décroissants
//   - Le niveau juste au-dessus est accessible en "mode défi" (~10%)
//   - Les niveaux non encore débloqués sont exclus
//
// EXEMPLE — joueur C (Elo ~2200, niveau courant = 4e) :
//   CP    2%   CE1  3%   CE2  4%   CM1  5%   CM2  6%
//   6e   10%   5e  15%   4e  45%   3e  10%
//   2de (défi si progression > 50% dans 4e)
//
// REMPLACEMENT dans index.ts :
//   import { selectLevelByWeight } from './level-unlock';
//   // Remplacer selectAdaptiveLevel(this.userElo)
//   // par      selectLevelByWeight(this.userElo)
// ============================================================================

import {
  SchoolLevel, ALL_LEVELS, ELO_LEVEL_RANGES,
  getLevelFromElo, LEVEL_UNLOCK_AT_ELO
} from './elo-ranges';

export interface LevelWeight {
  level: SchoolLevel;
  weight: number;   // normalisé 0→1, somme = 1
  unlocked: boolean;
}

// Poids selon la distance au niveau courant (distance = index_level - index_courant)
const DISTANCE_WEIGHTS: Record<string, number> = {
  '0':  45,  // courant
  '-1': 20,  // un en dessous
  '-2': 12,  // deux en dessous
  '-3': 7,
  '-4': 4,
  '-5': 2,
  '-6': 1,
  '-7': 1,
  '1':  8,   // un au-dessus (défi, si débloqué partiellement)
};

export function getLevelDistribution(userElo: number): LevelWeight[] {
  const currentLevel = getLevelFromElo(userElo);
  const currentIndex = ALL_LEVELS.indexOf(currentLevel);
  const currentRange = ELO_LEVEL_RANGES[currentLevel];
  const progressInLevel =
    (userElo - currentRange.min) / (currentRange.max - currentRange.min);

  const result: LevelWeight[] = [];
  let total = 0;

  for (let i = 0; i < ALL_LEVELS.length; i++) {
    const level = ALL_LEVELS[i];
    const distance = i - currentIndex;
    const isUnlocked = userElo >= LEVEL_UNLOCK_AT_ELO[level];

    if (!isUnlocked) {
      // Niveau suivant accessible en défi si on est à > 50% dans le niveau courant
      if (distance === 1 && progressInLevel >= 0.5) {
        const challengeWeight = Math.round((progressInLevel - 0.5) * 2 * 16);
        if (challengeWeight > 0) {
          result.push({ level, weight: challengeWeight, unlocked: false });
          total += challengeWeight;
        }
      }
      continue;
    }

    const distKey = String(Math.max(distance, -7));
    const w = DISTANCE_WEIGHTS[distKey] ?? 1;
    result.push({ level, weight: w, unlocked: true });
    total += w;
  }

  // Normaliser
  return result.map(d => ({ ...d, weight: total > 0 ? d.weight / total : 0 }));
}

// Roue de la fortune pondérée
export function selectLevelByWeight(userElo: number): SchoolLevel {
  const dist = getLevelDistribution(userElo);
  const rand = Math.random();
  let cumulative = 0;
  for (const { level, weight } of dist) {
    cumulative += weight;
    if (rand <= cumulative) return level;
  }
  return getLevelFromElo(userElo);
}

// Résumé lisible (debug / admin)
export function getDistributionSummary(userElo: number): string {
  const dist = getLevelDistribution(userElo);
  const lines = dist
    .filter(d => d.weight > 0.005)
    .map(d => `  ${d.level.padEnd(6)} ${(d.weight * 100).toFixed(1).padStart(5)}%${d.unlocked ? '' : ' ⚡défi'}`);
  return [
    `Elo ${userElo} → niveau ${getLevelFromElo(userElo)}`,
    '─'.repeat(30),
    ...lines,
  ].join('\n');
}
