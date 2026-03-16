// ============================================================================
// Terminale Spé Level Question Generator (ELO 3308-3649)
// ============================================================================
// TYPES: expression, equation, functions, complex
// DOMAINE: Intégration (primitives), Log/Exp, Limites de suites/fonctions
// TERMINALE EXPERT (3308-3649): Nombres complexes, Matrices, Graphes
// IMPORTANT: Respecte excludeGeometry
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class TerminaleGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = 'Terminale';
  private readonly eloRange = { min: 3308, max: 3649 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    return ['functions', 'calculation', 'complex'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domains = this.getAvailableDomains(context.excludeGeometry);
    const domain = randomChoice(domains);

    switch (domain) {
      case 'functions':
        return this.generateFunctionsQuestion();
      case 'calculation':
        return this.generateCalculationQuestion();
      case 'complex':
        return this.generateComplexQuestion();
      default:
        return this.generateFunctionsQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Functions Domain (Intégration, Limites)
  // --------------------------------------------------------------------------

  private generateFunctionsQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generatePrimitive(),
      () => this.generateLimit(),
      () => this.generateExpLogEquation(),
    ];
    return randomChoice(generators)();
  }

  private generatePrimitive(): GeneratedQuestion {
    const n = randomInt(2, 5);
    const a = randomInt(1, 5);
    
    return {
      id: hashQuestion(this.level, 'functions', [a, n]),
      type: 'expression',
      domain: 'functions',
      level: this.level,
      difficultyElo: 3350,
      question: `Trouve une primitive de f(x) = ${a}x^${n}`,
      answer: `${a/(n+1)}x^${n+1}`,
      acceptableAnswers: [`${a/(n+1)}x^${n+1}`, `F(x)=${a/(n+1)}x^${n+1}`],
      explanation: `Une primitive de x^n est x^(n+1)/(n+1). Donc F(x) = ${a}x^${n+1}/${n+1} = ${a/(n+1)}x^${n+1}`,
      timeEstimate: 50
    };
  }

  private generateLimit(): GeneratedQuestion {
    const type = randomChoice(['sequence', 'rational', 'exp']);
    
    if (type === 'sequence') {
      return {
        id: hashQuestion(this.level, 'functions', [1]),
        type: 'mcq',
        domain: 'functions',
        level: this.level,
        difficultyElo: 3400,
        question: `Limite de la suite u_n = 1/n quand n → +∞`,
        answer: '0',
        options: shuffleArray(['0', '1', '+∞', '-∞', "n'existe pas"]),
        explanation: `Quand n devient très grand, 1/n devient très petit. La limite est 0.`,
        timeEstimate: 30
      };
    } else if (type === 'rational') {
      const degNum = randomInt(2, 4);
      const degDen = randomInt(2, 4);
      const answer = degNum > degDen ? '+∞' : degNum < degDen ? '0' : 'coefficient dominant';
      
      return {
        id: hashQuestion(this.level, 'functions', [degNum, degDen]),
        type: 'mcq',
        domain: 'functions',
        level: this.level,
        difficultyElo: 3480,
        question: `Limite en +∞ d'un quotient de polynômes (degré numérateur ${degNum}, dénominateur ${degDen})`,
        answer,
        options: shuffleArray(['0', '1', '+∞', '-∞', 'coefficient dominant']),
        explanation: `Si deg(num) > deg(den) → ±∞, si deg(num) < deg(den) → 0, si égal → ratio des coefficients dominants`,
        timeEstimate: 45
      };
    } else {
      return {
        id: hashQuestion(this.level, 'functions', [2]),
        type: 'mcq',
        domain: 'functions',
        level: this.level,
        difficultyElo: 3450,
        question: `Limite de e^x quand x → +∞`,
        answer: '+∞',
        options: shuffleArray(['0', '1', '+∞', '-∞']),
        explanation: `La fonction exponentielle tend vers +∞ quand x → +∞`,
        timeEstimate: 20
      };
    }
  }

  private generateExpLogEquation(): GeneratedQuestion {
    const type = randomChoice(['exp', 'log']);
    
    if (type === 'exp') {
      const k = randomInt(1, 10);
      return {
        id: hashQuestion(this.level, 'functions', [k]),
        type: 'expression',
        domain: 'functions',
        level: this.level,
        difficultyElo: 3380,
        question: `Résous : e^x = ${k}`,
        answer: `ln(${k})`,
        acceptableAnswers: [`ln(${k})`, `ln ${k}`, Math.log(k).toFixed(2)],
        explanation: `Si e^x = ${k}, alors x = ln(${k}) ≈ ${Math.log(k).toFixed(2)}`,
        timeEstimate: 30
      };
    } else {
      const k = randomInt(1, 5);
      return {
        id: hashQuestion(this.level, 'functions', [k]),
        type: 'numeric',
        domain: 'functions',
        level: this.level,
        difficultyElo: 3420,
        question: `Résous : ln(x) = ${k}`,
        answer: Math.exp(k).toFixed(2),
        acceptableAnswers: [Math.exp(k).toFixed(2), Math.exp(k).toFixed(2).replace('.', ','), `e^${k}`],
        explanation: `Si ln(x) = ${k}, alors x = e^${k} ≈ ${Math.exp(k).toFixed(2)}`,
        timeEstimate: 30
      };
    }
  }

  // --------------------------------------------------------------------------
  // Calculation Domain (Géométrie repérée, Arithmétique avancée)
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    return this.generateSumArithmeticSequence();
  }

  private generateSumArithmeticSequence(): GeneratedQuestion {
    const u0 = randomInt(1, 10);
    const r = randomInt(2, 5);
    const n = randomInt(5, 10);
    const sum = (n + 1) * (2 * u0 + n * r) / 2;
    
    return {
      id: hashQuestion(this.level, 'calculation', [u0, r, n]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 3500,
      question: `Calcule la somme S = u₀ + u₁ + ... + u${n} pour une suite arithmétique avec u₀=${u0} et r=${r}`,
      answer: sum.toString(),
      explanation: `S = (n+1)(u₀ + un)/2 = ${n+1}×(${u0} + ${u0 + n*r})/2 = ${n+1}×${(2*u0 + n*r)/2} = ${sum}`,
      timeEstimate: 70
    };
  }

  // --------------------------------------------------------------------------
  // Complex Domain (Nombres complexes - spécialité)
  // --------------------------------------------------------------------------

  private generateComplexQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateComplexModule(),
      () => this.generateComplexEquation(),
    ];
    return randomChoice(generators)();
  }

  private generateComplexModule(): GeneratedQuestion {
    const a = randomInt(1, 5);
    const b = randomInt(1, 5);
    const module = Math.round(Math.sqrt(a * a + b * b) * 100) / 100;
    
    return {
      id: hashQuestion(this.level, 'complex', [a, b]),
      type: 'numeric',
      domain: 'complex',
      level: this.level,
      difficultyElo: 3580,
      question: `Module de z = ${a} + ${b}i`,
      answer: module.toFixed(2).replace('.', ','),
      acceptableAnswers: [module.toFixed(2), module.toFixed(2).replace('.', ','), `√${a*a+b*b}`],
      explanation: `|z| = √(${a}² + ${b}²) = √(${a*a} + ${b*b}) = √${a*a + b*b} ≈ ${module.toFixed(2).replace('.', ',')}`,
      timeEstimate: 50
    };
  }

  private generateComplexEquation(): GeneratedQuestion {
    // z² + z + 1 = 0 avec discriminant négatif
    const discriminant = -3;
    const realPart = -0.5;
    const imagPart = Math.sqrt(3) / 2;
    
    return {
      id: hashQuestion(this.level, 'complex', [1, 1, 1]),
      type: 'expression',
      domain: 'complex',
      level: this.level,
      difficultyElo: 3620,
      question: `Résous dans ℂ : z² + z + 1 = 0`,
      answer: '(-1 ± i√3)/2',
      acceptableAnswers: ['(-1+i√3)/2', '(-1-i√3)/2', '-0.5 ± 0.87i'],
      explanation: `Δ = 1 - 4 = -3. Les solutions sont (-1 ± i√3)/2 ≈ -0.5 ± 0.87i`,
      timeEstimate: 90
    };
  }
}
