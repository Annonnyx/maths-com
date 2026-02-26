// Système de classes françaises pour le remplacement du système de niveaux 1-10
// Basé sur le programme scolaire français : CP, CE1, CE2, CM1, CM2, 6e, 5e, 4e, 3e, 2de, 1re, Tle, Sup1, Sup2, Sup3, Pro

import { RankClass, RANK_CLASSES, RANK_THRESHOLDS } from './elo';

// Définition des classes françaises
export const FRENCH_CLASSES = [
  'CP',      // Cours Préparatoire (6-7 ans)
  'CE1',     // Cours Élémentaire 1 (7-8 ans)
  'CE2',     // Cours Élémentaire 2 (8-9 ans)
  'CM1',     // Cours Moyen 1 (9-10 ans)
  'CM2',     // Cours Moyen 2 (10-11 ans)
  '6e',      // Sixième (11-12 ans) - début collège
  '5e',      // Cinquième (12-13 ans)
  '4e',      // Quatrième (13-14 ans)
  '3e',      // Troisième (14-15 ans) - fin collège
  '2de',     // Seconde (15-16 ans) - début lycée
  '1re',     // Première (16-17 ans)
  'Tle',     // Terminale (17-18 ans) - fin lycée
  'Sup1',    // Supérieur 1 (L1/M1)
  'Sup2',    // Supérieur 2 (L2/M2)
  'Sup3',    // Supérieur 3 (L3/M3/Doctorat)
  'Pro'      // Professionnel / Expert
] as const;

export type FrenchClass = typeof FRENCH_CLASSES[number];

// Mapping des rangs ELO vers les classes débloquées
// Format: [rang minimum, classes débloquées[]]
export const RANK_TO_CLASS_UNLOCKS: Record<RankClass, FrenchClass[]> = {
  'F-':  ['CP'],
  'F':   ['CP'],
  'F+':  ['CP', 'CE1'],
  'E-':  ['CP', 'CE1'],
  'E':   ['CP', 'CE1', 'CE2'],
  'E+':  ['CP', 'CE1', 'CE2'],
  'D-':  ['CP', 'CE1', 'CE2', 'CM1'],
  'D':   ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  'D+':  ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e'],
  'C-':  ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e'],
  'C':   ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e'],
  'C+':  ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'],
  'B-':  ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de'],
  'B':   ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re'],
  'B+':  ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle'],
  'A-':  ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1'],
  'A':   ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2'],
  'A+':  ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3'],
  'S-':  ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'],
  'S':   ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'],
  'S+':  ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro']
};

// Informations sur chaque classe
export interface ClassInfo {
  name: FrenchClass;
  fullName: string;
  ageRange: string;
  cycle: 'primaire' | 'college' | 'lycee' | 'superieur' | 'pro';
  description: string;
  color: string;
  icon: string;
  minElo: number;  // ELO minimum pour débloquer
  maxElo: number;  // ELO maximum de la classe
}

export const CLASS_INFO: Record<FrenchClass, ClassInfo> = {
  'CP': {
    name: 'CP',
    fullName: 'Cours Préparatoire',
    ageRange: '6-7 ans',
    cycle: 'primaire',
    description: 'Nombres jusqu\'à 1000, additions/soustractions simples, tables de 2-5',
    color: '#4ade80', // vert clair
    icon: '🌱',
    minElo: 0,
    maxElo: 549
  },
  'CE1': {
    name: 'CE1',
    fullName: 'Cours Élémentaire 1',
    ageRange: '7-8 ans',
    cycle: 'primaire',
    description: 'Nombres jusqu\'à 1000, tables complètes, division simple',
    color: '#22d3ee', // cyan
    icon: '🌿',
    minElo: 550,
    maxElo: 649
  },
  'CE2': {
    name: 'CE2',
    fullName: 'Cours Élémentaire 2',
    ageRange: '8-9 ans',
    cycle: 'primaire',
    description: 'Nombres jusqu\'à 10 000, fractions simples, début géométrie',
    color: '#38bdf8', // bleu clair
    icon: '🍃',
    minElo: 650,
    maxElo: 799
  },
  'CM1': {
    name: 'CM1',
    fullName: 'Cours Moyen 1',
    ageRange: '9-10 ans',
    cycle: 'primaire',
    description: 'Grands nombres, décimaux, fractions, périmètre/aire',
    color: '#60a5fa', // bleu
    icon: '🌳',
    minElo: 800,
    maxElo: 999
  },
  'CM2': {
    name: 'CM2',
    fullName: 'Cours Moyen 2',
    ageRange: '10-11 ans',
    cycle: 'primaire',
    description: 'Toutes opérations, pourcentages, solides, symétrie',
    color: '#818cf8', // indigo
    icon: '🌲',
    minElo: 1000,
    maxElo: 1199
  },
  '6e': {
    name: '6e',
    fullName: 'Sixième',
    ageRange: '11-12 ans',
    cycle: 'college',
    description: 'Priorité opératoire, nombres décimaux, axes de symétrie',
    color: '#a78bfa', // violet
    icon: '📚',
    minElo: 1200,
    maxElo: 1399
  },
  '5e': {
    name: '5e',
    fullName: 'Cinquième',
    ageRange: '12-13 ans',
    cycle: 'college',
    description: 'Nombres relatifs, fractions, début algèbre',
    color: '#c084fc', // violet clair
    icon: '📖',
    minElo: 1400,
    maxElo: 1599
  },
  '4e': {
    name: '4e',
    fullName: 'Quatrième',
    ageRange: '13-14 ans',
    cycle: 'college',
    description: 'Puissances, identités remarquables, Théorème de Pythagore',
    color: '#e879f9', // rose violet
    icon: '📐',
    minElo: 1600,
    maxElo: 1799
  },
  '3e': {
    name: '3e',
    fullName: 'Troisième',
    ageRange: '14-15 ans',
    cycle: 'college',
    description: 'Théorème de Thalès, trigonométrie, fonctions',
    color: '#f472b6', // rose
    icon: '🎓',
    minElo: 1800,
    maxElo: 1999
  },
  '2de': {
    name: '2de',
    fullName: 'Seconde',
    ageRange: '15-16 ans',
    cycle: 'lycee',
    description: 'Ensembles de nombres, intervalles, statistiques',
    color: '#fb7185', // rose rouge
    icon: '🎯',
    minElo: 2000,
    maxElo: 2299
  },
  '1re': {
    name: '1re',
    fullName: 'Première',
    ageRange: '16-17 ans',
    cycle: 'lycee',
    description: 'Dérivation, suites, probabilités avancées',
    color: '#fda4af', // rose pâle
    icon: '🏆',
    minElo: 2300,
    maxElo: 2499
  },
  'Tle': {
    name: 'Tle',
    fullName: 'Terminale',
    ageRange: '17-18 ans',
    cycle: 'lycee',
    description: 'Intégrales, équations différentielles, lois binomiales',
    color: '#fcd34d', // jaune
    icon: '👑',
    minElo: 2500,
    maxElo: 2749
  },
  'Sup1': {
    name: 'Sup1',
    fullName: 'Supérieur 1',
    ageRange: '18+ ans',
    cycle: 'superieur',
    description: 'Algèbre linéaire avancée, topologie, L1/M1',
    color: '#fbbf24', // ambre
    icon: '🔬',
    minElo: 2750,
    maxElo: 2999
  },
  'Sup2': {
    name: 'Sup2',
    fullName: 'Supérieur 2',
    ageRange: '19+ ans',
    cycle: 'superieur',
    description: 'Analyse complexe, géométrie différentielle, L2/M2',
    color: '#f59e0b', // orange
    icon: '⚗️',
    minElo: 3000,
    maxElo: 3499
  },
  'Sup3': {
    name: 'Sup3',
    fullName: 'Supérieur 3',
    ageRange: '20+ ans',
    cycle: 'superieur',
    description: 'Recherche, L3/M3/Doctorat',
    color: '#d97706', // orange foncé
    icon: '🔭',
    minElo: 3500,
    maxElo: 3999
  },
  'Pro': {
    name: 'Pro',
    fullName: 'Expert',
    ageRange: 'Expert',
    cycle: 'pro',
    description: 'Niveau expert - Tous les concepts mathématiques avancés',
    color: '#dc2626', // rouge
    icon: '⭐',
    minElo: 4000,
    maxElo: Infinity
  }
};

