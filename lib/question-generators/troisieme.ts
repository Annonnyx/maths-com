// ============================================================================
// 3ème Level Question Generator (ELO 2282-2623)
// ============================================================================
// TYPES: equation, expression, functions
// DOMAINE: Systèmes d'équations (2x2), Fonctions affines, Racines carrées
// IMPORTANT: Respecte excludeGeometry
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class TroisiemeGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '3eme';
  private readonly eloRange = { min: 2282, max: 2623 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    return ['algebra', 'functions', 'calculation'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domains = this.getAvailableDomains(context.excludeGeometry);
    const domain = randomChoice(domains);

    switch (domain) {
      case 'algebra':
        return this.generateAlgebraQuestion();
      case 'functions':
        return this.generateFunctionsQuestion();
      case 'calculation':
        return this.generateCalculationQuestion();
      default:
        return this.generateAlgebraQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Algebra Domain (Systèmes 2x2)
  // --------------------------------------------------------------------------

  private generateAlgebraQuestion(): GeneratedQuestion {
    return this.generateSystemEquations();
  }

  private generateSystemEquations(): GeneratedQuestion {
    // Système : ax + by = c, dx + ey = f
    // Coefficients simples : a,b,d,e ∈ [-4..4], c,f ∈ [-20..20]
    const x = randomInt(-5, 5);
    const y = randomInt(-5, 5);
    
    const a = randomChoice([1, 2, 3, -1, -2]);
    const b = randomChoice([1, 2, -1, -2]);
    const c = a * x + b * y;
    
    const d = randomChoice([1, 2, -1, -2]);
    const e = randomChoice([1, 2, 3, -1, -2]);
    const f = d * x + e * y;
    
    const signB = b >= 0 ? '+' : '';
    const signE = e >= 0 ? '+' : '';
    
    return {
      id: hashQuestion(this.level, 'algebra', [a, b, c, d, e, f]),
      type: 'expression',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 2400,
      question: `Résous le système :\n${a}x ${signB} ${b}y = ${c}\n${d}x ${signE} ${e}y = ${f}`,
      answer: `(${x}; ${y})`,
      acceptableAnswers: [`(${x}, ${y})`, `x=${x}, y=${y}`, `${x},${y}`],
      explanation: `Par substitution ou combinaison : x = ${x} et y = ${y}. Vérif : ${a}×${x}${signB}${b}×${y} = ${c}, ${d}×${x}${signE}${e}×${y} = ${f}`,
      timeEstimate: 120
    };
  }

  // --------------------------------------------------------------------------
  // Functions Domain (Fonctions affines)
  // --------------------------------------------------------------------------

  private generateFunctionsQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateAffineFunctionValue(),
      () => this.generateFindAffineFromPoints(),
    ];
    return randomChoice(generators)();
  }

  private generateAffineFunctionValue(): GeneratedQuestion {
    const a = randomInt(-3, 4);
    const b = randomInt(-10, 10);
    const x = randomInt(-5, 5);
    const result = a * x + b;
    
    return {
      id: hashQuestion(this.level, 'functions', [a, b, x]),
      type: 'numeric',
      domain: 'functions',
      level: this.level,
      difficultyElo: 2320,
      question: `Soit f(x) = ${a}x + ${b}. Calcule f(${x})`,
      answer: result.toString(),
      explanation: `f(${x}) = ${a}×${x} + ${b} = ${a * x} + ${b} = ${result}`,
      timeEstimate: 35
    };
  }

  private generateFindAffineFromPoints(): GeneratedQuestion {
    const a = randomInt(-3, 4);
    const b = randomInt(-10, 10);
    const x1 = randomInt(-3, 3);
    const x2 = x1 + randomInt(2, 4);
    const y1 = a * x1 + b;
    const y2 = a * x2 + b;
    
    return {
      id: hashQuestion(this.level, 'functions', [x1, y1, x2, y2]),
      type: 'expression',
      domain: 'functions',
      level: this.level,
      difficultyElo: 2500,
      question: `Trouve f(x) = ax + b sachant que f(${x1}) = ${y1} et f(${x2}) = ${y2}`,
      answer: `${a}x + ${b}`,
      acceptableAnswers: [`${a}x+${b}`, `f(x)=${a}x+${b}`, `${a}x + ${b}`],
      explanation: `a = (${y2}-${y1})/(${x2}-${x1}) = ${y2-y1}/${x2-x1} = ${a}. Puis b = ${y1} - ${a}×${x1} = ${b}. Donc f(x) = ${a}x + ${b}`,
      timeEstimate: 90
    };
  }

  // --------------------------------------------------------------------------
  // Calculation Domain (Racines carrées)
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateSquareRootSimplify(),
      () => this.generateSquareRootEquation(),
    ];
    return randomChoice(generators)();
  }

  private generateSquareRootSimplify(): GeneratedQuestion {
    const a = randomInt(1, 20);
    const result = a; // √(a²) = a
    
    return {
      id: hashQuestion(this.level, 'calculation', [a]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 2350,
      question: `Simplifie : √(${a}²)`,
      answer: result.toString(),
      explanation: `√(${a}²) = ${a} car la racine carrée d'un carré parfait donne la valeur absolue`,
      timeEstimate: 20
    };
  }

  private generateSquareRootEquation(): GeneratedQuestion {
    const x = randomInt(2, 15);
    const underRoot = x * x;
    
    return {
      id: hashQuestion(this.level, 'calculation', [x]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 2550,
      question: `Résous : √x = ${x}`,
      answer: underRoot.toString(),
      explanation: `Si √x = ${x}, alors x = ${x}² = ${underRoot}`,
      timeEstimate: 30
    };
  }
}
