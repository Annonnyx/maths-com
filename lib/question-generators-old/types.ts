// ============================================================================
// Question Generators System - Core Types
// ============================================================================
// This file defines all types, interfaces, and helper functions for the
// adaptive question generation system.
//
// Architecture: Organized by school level (CP → Pro/Licence)
// Each level has specific constraints on operand sizes and question types.
//
// IMPORTANT: Respect the `excludeGeometry` flag from user preferences.
// When true, NEVER generate geometry, visual_mcq, or spatial questions.
// ============================================================================

export type QuestionType =
  | 'numeric'        // Réponse = un nombre (input text)
  | 'mcq'            // QCM, 4 choix textuels
  | 'visual_mcq'     // QCM avec image/figure à choisir
  | 'equation'       // Compléter une équation
  | 'geometry'       // Exercice avec visualisation géométrique
  | 'expression'     // Calculer/simplifier une expression
  | 'contextual';    // Problème en contexte (texte narratif)

export type SchoolLevel =
  | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  | '6eme' | '5eme' | '4eme' | '3eme'
  | '2nde' | '1ere' | 'Terminale' | 'TerminaleExpert'
  | 'Pro';

export type DomainType =
  | 'numbers'        // Nombres, décomposition, comparaison
  | 'calculation'    // Opérations de base
  | 'fractions'      // Fractions
  | 'geometry'       // Géométrie
  | 'measurement'    // Mesures (temps, longueur, etc.)
  | 'algebra'        // Algèbre (à partir de 6ème)
  | 'functions'      // Fonctions (à partir de 2nde)
  | 'statistics'     // Statistiques
  | 'complex'        // Nombres complexes, matrices (spécialité)
  | 'logic'          // Logique et raisonnement
  | 'contextual';    // Problèmes contextualisés

// ============================================================================
// Question Structure
// ============================================================================

export interface GeneratedQuestion {
  id: string;                    // Unique identifier (hash)
  type: QuestionType;            // Visual type for frontend
  domain: DomainType;            // Mathematical domain
  level: SchoolLevel;            // Target school level
  difficultyElo: number;         // ELO difficulty (400-4000)
  
  // Content
  question: string;              // Question text (HTML/LaTeX supported)
  answer: string;                // Correct answer (normalized)
  acceptableAnswers?: string[];    // Alternative acceptable answers
  
  // For MCQ types
  options?: string[];            // All options (including correct)
  correctOptionIndex?: number;   // Index of correct option
  
  // Visual elements (for visual_mcq and geometry)
  visualData?: {
    svg?: string;                // SVG markup for figures
    width?: number;
    height?: number;
  };
  
  // Metadata
  explanation: string;          // Step-by-step solution
  timeEstimate?: number;         // Estimated time in seconds
  
  // Constraints used to generate (for debugging/history)
  _meta?: {
    operandA?: number;
    operandB?: number;
    operation?: string;
  };
}

// ============================================================================
// Generation Context
// ============================================================================

export interface GenerationContext {
  userElo: number;               // Current user ELO rating
  excludeGeometry: boolean;      // User preference: NO geometry questions
  recentQuestionHashes: string[]; // Last 30 question hashes (anti-repetition)
  targetLevel?: SchoolLevel;     // Override: force specific level
  domains?: DomainType[];       // Allowed domains (default: all for level)
  questionCount?: number;        // Total questions in session (for diversity)
}

export interface LevelGenerator {
  generate(context: GenerationContext): GeneratedQuestion;
  getAvailableDomains(excludeGeometry: boolean): DomainType[];
  getEloRange(): { min: number; max: number };
}

// ============================================================================
// Operand Constraints by Level
// ============================================================================

export interface OperandConstraints {
  add_max: number | null;        // Max operand for addition
  sub_max: number | null;        // Max operand for subtraction
  mul_max: number | null;        // Max operand for multiplication
  div_max: number | null;        // Max divisor for division
}

