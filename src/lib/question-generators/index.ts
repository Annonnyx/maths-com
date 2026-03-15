import { GeneratedQuestion, QuestionGenerator, DomainType } from './types';
import { ArithmeticGenerator } from './arithmetic';
import { AlgebraGenerator } from './algebra';
import { GeometryGenerator } from './geometry';
import { FunctionsGenerator } from './functions';
import { StatisticsGenerator } from './statistics';
import { ComplexGenerator } from './complex';

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

const frenchClassToDifficulty: Record<FrenchClass, number> = {
  // Lowercase variants
  'cp': 1,
  'ce1': 2,
  'ce2': 3,
  'cm1': 4,
  'cm2': 5,
  '6e': 6,
  '5e': 7,
  '4e': 8,
  '3e': 9,
  '2nde': 9,
  '1ere': 10,
  'terminale': 10,
  // Uppercase variants
  'CP': 1,
  'CE1': 2,
  'CE2': 3,
  'CM1': 4,
  'CM2': 5,
  // Accented variants
  '6ème': 6,
  '5ème': 7,
  '4ème': 8,
  '3ème': 9,
  '1ère': 10,
  'Terminale': 10,
  // Frontend variants (without accents)
  '6eme': 6,
  '5eme': 7,
  '4eme': 8,
  '3eme': 9,
  // Short variants used by frontend
  '2de': 9,
  '1re': 10,
  'Tle': 10,
  'Pro': 10,
  'Sup1': 10,
  'Sup2': 10,
  'Sup3': 10
};

// Adaptive generator that creates questions based on French school level
export class AdaptiveQuestionGenerator {
  private arithmetic = new ArithmeticGenerator();
  private algebra = new AlgebraGenerator();
  private geometry = new GeometryGenerator();
  private statistics = new StatisticsGenerator();

  generateForLevel(level: FrenchClass, options?: { difficulty?: string }): GeneratedQuestion {
    const baseDifficulty = frenchClassToDifficulty[level];
    
    // Determine which domains are available for this level
    let generators: QuestionGenerator[] = [this.arithmetic];
    
    if (baseDifficulty >= 3) {
      generators.push(this.statistics);
    }
    if (baseDifficulty >= 4) {
      generators.push(this.geometry);
    }
    if (baseDifficulty >= 6) {
      generators.push(this.algebra);
    }

    // Select generator with weighted distribution for better balance
    const weights = generators.map((_, index) => {
      // Arithmetic should be most common at lower levels
      if (index === 0) return baseDifficulty <= 4 ? 0.6 : 0.3;
      // Other domains get higher weight at appropriate levels
      return baseDifficulty <= 4 ? 0.4 / (generators.length - 1) : 0.7 / (generators.length - 1);
    });
    
    const random = Math.random();
    let cumulative = 0;
    let selectedGenerator = generators[0];
    
    for (let i = 0; i < generators.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        selectedGenerator = generators[i];
        break;
      }
    }
    
    return selectedGenerator.generate(baseDifficulty);
  }

  generateMixedForLevel(level: FrenchClass, count: number = 10): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    for (let i = 0; i < count; i++) {
      questions.push(this.generateForLevel(level));
    }
    return questions;
  }
}

export class QuestionGeneratorFactory {
  private static generators = new Map<DomainType, QuestionGenerator>();

  static {
    this.generators.set('arithmetic', new ArithmeticGenerator());
    this.generators.set('algebra', new AlgebraGenerator());
    this.generators.set('geometry', new GeometryGenerator());
    this.generators.set('functions', new FunctionsGenerator());
    this.generators.set('statistics', new StatisticsGenerator());
    this.generators.set('complex', new ComplexGenerator());
  }

  static getGenerator(domain: DomainType): QuestionGenerator {
    const generator = this.generators.get(domain);
    if (!generator) {
      throw new Error(`No generator found for domain: ${domain}`);
    }
    return generator;
  }

  static generateQuestion(domain: DomainType, difficulty: number): GeneratedQuestion {
    const generator = this.getGenerator(domain);
    return generator.generate(difficulty);
  }

  static generateMixedQuestions(difficulty: number, count: number = 10): GeneratedQuestion[] {
    const domains: DomainType[] = ['arithmetic', 'algebra', 'geometry', 'functions', 'statistics'];
    
    // Filter domains based on difficulty
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
  ArithmeticGenerator,
  AlgebraGenerator,
  GeometryGenerator,
  FunctionsGenerator,
  StatisticsGenerator,
  ComplexGenerator,
};

// Export types
export type {
  GeneratedQuestion,
  QuestionGenerator,
  DomainType,
};