// Fonction pour obtenir la classe actuelle d'un joueur selon son ELO
export function getClassFromElo(elo: number): FrenchClass {
  for (const className of FRENCH_CLASSES) {
    const info = CLASS_INFO[className];
    if (elo >= info.minElo && elo <= info.maxElo) {
      return className;
    }
  }
  return 'CP';
}

// Fonction pour obtenir les classes débloquées selon le rang
export function getUnlockedClasses(rank: RankClass): FrenchClass[] {
  return RANK_TO_CLASS_UNLOCKS[rank] || ['CP'];
}

// Fonction pour vérifier si une classe est débloquée
export function isClassUnlocked(className: FrenchClass, elo: number, rank: RankClass): boolean {
  const unlocked = getUnlockedClasses(rank);
  return unlocked.includes(className);
}

// Fonction pour obtenir la prochaine classe à débloquer
export function getNextClass(currentClass: FrenchClass): FrenchClass | null {
  const index = FRENCH_CLASSES.indexOf(currentClass);
  if (index < FRENCH_CLASSES.length - 1) {
    return FRENCH_CLASSES[index + 1];
  }
  return null;
}

// Fonction pour obtenir le pourcentage de progression dans la classe actuelle
export function getClassProgress(elo: number, currentClass: FrenchClass): number {
  const info = CLASS_INFO[currentClass];
  const range = info.maxElo - info.minElo;
  const progress = elo - info.minElo;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

// Fonction pour convertir une difficulté (1-10) en classe française
export function getClassFromDifficulty(difficulty: number): FrenchClass {
  // Difficulty 1-10 maps to class index 0-9 (CP to 2de)
  const index = Math.max(0, Math.min(difficulty - 1, FRENCH_CLASSES.length - 1));
  return FRENCH_CLASSES[index];
}

// Fonction pour formater le nom d'une classe pour l'affichage
export function formatClassName(className: FrenchClass): string {
  const info = CLASS_INFO[className];
  return `${info.icon} ${info.name}`;
}

// Fonction pour obtenir le message de passage de classe
export function getClassPromotionMessage(oldClass: FrenchClass, newClass: FrenchClass): string {
  const newInfo = CLASS_INFO[newClass];
  return `🎉 Félicitations ! Tu passes en classe de ${newInfo.fullName} (${newClass}) ! ${newInfo.icon}`;
}

// Fonction pour vérifier si un joueur passe une classe après un changement d'ELO
export function checkClassPromotion(
  oldElo: number, 
  newElo: number
): { promoted: boolean; oldClass: FrenchClass; newClass: FrenchClass; message: string } | null {
  const oldClass = getClassFromElo(oldElo);
  const newClass = getClassFromElo(newElo);
  
  if (oldClass !== newClass && FRENCH_CLASSES.indexOf(newClass) > FRENCH_CLASSES.indexOf(oldClass)) {
    return {
      promoted: true,
      oldClass,
      newClass,
      message: getClassPromotionMessage(oldClass, newClass)
    };
  }
  return null;
}