export const OPERAND_CONSTRAINTS: Record<SchoolLevel, OperandConstraints> = {
  CP:              { add_max: 20,   sub_max: 20,   mul_max: null, div_max: null },
  CE1:             { add_max: 99,   sub_max: 99,   mul_max: 10,   div_max: null },
  CE2:             { add_max: 999,  sub_max: 999,  mul_max: 9,    div_max: 9    },
  CM1:             { add_max: 9999, sub_max: 9999, mul_max: 19,   div_max: 9    },
  CM2:             { add_max: 9999, sub_max: 9999, mul_max: 99,   div_max: 19   },
  '6eme':          { add_max: null, sub_max: null, mul_max: null, div_max: null }, // Calcul algébrique
  '5eme':          { add_max: null, sub_max: null, mul_max: null, div_max: null },
  '4eme':          { add_max: null, sub_max: null, mul_max: null, div_max: null },
  '3eme':          { add_max: null, sub_max: null, mul_max: null, div_max: null },
  '2nde':          { add_max: null, sub_max: null, mul_max: null, div_max: null },
  '1ere':          { add_max: null, sub_max: null, mul_max: null, div_max: null },
  'Terminale':     { add_max: null, sub_max: null, mul_max: null, div_max: null },
  'TerminaleExpert': { add_max: null, sub_max: null, mul_max: null, div_max: null },
  'Pro':           { add_max: null, sub_max: null, mul_max: null, div_max: null },
};

// ============================================================================
// ELO to Level Mapping
// ============================================================================

export const ELO_LEVEL_RANGES: Record<SchoolLevel, { min: number; max: number }> = {
  CP:              { min: 400,  max: 570  },
  CE1:             { min: 571,  max: 742  },
  CE2:             { min: 743,  max: 913  },
  CM1:             { min: 914,  max: 1084 },
  CM2:             { min: 1085, max: 1255 },
  '6eme':          { min: 1256, max: 1597 },
  '5eme':          { min: 1598, max: 1939 },
  '4eme':          { min: 1940, max: 2281 },
  '3eme':          { min: 2282, max: 2623 },
  '2nde':          { min: 2624, max: 2794 },
  '1ere':          { min: 2795, max: 2965 },
  'Terminale':     { min: 2966, max: 3307 },
  'TerminaleExpert': { min: 3308, max: 3649 },
  'Pro':           { min: 3650, max: 4000 },
};

export function getLevelFromElo(elo: number): SchoolLevel {
  for (const [level, range] of Object.entries(ELO_LEVEL_RANGES)) {
    if (elo >= range.min && elo <= range.max) {
      return level as SchoolLevel;
    }
  }
  return 'CP'; // Default fallback
}

