export function generateMultiplayerQuestions(
  player1Elo: number,
  player2Elo: number,
  count: number = 20,
  excludeGeometry: boolean = false
): GeneratedQuestion[] {
  const avgElo = Math.round((player1Elo + player2Elo) / 2);
  const gen = new AdaptiveQuestionGenerator(avgElo, excludeGeometry, count);
  return gen.generateBatch(count);
}

// ============================================================================
// Question Generator Factory - Main Entry Point
// ============================================================================

// This module provides the main API for generating adaptive questions.
//
// KEY FEATURES:
// - Adaptive difficulty: 60% current level, 30% +1 level, 10% -1 level
// - Diversity tracking: No consecutive same domain, max 30% per domain
// - Geometry exclusion: Respects user preference to exclude geometry questions
// - Anti-repetition: Tracks last 30 question hashes
//
// USAGE:
//   import { AdaptiveQuestionGenerator } from '~/lib/question-generators';
//   const generator = new AdaptiveQuestionGenerator(userElo, excludeGeometry);
//   const question = generator.generateNext();
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, SchoolLevel,
  getLevelFromElo, selectAdaptiveLevel, DiversityTracker,
  DomainType, ELO_LEVEL_RANGES
} from './types';

// Import all level generators
import { CPGenerator } from './cp';
import { CE1Generator } from './ce1';
import { CE2Generator } from './ce2';
import { CM1Generator } from './cm1';
import { CM2Generator } from './cm2';
import { SixiemeGenerator } from './sixieme';
import { CinquiemeGenerator } from './cinquieme';
import { QuatriemeGenerator } from './quatrieme';
import { TroisiemeGenerator } from './troisieme';
import { SecondeGenerator } from './seconde';
import { PremiereGenerator } from './premiere';
import { TerminaleGenerator } from './terminale';
import { ProLicenceGenerator } from './pro';

// Type for all level generators
interface LevelGeneratorInstance {
  level: SchoolLevel;
  generator: InstanceType<
    | typeof CPGenerator
    | typeof CE1Generator
    | typeof CE2Generator
    | typeof CM1Generator
    | typeof CM2Generator
    | typeof SixiemeGenerator
    | typeof CinquiemeGenerator
    | typeof QuatriemeGenerator
    | typeof TroisiemeGenerator
    | typeof SecondeGenerator
    | typeof PremiereGenerator
    | typeof TerminaleGenerator
    | typeof ProLicenceGenerator
  >;
}

// Factory class for generating adaptive questions
export class AdaptiveQuestionGenerator {
  private userElo: number;
  private excludeGeometry: boolean;
  private diversityTracker: DiversityTracker;
  private recentHashes: string[] = [];
  private questionCount: number = 0;
  private targetTotal: number;
  
  // Map of level to generator instance
  private generators = new Map<SchoolLevel, { 
    generate: (ctx: GenerationContext) => GeneratedQuestion;
    getAvailableDomains: (excludeGeometry: boolean) => DomainType[];
  }>();

  constructor(
    userElo: number,
    excludeGeometry: boolean = false,
    targetTotal: number = 20
  ) {
    this.userElo = userElo;
    this.excludeGeometry = excludeGeometry;
    this.diversityTracker = new DiversityTracker();
    this.targetTotal = targetTotal;
    
    // Initialize all generators
    this.generators.set('CP', new CPGenerator());
    this.generators.set('CE1', new CE1Generator());
    this.generators.set('CE2', new CE2Generator());
    this.generators.set('CM1', new CM1Generator());
    this.generators.set('CM2', new CM2Generator());
    this.generators.set('6eme', new SixiemeGenerator());
    this.generators.set('5eme', new CinquiemeGenerator());
    this.generators.set('4eme', new QuatriemeGenerator());
    this.generators.set('3eme', new TroisiemeGenerator());
    this.generators.set('2nde', new SecondeGenerator());
    this.generators.set('1ere', new PremiereGenerator());
    this.generators.set('Terminale', new TerminaleGenerator());
    this.generators.set('Pro', new ProLicenceGenerator());
  }

