// ============================================================================
// 2nde Level Question Generator (ELO 2624-2965)
// ============================================================================
// TYPES: equation, expression, functions, geometry
// DOMAINE: Fonctions de référence (x², √x, 1/x), Vecteurs, Trigonométrie cercle
// IMPORTANT: Respecte excludeGeometry - pas de vecteurs/trigo si exclu
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class SecondeGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '2nde';
  private readonly eloRange = { min: 2624, max: 2965 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    const domains: DomainType[] = ['functions'];
    if (!excludeGeometry) {
      domains.push('geometry');
    }
    return domains;
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domains = this.getAvailableDomains(context.excludeGeometry);
    const domain = randomChoice(domains);

    switch (domain) {
      case 'functions':
        return this.generateFunctionsQuestion();
      case 'geometry':
        return this.generateGeometryQuestion();
      default:
        return this.generateFunctionsQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Functions Domain (Référence : x², √x, 1/x)
  // --------------------------------------------------------------------------

  private generateFunctionsQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateSquareFunction(),
      () => this.generateSqrtFunction(),
      () => this.generateInverseFunction(),
    ];
    return randomChoice(generators)();
  }

  private generateSquareFunction(): GeneratedQuestion {
    const x = randomInt(-10, 10);
    const result = x * x;
    
    return {
      id: hashQuestion(this.level, 'functions', [x]),
      type: 'numeric',
      domain: 'functions',
      level: this.level,
      difficultyElo: 2650,
      question: `Soit f(x) = x². Calcule f(${x})`,
      answer: result.toString(),
      explanation: `f(${x}) = ${x}² = ${result}`,
      timeEstimate: 15
    };
  }

  private generateSqrtFunction(): GeneratedQuestion {
    const x = randomInt(1, 100);
    const result = Math.round(Math.sqrt(x) * 100) / 100;
    
    return {
      id: hashQuestion(this.level, 'functions', [x]),
      type: 'numeric',
      domain: 'functions',
      level: this.level,
      difficultyElo: 2750,
      question: `Soit f(x) = √x. Calcule f(${x}) (arrondi à 0,01)`,
      answer: result.toFixed(2).replace('.', ','),
      acceptableAnswers: [result.toFixed(2), result.toFixed(2).replace('.', ',')],
      explanation: `f(${x}) = √${x} ≈ ${result.toFixed(2).replace('.', ',')}`,
      timeEstimate: 30
    };
  }

  private generateInverseFunction(): GeneratedQuestion {
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    const x = randomChoice(values);
    const result = Math.round(100 / x) / 100;
    
    return {
      id: hashQuestion(this.level, 'functions', [x]),
      type: 'expression',
      domain: 'functions',
      level: this.level,
      difficultyElo: 2850,
      question: `Soit f(x) = 1/x. Calcule f(${x})`,
      answer: `1/${x}`,
      acceptableAnswers: [`1/${x}`, (1/x).toFixed(3)],
      explanation: `f(${x}) = 1/${x} ≈ ${(1/x).toFixed(3)}`,
      timeEstimate: 20
    };
  }

  // --------------------------------------------------------------------------
  // Geometry Domain (Vecteurs, Trigo cercle)
  // --------------------------------------------------------------------------

  private generateGeometryQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateVectorAddition(),
      () => this.generateVectorNorm(),
      () => this.generateTrigoCircle(),
    ];
    return randomChoice(generators)();
  }

  private generateVectorAddition(): GeneratedQuestion {
    const x1 = randomInt(-5, 5);
    const y1 = randomInt(-5, 5);
    const x2 = randomInt(-5, 5);
    const y2 = randomInt(-5, 5);
    const rx = x1 + x2;
    const ry = y1 + y2;
    
    return {
      id: hashQuestion(this.level, 'geometry', [x1, y1, x2, y2]),
      type: 'expression',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 2780,
      question: `Soit u(${x1}; ${y1}) et v(${x2}; ${y2}). Calcule u + v`,
      answer: `(${rx}; ${ry})`,
      acceptableAnswers: [`(${rx}, ${ry})`, `${rx};${ry}`, `${rx},${ry}`],
      explanation: `u + v = (${x1}+${x2}; ${y1}+${y2}) = (${rx}; ${ry})`,
      timeEstimate: 40
    };
  }

  private generateVectorNorm(): GeneratedQuestion {
    const x = randomInt(3, 8);
    const y = randomInt(3, 8);
    const norm = Math.round(Math.sqrt(x * x + y * y) * 100) / 100;
    
    return {
      id: hashQuestion(this.level, 'geometry', [x, y]),
      type: 'numeric',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 2920,
      question: `Soit u(${x}; ${y}). Calcule ||u|| (norme)`,
      answer: norm.toFixed(2).replace('.', ','),
      acceptableAnswers: [norm.toFixed(2), norm.toFixed(2).replace('.', ',')],
      explanation: `||u|| = √(${x}² + ${y}²) = √(${x*x} + ${y*y}) = √${x*x + y*y} ≈ ${norm.toFixed(2).replace('.', ',')}`,
      timeEstimate: 50
    };
  }

  private generateTrigoCircle(): GeneratedQuestion {
    const angles = [
      { deg: 0, sin: '0', cos: '1' },
      { deg: 30, sin: '1/2', cos: '√3/2' },
      { deg: 45, sin: '√2/2', cos: '√2/2' },
      { deg: 60, sin: '√3/2', cos: '1/2' },
      { deg: 90, sin: '1', cos: '0' },
    ];
    
    const { deg, sin, cos } = randomChoice(angles);
    const func = randomChoice(['sin', 'cos']);
    const answer = func === 'sin' ? sin : cos;
    
    return {
      id: hashQuestion(this.level, 'geometry', [deg]),
      type: 'mcq',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 2900,
      question: `Sur le cercle trigonométrique, ${func}(${deg}°) = ?`,
      answer,
      options: shuffleArray(['0', '1/2', '√2/2', '√3/2', '1']),
      explanation: `Valeurs exactes sur le cercle trigonométrique pour ${deg}°`,
      timeEstimate: 35
    };
  }
}
