import { GeneratedQuestion, QuestionGenerator, DomainType } from './types';
import { ArithmeticGenerator } from './arithmetic';
import { AlgebraGenerator } from './algebra';
import { GeometryGenerator } from './geometry';
import { FunctionsGenerator } from './functions';
import { StatisticsGenerator } from './statistics';
import { ComplexGenerator } from './complex';

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
