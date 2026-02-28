export interface GeneratedQuestion {
  question: string;
  answers: string[];
  correct: string;
  explanation: string;
  difficulty: number;
}

export interface QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion;
}

export type DomainType = 
  | 'arithmetic'
  | 'algebra' 
  | 'geometry'
  | 'functions'
  | 'statistics'
  | 'complex';

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