// ============================================================================
// Helper Functions
// ============================================================================

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, decimals: number = 1): number {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate a unique hash for a question (for anti-repetition)
export function hashQuestion(level: SchoolLevel, domain: DomainType, 
                              operands: number[]): string {
  const data = `${level}:${domain}:${operands.join(':')}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `q${Math.abs(hash).toString(36).substring(0, 8)}`;
}

// Validate that operands respect level constraints
export function validateOperands(level: SchoolLevel, operation: 'add' | 'sub' | 'mul' | 'div',
                                  a: number, b?: number): boolean {
  const constraints = OPERAND_CONSTRAINTS[level];
  
  switch (operation) {
    case 'add':
      return constraints.add_max === null || (a <= constraints.add_max && (b === undefined || b <= constraints.add_max));
    case 'sub':
      return constraints.sub_max === null || (a <= constraints.sub_max && (b === undefined || b <= constraints.sub_max));
    case 'mul':
      return constraints.mul_max === null || (a <= constraints.mul_max && (b === undefined || b <= constraints.mul_max));
    case 'div':
      return constraints.div_max === null || (b !== undefined && b <= constraints.div_max);
    default:
      return true;
  }
}

// ============================================================================
// Diversity Enforcement
// ============================================================================

export class DiversityTracker {
  private recentTypes: DomainType[] = [];
  private readonly maxHistory = 5;
  private typeCounts: Map<DomainType, number> = new Map();
  private totalCount = 0;

  record(domain: DomainType): void {
    this.recentTypes.push(domain);
    if (this.recentTypes.length > this.maxHistory) {
      this.recentTypes.shift();
    }
    
    this.typeCounts.set(domain, (this.typeCounts.get(domain) || 0) + 1);
    this.totalCount++;
  }

  // Check if we can use this domain (max 30% per type, no consecutive)
  canUse(domain: DomainType, targetTotal: number): boolean {
    // No consecutive same type
    if (this.recentTypes[this.recentTypes.length - 1] === domain) {
      return false;
    }
    
    // Max 30% of total
    const count = this.typeCounts.get(domain) || 0;
    const percentage = (count / targetTotal) * 100;
    return percentage < 30;
  }

  getLastType(): DomainType | undefined {
    return this.recentTypes[this.recentTypes.length - 1];
  }
}

// ============================================================================
// Adaptive Difficulty Selection (60/30/10 Rule)
// ============================================================================

export function selectAdaptiveLevel(userElo: number): SchoolLevel {
  const currentLevel = getLevelFromElo(userElo);
  const roll = Math.random() * 100;
  
  // Get adjacent levels
  const levels = Object.keys(ELO_LEVEL_RANGES) as SchoolLevel[];
  const currentIndex = levels.indexOf(currentLevel);
  
  if (roll < 60) {
    // 60%: Current level
    return currentLevel;
  } else if (roll < 90) {
    // 30%: One level higher (if possible)
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  } else {
    // 10%: One level lower (if possible)
    return levels[Math.max(currentIndex - 1, 0)];
  }
}

// ============================================================================
// Visual MCQ Helpers (for CP-CE2)
// ============================================================================

export interface VisualOption {
  id: string;
  svg: string;
  isCorrect: boolean;
}

export function generateShapeSVG(shape: 'circle' | 'square' | 'triangle' | 'rectangle', 
                                  size: number = 80): string {
  switch (shape) {
    case 'circle':
      return `<circle cx="${size/2}" cy="${size/2}" r="${size/2 - 5}" fill="#60A5FA" stroke="#1E40AF" stroke-width="2"/>`;
    case 'square':
      return `<rect x="5" y="5" width="${size-10}" height="${size-10}" fill="#34D399" stroke="#065F46" stroke-width="2"/>`;
    case 'triangle':
      const h = size - 10;
      const w = size - 10;
      const points = `${size/2},5 5,${h} ${w},${h}`;
      return `<polygon points="${points}" fill="#F87171" stroke="#991B1B" stroke-width="2"/>`;
    case 'rectangle':
      return `<rect x="5" y="15" width="${size-10}" height="${size-30}" fill="#A78BFA" stroke="#5B21B6" stroke-width="2"/>`;
    default:
      return '';
  }
}

// ============================================================================
// Contextual Problem Templates
// ============================================================================

export const FIRST_NAMES = [
  'Lucas', 'Emma', 'Léo', 'Jade', 'Hugo', 'Alice', 'Tom', 'Lina',
  'Nathan', 'Chloé', 'Théo', 'Manon', 'Enzo', 'Sarah', 'Louis', 'Zoé',
  'Mathis', 'Camille', 'Ethan', 'Léa', 'Noah', 'Juliette', 'Arthur', 'Inès',
  'Gabriel', 'Maëlys', 'Jules', 'Anna', 'Timéo', 'Lola'
];

export const OBJECTS = {
  CP: ['billes', 'bonbons', 'crayons', 'images', 'cartes', 'stickers', 'pièces'],
  CE1: ['livres', 'cahiers', 'gommes', 'trousers', 'ballons', 'pommes', 'oranges'],
  CE2: ['cartes de collection', 'figurines', 'badges', 'bracelets', 'étoiles'],
};

export const ACTIONS = {
  give: ['donne', 'offre', 'prête'],
  lose: ['perd', 'égare', 'laisse tomber'],
  eat: ['mange', 'dévore', 'savour'],
  receive: ['reçoit', 'gagne', 'trouve'],
  buy: ['achète', 'commande'],
  sell: ['vend', 'échange'],
};
