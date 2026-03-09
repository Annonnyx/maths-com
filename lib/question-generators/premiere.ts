// ============================================================================
// 1ère Spé Level Question Generator (ELO 2966-3307)
// ============================================================================
// TYPES: expression, equation, functions, complex (niveau avancé)
// DOMAINE: Dérivation (polynômes), Suites (arithmétique/géométrique),
//          Trinôme (discriminant, racines)
// IMPORTANT: Respecte excludeGeometry
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class PremiereGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '1ere';
  private readonly eloRange = { min: 2966, max: 3307 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    return ['functions', 'calculation'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domains = this.getAvailableDomains(context.excludeGeometry);
    const domain = randomChoice(domains);

    switch (domain) {
      case 'functions':
        return this.generateFunctionsQuestion();
      case 'calculation':
        return this.generateCalculationQuestion();
      default:
        return this.generateFunctionsQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Functions Domain (Dérivation, Suites)
  // --------------------------------------------------------------------------

  private generateFunctionsQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateDerivative(),
      () => this.generateArithmeticSequence(),
      () => this.generateGeometricSequence(),
    ];
    return randomChoice(generators)();
  }

  private generateDerivative(): GeneratedQuestion {
    const type = randomChoice(['constant', 'linear', 'power', 'sum']);
    
    if (type === 'constant') {
      const c = randomInt(1, 10);
      return {
        id: hashQuestion(this.level, 'functions', [c]),
        type: 'expression',
        domain: 'functions',
        level: this.level,
        difficultyElo: 3000,
        question: `Dérive f(x) = ${c}`,
        answer: '0',
        explanation: `La dérivée d'une constante est 0 : f'(x) = 0`,
        timeEstimate: 15
      };
    } else if (type === 'linear') {
      const a = randomInt(1, 10);
      const b = randomInt(1, 10);
      return {
        id: hashQuestion(this.level, 'functions', [a, b]),
        type: 'expression',
        domain: 'functions',
        level: this.level,
        difficultyElo: 3050,
        question: `Dérive f(x) = ${a}x + ${b}`,
        answer: a.toString(),
        explanation: `f'(x) = ${a} (dérivée de ax+b est a)`,
        timeEstimate: 20
      };
    } else if (type === 'power') {
      const n = randomInt(2, 5);
      const a = randomInt(1, 5);
      return {
        id: hashQuestion(this.level, 'functions', [a, n]),
        type: 'expression',
        domain: 'functions',
        level: this.level,
        difficultyElo: 3150,
        question: `Dérive f(x) = ${a}x^${n}`,
        answer: `${a*n}x^${n-1}`,
        acceptableAnswers: [`${a*n}x^${n-1}`, `${a*n}x^${n - 1}`, `${a * n}x^${n-1}`],
        explanation: `f'(x) = ${a}×${n}x^${n-1} = ${a*n}x^${n-1} (formule (x^n)' = nx^(n-1))`,
        timeEstimate: 30
      };
    } else {
      // sum
      const a = randomInt(1, 5);
      const b = randomInt(1, 5);
      return {
        id: hashQuestion(this.level, 'functions', [a, b]),
        type: 'expression',
        domain: 'functions',
        level: this.level,
        difficultyElo: 3220,
        question: `Dérive f(x) = ${a}x² + ${b}x`,
        answer: `${2*a}x + ${b}`,
        explanation: `f'(x) = ${2*a}x + ${b} (dérivée terme à terme)`,
        timeEstimate: 40
      };
    }
  }

  private generateArithmeticSequence(): GeneratedQuestion {
    const u0 = randomInt(1, 10);
    const r = randomInt(2, 8);
    const n = randomInt(5, 15);
    const un = u0 + n * r;
    
    return {
      id: hashQuestion(this.level, 'functions', [u0, r, n]),
      type: 'numeric',
      domain: 'functions',
      level: this.level,
      difficultyElo: 3100,
      question: `Suite arithmétique avec u₀=${u0} et r=${r}. Calcule u${n}`,
      answer: un.toString(),
      explanation: `u${n} = u₀ + ${n}×r = ${u0} + ${n}×${r} = ${u0} + ${n*r} = ${un}`,
      timeEstimate: 40
    };
  }

  private generateGeometricSequence(): GeneratedQuestion {
    const u0 = randomInt(1, 5);
    const q = randomChoice([2, 3, 4]);
    const n = randomInt(3, 6);
    const un = u0 * Math.pow(q, n);
    
    return {
      id: hashQuestion(this.level, 'functions', [u0, q, n]),
      type: 'numeric',
      domain: 'functions',
      level: this.level,
      difficultyElo: 3200,
      question: `Suite géométrique avec u₀=${u0} et q=${q}. Calcule u${n}`,
      answer: un.toString(),
      explanation: `u${n} = u₀ × q^${n} = ${u0} × ${q}^${n} = ${u0} × ${Math.pow(q, n)} = ${un}`,
      timeEstimate: 50
    };
  }

  // --------------------------------------------------------------------------
  // Calculation Domain (Trinôme)
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    return this.generateDiscriminant();
  }

  private generateDiscriminant(): GeneratedQuestion {
    // ax² + bx + c = 0
    const a = randomInt(1, 4);
    const root1 = randomInt(-5, 5);
    const root2 = randomInt(-5, 5);
    const b = -a * (root1 + root2);
    const c = a * root1 * root2;
    const delta = b * b - 4 * a * c;
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b, c]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 3250,
      question: `Pour ${a}x² + ${b}x + ${c} = 0, calcule Δ (discriminant)`,
      answer: delta.toString(),
      explanation: `Δ = b² - 4ac = ${b}² - 4×${a}×${c} = ${b*b} - ${4*a*c} = ${delta}`,
      timeEstimate: 60
    };
  }
}
