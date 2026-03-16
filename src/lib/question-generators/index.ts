import { 
  GeneratedQuestion, 
  GenerationContext, 
  LevelGenerator, 
  DomainType, 
  SchoolLevel,
  randomChoice 
} from './types';
import { selectLevelByWeight } from './level-unlock';
import { Sup1Generator } from './sup1';
import { Sup2Generator } from './sup2';
import { Sup3Generator } from './sup3';

// Import level generators (will be created in next step)
import { CPGenerator } from './cp';
import { CE1Generator } from './ce1';
import { CE2Generator } from './ce2';
import { CM1Generator } from './cm1';
import { CM2Generator } from './cm2';

// French school levels mapped to difficulty (1-10)
// Supports both lowercase (cp, ce1) and uppercase/accented formats (CP, CE1, 6ème)
export type FrenchClass = 
  // Standard lowercase
  | 'cp' | 'ce1' | 'ce2' | 'cm1' | 'cm2' 
  | '6e' | '5e' | '4e' | '3e' 
  | '2nde' | '1ere' | 'terminale'
  // Uppercase variants
  | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2'
  | '6ème' | '5ème' | '4ème' | '3ème' | '2nde' | '1ère' | 'Terminale'
  // Frontend variants (without accents)
  | '6eme' | '5eme' | '4eme' | '3eme' | '1ere' | 'Terminale'
  // Short variants used by frontend
  | '2de' | '1re' | 'Tle' | 'Pro' | 'Sup1' | 'Sup2' | 'Sup3';

// Convert various FrenchClass formats to standard SchoolLevel
function normalizeLevel(level: FrenchClass): SchoolLevel {
  const mapping: Record<FrenchClass, SchoolLevel> = {
    // Standard
    'cp': 'CP', 'ce1': 'CE1', 'ce2': 'CE2', 'cm1': 'CM1', 'cm2': 'CM2',
    '6e': '6e', '5e': '5e', '4e': '4e', '3e': '3e',
    '2nde': '2de', '1ere': '1re', 'terminale': 'Tle',
    // Uppercase
    'CP': 'CP', 'CE1': 'CE1', 'CE2': 'CE2', 'CM1': 'CM1', 'CM2': 'CM2',
    '6ème': '6e', '5ème': '5e', '4ème': '4e', '3ème': '3e', '1ère': '1re', 'Terminale': 'Tle',
    // Frontend variants
    '6eme': '6e', '5eme': '5e', '4eme': '4e', '3eme': '3e', '1ere': '1re',
    // Short variants
    '2de': '2de', '1re': '1re', 'Tle': 'Tle', 'Pro': 'Pro', 'Sup1': 'Sup1', 'Sup2': 'Sup2', 'Sup3': 'Sup3'
  };
  return mapping[level] || 'CP';
}

// Adaptive generator that creates questions based on Elo and weighted level selection
export class AdaptiveQuestionGenerator {
  private userElo: number;
  private generators: Map<SchoolLevel, LevelGenerator>;

  constructor(userElo: number = 1000) {
    this.userElo = userElo;
    this.generators = new Map();
    
    // Register all level generators
    this.generators.set('CP', new CPGenerator());
    this.generators.set('CE1', new CE1Generator());
    this.generators.set('CE2', new CE2Generator());
    this.generators.set('CM1', new CM1Generator());
    this.generators.set('CM2', new CM2Generator());
    this.generators.set('Sup1', new Sup1Generator());
    this.generators.set('Sup2', new Sup2Generator());
    this.generators.set('Sup3', new Sup3Generator());
    
    // Note: 6e, 5e, 4e, 3e, 2de, 1re, Tle, Pro generators 
    // will use existing domain-based generators for now
  }

  setUserElo(elo: number): void {
    this.userElo = elo;
  }