  /**
   * Generate the next question adaptively
   * - Selects level based on 60/30/10 rule
   * - Ensures domain diversity
   * - Avoids recent question repetition
   */
  generateNext(): GeneratedQuestion {
    // Select adaptive level (60% current, 30% +1, 10% -1)
    const targetLevel = selectAdaptiveLevel(this.userElo);
    
    // Get generator for selected level
    const generator = this.generators.get(targetLevel);
    if (!generator) {
      throw new Error(`No generator found for level: ${targetLevel}`);
    }

    // Try up to 10 times to generate a diverse question
    let question: GeneratedQuestion | null = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Create generation context
      const context: GenerationContext = {
        userElo: this.userElo,
        excludeGeometry: this.excludeGeometry,
        recentQuestionHashes: this.recentHashes,
        questionCount: this.targetTotal,
      };

      // Generate question
      const candidate = generator.generate(context);

      // Check diversity (can we use this domain?)
      if (this.diversityTracker.canUse(candidate.domain, this.targetTotal)) {
        // Check for repetition
        if (!this.recentHashes.includes(candidate.id)) {
          question = candidate;
          
          // Record this question
          this.diversityTracker.record(candidate.domain);
          this.recentHashes.push(candidate.id);
          if (this.recentHashes.length > 30) {
            this.recentHashes.shift();
          }
          
          this.questionCount++;
          break;
        }
      }

      attempts++;
    }

    // If we couldn't find a diverse question, just return the last candidate
    if (!question) {
      const context: GenerationContext = {
        userElo: this.userElo,
        excludeGeometry: this.excludeGeometry,
        recentQuestionHashes: this.recentHashes,
        questionCount: this.targetTotal,
      };
      question = generator.generate(context);
      this.questionCount++;
    }

    return question;
  }

  /**
   * Generate a batch of questions
   */
  generateBatch(count: number): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      questions.push(this.generateNext());
    }
    
    return questions;
  }

  /**
   * Get available domains for current user level
   */
  getAvailableDomains(): DomainType[] {
    const currentLevel = getLevelFromElo(this.userElo);
    const generator = this.generators.get(currentLevel);
    return generator?.getAvailableDomains(this.excludeGeometry) || [];
  }

  /**
   * Update user ELO (for adaptive progression during session)
   */
  updateElo(newElo: number): void {
    this.userElo = newElo;
  }

  /**
   * Get generation statistics
   */
  getStats(): {
    generatedCount: number;
    recentHashesCount: number;
    lastDomain: DomainType | undefined;
  } {
    return {
      generatedCount: this.questionCount,
      recentHashesCount: this.recentHashes.length,
      lastDomain: this.diversityTracker.getLastType(),
    };
  }
}

// ============================================================================
// Simplified API Functions
// ============================================================================

/**
 * Generate a single adaptive question
 */
export function generateAdaptiveQuestion(
  userElo: number,
  excludeGeometry: boolean = false
): GeneratedQuestion {
  const generator = new AdaptiveQuestionGenerator(userElo, excludeGeometry);
  return generator.generateNext();
}

/**
 * Generate a batch of adaptive questions
 */
export function generateAdaptiveTest(
  userElo: number,
  count: number = 20,
  excludeGeometry: boolean = false
): GeneratedQuestion[] {
  const generator = new AdaptiveQuestionGenerator(userElo, excludeGeometry, count);
  return generator.generateBatch(count);
}

/**
 * Generate evaluation test (starts low, adaptive progression)
 */
export function generateEvaluationTest(
  count: number = 20,
  excludeGeometry: boolean = false
): GeneratedQuestion[] {
  // Start with CP level for evaluation
  return generateAdaptiveTest(400, count, excludeGeometry);
}

/**
 * Get level info from ELO
 */
export function getLevelInfo(elo: number): {
  level: SchoolLevel;
  range: { min: number; max: number };
} {
  const level = getLevelFromElo(elo);
  return {
    level,
    range: ELO_LEVEL_RANGES[level],
  };
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type {
  GeneratedQuestion,
  GenerationContext,
  QuestionType,
  DomainType,
  SchoolLevel,
} from './types';

export { getLevelFromElo, ELO_LEVEL_RANGES, DiversityTracker } from './types';

// Export individual generators for advanced use
export { CPGenerator } from './cp';
export { CE1Generator } from './ce1';
export { CE2Generator } from './ce2';
export { CM1Generator } from './cm1';
export { CM2Generator } from './cm2';
export { SixiemeGenerator } from './sixieme';
export { CinquiemeGenerator } from './cinquieme';
export { QuatriemeGenerator } from './quatrieme';
export { TroisiemeGenerator } from './troisieme';
export { SecondeGenerator } from './seconde';
export { PremiereGenerator } from './premiere';
export { TerminaleGenerator } from './terminale';
export { ProLicenceGenerator } from './pro';
