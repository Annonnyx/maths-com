// Import from elo-ranges.ts as the source of truth
export type { SchoolLevel } from './elo-ranges';
export { ELO_LEVEL_RANGES, ALL_LEVELS, getLevelFromElo } from './elo-ranges';

// Re-export for local use
import { SchoolLevel as ImportedSchoolLevel } from './elo-ranges';
type SchoolLevel = ImportedSchoolLevel;

export interface GeneratedQuestion {
  id: string;
  type: 'numeric' | 'mcq' | 'expression' | 'addition' | 'subtraction' | 'multiplication' | 'division' | 'power' | 'root' | 'factorization' | 'percentage' | 'fraction' | 'equation' | 'mental_math' | 'logic' | 'geometry' | 'delta' | 'quadratic' | 'pythagore' | 'thales' | 'trigonometry' | 'vectors' | 'complex_numbers' | 'matrices' | 'graphs' | 'integrals' | 'derivatives' | 'probabilities' | 'statistics' | 'sequences' | 'functions' | 'exp_log' | 'limits' | 'normal_law' | 'geometry_3d' | 'calculation' | 'complex';
  domain: DomainType;
  level: SchoolLevel;
  difficultyElo: number;
  question: string;
  answer: string;
  explanation?: string;
  timeEstimate?: number;
  options?: string[]; // For MCQ
  acceptableAnswers?: string[]; // For numeric/expression with multiple valid options
  // Nouvelles métadonnées pour la validation
  hasRemainder?: boolean; // Pour divisions CM1
  acceptsDecimalInsteadOfRemainder?: boolean; // Pour divisions CM2
  expectedDecimals?: 0 | 1; // Pour divisions 6e
  validate?: (userInput: string | string[]) => boolean; // Fonction de validation personnalisée
  // Champs de l'ancien système Exercise pour compatibilité
  className?: string; // Alias pour level (compatibilité)
  operationType?: string; // Alias pour type (compatibilité)
}

export interface GenerationContext {
  userElo: number;
  excludeGeometry?: boolean;
}

export interface LevelGenerator {
  getEloRange(): { min: number; max: number };
  getAvailableDomains(excludeGeometry?: boolean): DomainType[];
  generate(context: GenerationContext): GeneratedQuestion;
}

export type DomainType = 
  | 'arithmetic'
  | 'algebra' 
  | 'geometry'
  | 'functions'
  | 'statistics'
  | 'complex'
  | 'calculation'
  | string; // Pour compatibilité avec Exercise

// Helper functions for random generation
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

export function hashQuestion(level: string, domain: string, params: any[]): string {
  return `${level}-${domain}-${params.join('-')}`;
}
