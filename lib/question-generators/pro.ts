// ============================================================================
// Pro/Licence Level Question Generator (ELO 3650-4000)
// ============================================================================
// TYPES: expression, equation, complex, mcq
// DOMAINE: Analyse (suites de fonctions, DL, EDO), Algèbre linéaire (espaces,
//          diagonalisation), Probabilités (Poisson, TCL), Analyse multivariable
// IMPORTANT: Respecte excludeGeometry
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class ProLicenceGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = 'Pro';
  private readonly eloRange = { min: 3650, max: 4000 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    return ['calculation', 'complex', 'functions'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domains = this.getAvailableDomains(context.excludeGeometry);
    const domain = randomChoice(domains);

    switch (domain) {
      case 'calculation':
        return this.generateCalculationQuestion();
      case 'complex':
        return this.generateComplexQuestion();
      case 'functions':
        return this.generateFunctionsQuestion();
      default:
        return this.generateCalculationQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Calculation Domain (EDO, Proba avancée)
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateEDO2(),
      () => this.generatePoissonProbability(),
      () => this.generatePartialDerivative(),
    ];
    return randomChoice(generators)();
  }

  private generateEDO2(): GeneratedQuestion {
    // EDO d'ordre 2 : ay'' + by' + cy = 0
    // Discriminant caractéristique r² + (b/a)r + (c/a) = 0
    const a = 1;
    const b = randomInt(2, 5);
    const c = randomInt(1, 4);
    const discriminant = b * b - 4 * a * c;
    
    let answer: string;
    let explanation: string;
    
    if (discriminant > 0) {
      const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      answer = `e^(${r1.toFixed(1)}x), e^(${r2.toFixed(1)}x)`;
      explanation = `Discriminant ${discriminant} > 0. Racines réelles distinctes : r₁=${r1.toFixed(1)}, r₂=${r2.toFixed(1)}`;
    } else if (discriminant === 0) {
      const r = -b / (2 * a);
      answer = `e^(${r}x), xe^(${r}x)`;
      explanation = `Discriminant = 0. Racine double : r=${r}`;
    } else {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      answer = `e^(${realPart}x)cos(${imagPart.toFixed(1)}x), e^(${realPart}x)sin(${imagPart.toFixed(1)}x)`;
      explanation = `Discriminant ${discriminant} < 0. Parties réelle=${realPart}, imaginaire=${imagPart.toFixed(1)}`;
    }
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b, c]),
      type: 'expression',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 3750,
      question: `Solutions de y'' + ${b}y' + ${c}y = 0`,
      answer,
      explanation,
      timeEstimate: 120
    };
  }

  private generatePoissonProbability(): GeneratedQuestion {
    const lambda = randomChoice([1, 2, 3, 5]);
    const k = randomInt(0, 4);
    const prob = Math.round(Math.exp(-lambda) * Math.pow(lambda, k) / this.factorial(k) * 1000) / 1000;
    
    return {
      id: hashQuestion(this.level, 'calculation', [lambda, k]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 3800,
      question: `Loi de Poisson(λ=${lambda}). Calcule P(X=${k})`,
      answer: prob.toFixed(3),
      acceptableAnswers: [prob.toFixed(3), prob.toFixed(3).replace('.', ',')],
      explanation: `P(X=${k}) = e^(-${lambda}) × ${lambda}^${k} / ${k}! = ${prob.toFixed(3)}`,
      timeEstimate: 90
    };
  }

  private factorial(n: number): number {
    return n <= 1 ? 1 : n * this.factorial(n - 1);
  }

  private generatePartialDerivative(): GeneratedQuestion {
    const a = randomInt(1, 4);
    const b = randomInt(1, 4);
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'expression',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 3900,
      question: `Soit f(x,y) = ${a}x²y + ${b}xy². Calcule ∂f/∂x`,
      answer: `${2*a}xy + ${b}y²`,
      explanation: `∂f/∂x = ${2*a}xy + ${b}y² (dérivée partielle par rapport à x, y constant)`,
      timeEstimate: 60
    };
  }

  // --------------------------------------------------------------------------
  // Complex Domain (Algèbre linéaire)
  // --------------------------------------------------------------------------

  private generateComplexQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateMatrixProduct(),
      () => this.generateDeterminant2x2(),
    ];
    return randomChoice(generators)();
  }

  private generateMatrixProduct(): GeneratedQuestion {
    const a = randomInt(1, 4);
    const b = randomInt(1, 4);
    const c = randomInt(1, 4);
    const d = randomInt(1, 4);
    const e = randomInt(1, 4);
    const f = randomInt(1, 4);
    const g = randomInt(1, 4);
    const h = randomInt(1, 4);
    
    // A × B = C (2x2 matrices)
    const c11 = a * e + b * g;
    const c12 = a * f + b * h;
    const c21 = c * e + d * g;
    const c22 = c * f + d * h;
    
    return {
      id: hashQuestion(this.level, 'complex', [a, b, c, d]),
      type: 'expression',
      domain: 'complex',
      level: this.level,
      difficultyElo: 3850,
      question: `Produit de matrices [[${a},${b}],[${c},${d}]] × [[${e},${f}],[${g},${h}]]`,
      answer: `[[${c11},${c12}],[${c21},${c22}]]`,
      explanation: `Multiplication matricielle : c₁₁=${a}×${e}+${b}×${g}=${c11}, etc.`,
      timeEstimate: 100
    };
  }

  private generateDeterminant2x2(): GeneratedQuestion {
    const a = randomInt(1, 6);
    const b = randomInt(1, 6);
    const c = randomInt(1, 6);
    const d = randomInt(1, 6);
    const det = a * d - b * c;
    
    return {
      id: hashQuestion(this.level, 'complex', [a, b, c, d]),
      type: 'numeric',
      domain: 'complex',
      level: this.level,
      difficultyElo: 3700,
      question: `Déterminant de [[${a},${b}],[${c},${d}]]`,
      answer: det.toString(),
      explanation: `det = ad - bc = ${a}×${d} - ${b}×${c} = ${a*d} - ${b*c} = ${det}`,
      timeEstimate: 40
    };
  }

  // --------------------------------------------------------------------------
  // Functions Domain (Analyse avancée)
  // --------------------------------------------------------------------------

  private generateFunctionsQuestion(): GeneratedQuestion {
    return this.generateDL();
  }

  private generateDL(): GeneratedQuestion {
    // DL de e^x, sin(x), cos(x), ln(1+x) en 0
    const funcs = [
      { name: 'e^x', terms: '1 + x + x²/2 + ...' },
      { name: 'sin(x)', terms: 'x - x³/6 + ...' },
      { name: 'cos(x)', terms: '1 - x²/2 + ...' },
      { name: 'ln(1+x)', terms: 'x - x²/2 + ...' },
    ];
    
    const { name, terms } = randomChoice(funcs);
    
    return {
      id: hashQuestion(this.level, 'functions', [funcs.findIndex(f => f.name === name)]),      type: 'mcq',
      domain: 'functions',
      level: this.level,
      difficultyElo: 3950,
      question: `DL à l'ordre 2 de ${name} en 0`,
      answer: terms,
      options: funcs.map(f => f.terms),
      explanation: `Le développement limité de ${name} autour de 0 est ${terms}`,
      timeEstimate: 60
    };
  }
}