  generateNext(options?: { excludeGeometry?: boolean }): GeneratedQuestion {
    // Use weighted level selection instead of fixed difficulty
    const targetLevel = selectLevelByWeight(this.userElo);
    
    const generator = this.generators.get(targetLevel);
    if (generator) {
      const context: GenerationContext = {
        userElo: this.userElo,
        excludeGeometry: options?.excludeGeometry
      };
      return generator.generate(context);
    }

    // Fallback to domain-based generation for levels without specific generators
    return this.generateDomainBased(targetLevel, options);
  }

  private generateDomainBased(level: SchoolLevel, options?: { excludeGeometry?: boolean }): GeneratedQuestion {
    // For now, create a simple fallback question
    // In a full implementation, this would use the existing domain generators
    const context: GenerationContext = {
      userElo: this.userElo,
      excludeGeometry: options?.excludeGeometry
    };

    return {
      id: `fallback-${level}-${Date.now()}`,
      type: 'numeric',
      domain: 'calculation',
      level,
      difficultyElo: this.userElo,
      question: `Question de niveau ${level} (générateur de domaine)`,
      answer: '0',
      explanation: 'Générateur de domaine par défaut',
      timeEstimate: 30
    };
  }

  generateMixed(count: number = 10, options?: { excludeGeometry?: boolean }): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    for (let i = 0; i < count; i++) {
      questions.push(this.generateNext(options));
    }
    return questions;
  }

  // Legacy method for backward compatibility
  generateForLevel(level: FrenchClass, options?: { difficulty?: string }): GeneratedQuestion {
    const normalizedLevel = normalizeLevel(level);
    const generator = this.generators.get(normalizedLevel);
    
    if (generator) {
      const context: GenerationContext = {
        userElo: this.userElo,
        excludeGeometry: options?.excludeGeometry
      };
      return generator.generate(context);
    }

    return this.generateDomainBased(normalizedLevel, options);
  }
}

export class QuestionGeneratorFactory {
  private static generators = new Map<DomainType, LevelGenerator>();

  static {
    // Domain generators can be registered here if needed
    // For now, we focus on level-based generators
  }

  static getGenerator(domain: DomainType): LevelGenerator {
    const generator = this.generators.get(domain);
    if (!generator) {
      throw new Error(`No generator found for domain: ${domain}`);
    }
    return generator;
  }

  static generateQuestion(domain: DomainType, difficulty: number): GeneratedQuestion {
    const generator = this.getGenerator(domain);
    const context: GenerationContext = { userElo: difficulty * 200 }; // Rough mapping
    return generator.generate(context);
  }

  static generateMixedQuestions(difficulty: number, count: number = 10): GeneratedQuestion[] {
    const domains: DomainType[] = ['arithmetic', 'algebra', 'geometry', 'functions', 'statistics'];
    
    let availableDomains = domains;
    if (difficulty <= 3) {
      availableDomains = ['arithmetic'];
    } else if (difficulty <= 6) {
      availableDomains = ['arithmetic', 'algebra', 'geometry', 'statistics'];
    } else if (difficulty <= 8) {
      availableDomains = ['arithmetic', 'algebra', 'geometry', 'functions', 'statistics'];
    }

    const questions: GeneratedQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const domain = availableDomains[Math.floor(Math.random() * availableDomains.length)];
      questions.push(this.generateQuestion(domain, difficulty));
    }

    return questions;
  }

  static getAllDomains(): DomainType[] {
    return Array.from(this.generators.keys());
  }
}

// Export individual generators for direct use
export {
  Sup1Generator,
  Sup2Generator,
  Sup3Generator,
  CPGenerator,
  CE1Generator,
  CE2Generator,
  CM1Generator,
  CM2Generator,
};

// Export types
export type {
  GeneratedQuestion,
  LevelGenerator,
  DomainType,
  SchoolLevel,
  GenerationContext,
};

// Legacy function for multiplayer compatibility
export function generateMultiplayerQuestions(
  player1Elo: number,
  player2Elo: number,
  count: number = 20,
  excludeGeometry: boolean = false
): GeneratedQuestion[] {
  const avgElo = Math.round((player1Elo + player2Elo) / 2);
  const gen = new AdaptiveQuestionGenerator(avgElo);
  return gen.generateMixed(count, { excludeGeometry });
}
