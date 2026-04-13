// ============================================================================
// 2DE.TS — Générateur niveau Seconde (ELO 2150-2399)
// ============================================================================
// DOMAINES : Delta (discriminant), Fonctions, Suites, Probabilités, 
//            Géométrie plane, Équations
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class SecondeGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '2de';
  private readonly eloRange = { min: 2150, max: 2399 };

  getEloRange() { return this.eloRange; }

  getAvailableDomains(): DomainType[] {
    return ['algebra', 'functions', 'calculation', 'statistics', 'geometry'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domain = randomChoice(this.getAvailableDomains());
    switch (domain) {
      case 'algebra':     return this.generateDelta();
      case 'functions':   return this.generateFunctions();
      case 'calculation': return this.generateArithmetic();
      case 'statistics':  return this.generateProbability();
      case 'geometry':    return this.generateGeometry();
      default:            return this.generateDelta();
    }
  }

  // ── Delta (discriminant) ──────────────────────────────────────────────

  private generateDelta(): GeneratedQuestion {
    // Générer à rebours : choisir deux racines entières, reconstruire le polynôme
    const r1 = randomInt(-10, 10);
    const r2 = randomInt(-10, 10);
    
    // Éviter les racines identiques
    if (r1 === r2) {
      return this.generateDelta();
    }

    // Reconstruire a(x-r1)(x-r2) = ax² - a(r1+r2)x + a*r1*r2
    const a = randomChoice([1, 2, 3]);
    const b = -a * (r1 + r2);
    const c = a * r1 * r2;

    const discriminant = b * b - 4 * a * c;

    return {
      id: hashQuestion(this.level, 'delta', [a, b, c]),
      type: 'delta',
      domain: 'algebra',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(0, 100),
      question: `Pour le polynôme f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}, calcule le discriminant Δ.`,
      answer: discriminant.toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userDelta = parseFloat(input);
        return !isNaN(userDelta) && Math.abs(userDelta - discriminant) < 0.01;
      }
    };
  }

  // ── Fonctions ───────────────────────────────────────────────────────

  private generateFunctions(): GeneratedQuestion {
    return randomChoice([
      () => this.generateLinearFunction(),
      () => this.generateQuadraticFunction(),
      () => this.generateDerivative(),
    ])();
  }

  private generateLinearFunction(): GeneratedQuestion {
    const a = randomInt(-5, 5);
    const b = randomInt(-10, 10);
    
    return {
      id: hashQuestion(this.level, 'functions', [a, b]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(0, 50),
      question: `Soit f(x) = ${a}x ${b >= 0 ? '+' : ''} ${b}. Calcule f(${randomInt(0, 5)}).`,
      answer: (a * randomInt(0, 5) + b).toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        const expected = a * randomInt(0, 5) + b;
        return !isNaN(userResult) && Math.abs(userResult - expected) < 0.01;
      }
    };
  }

  private generateQuadraticFunction(): GeneratedQuestion {
    const a = randomChoice([1, 2, 3]);
    const h = randomInt(-5, 5);
    const k = randomInt(-10, 10);
    const x = randomInt(-3, 3);
    
    const result = a * Math.pow(x - h, 2) + k;
    
    return {
      id: hashQuestion(this.level, 'functions', [a, h, k, x]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(50, 100),
      question: `Soit f(x) = ${a}(x ${h >= 0 ? '-' : '+'} ${Math.abs(h)})² ${k >= 0 ? '+' : ''} ${k}. Calcule f(${x}).`,
      answer: result.toFixed(1),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - result) < 0.01;
      }
    };
  }

  private generateDerivative(): GeneratedQuestion {
    const functions = [
      { expr: '3x² + 2x + 1', derivative: '6x + 2' },
      { expr: '2x³ - x² + 4', derivative: '6x² - 2x' },
      { expr: 'x⁴ - 3x', derivative: '4x³ - 3' },
      { expr: '5x² - 7x + 2', derivative: '10x - 7' }
    ];
    
    const selected = randomChoice(functions);
    
    return {
      id: hashQuestion(this.level, 'functions', [selected.derivative]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(30, 80),
      question: `Calcule la dérivée de f(x) = ${selected.expr}.`,
      answer: selected.derivative,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input.replace(/\s/g, '') === selected.derivative.replace(/\s/g, '');
      }
    };
  }

  // ── Suites ───────────────────────────────────────────────────────

  private generateSequences(): GeneratedQuestion {
    return randomChoice([
      () => this.generateArithmeticSequence(),
      () => this.generateGeometricSequence(),
    ])();
  }

  private generateArithmeticSequence(): GeneratedQuestion {
    const u0 = randomInt(1, 20);
    const r = randomInt(-5, 5);
    const n = randomInt(1, 5);
    const un = u0 + n * r;
    
    return {
      id: hashQuestion(this.level, 'sequences', [u0, r, n]),
      type: 'sequences',
      domain: 'algebra',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(0, 50),
      question: `Suite arithmétique : u₀ = ${u0}, raison = ${r}. Calcule u_${n}.`,
      answer: un.toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseInt(input);
        return !isNaN(userResult) && userResult === un;
      }
    };
  }

  private generateGeometricSequence(): GeneratedQuestion {
    const u0 = randomInt(1, 10);
    const q = randomChoice([2, 3, 4, 5, 0.5, 1/3]);
    const n = randomInt(1, 3);
    const un = u0 * Math.pow(q, n);
    
    return {
      id: hashQuestion(this.level, 'sequences', [u0, q, n]),
      type: 'sequences',
      domain: 'algebra',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(20, 70),
      question: `Suite géométrique : u₀ = ${u0}, raison = ${q}. Calcule u_${n}.`,
      answer: un.toFixed(1),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - un) < 0.05;
      }
    };
  }

  // ── Probabilités ─────────────────────────────────────────────────────

  private generateProbability(): GeneratedQuestion {
    return randomChoice([
      () => this.generateBinomialLaw(),
      () => this.generateConditionalProbability(),
    ])();
  }

  private generateBinomialLaw(): GeneratedQuestion {
    const n = randomInt(5, 15);
    const p = randomChoice([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
    const k = randomInt(0, Math.min(n, 10));
    
    // Calcul de P(X = k) = C(n,k) * p^k * (1-p)^(n-k)
    const binomialCoeff = this.binomialCoefficient(n, k);
    const probability = binomialCoeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
    
    return {
      id: hashQuestion(this.level, 'probabilities', [n, p, k]),
      type: 'probabilities',
      domain: 'statistics',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(30, 80),
      question: `X suit B(${n}, ${p}). Calcule P(X = ${k}).`,
      answer: probability.toFixed(4),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - probability) < 0.001;
      }
    };
  }

  private generateConditionalProbability(): GeneratedQuestion {
    // Tableau de contingence simple
    const a = randomInt(10, 50);
    const b = randomInt(10, 50);
    const c = randomInt(10, 50);
    const d = randomInt(10, 50);
    
    const total = a + b + c + d;
    const pA = (a + b) / total;
    const pB = (a + c) / total;
    const pAInterB = a / total;
    const pBGivenA = pAInterB / pA;
    
    return {
      id: hashQuestion(this.level, 'probabilities', [a, b, c, d]),
      type: 'probabilities',
      domain: 'statistics',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(40, 90),
      question: `Dans un tableau :\n|     | B₁   | B₂   | Total |\n| A₁ | ${a}   | ${b}   | ${a+b} |\n| A₂ | ${c}   | ${d}   | ${c+d} |\n| Total| ${a+c} | ${b+d} | ${total} |\n\nCalcule P(A₁|B₁).`,
      answer: pBGivenA.toFixed(3),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - pBGivenA) < 0.001;
      }
    };
  }

  // ── Géométrie ─────────────────────────────────────────────────────

  private generateGeometry(): GeneratedQuestion {
    return randomChoice([
      () => this.generatePythagore(),
      () => this.generateThales(),
    ])();
  }

  private generatePythagore(): GeneratedQuestion {
    const a = randomInt(3, 10);
    const b = randomInt(3, 10);
    const c = Math.sqrt(a * a + b * b);
    
    return {
      id: hashQuestion(this.level, 'geometry', [a, b]),
      type: 'geometry',
      domain: 'geometry',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(20, 60),
      question: `Dans un triangle rectangle, les côtés de l'angle droit mesurent ${a} cm et ${b} cm. Calcule la longueur de l'hypoténuse.`,
      answer: c.toFixed(1),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - c) < 0.01;
      }
    };
  }

  private generateThales(): GeneratedQuestion {
    const ab = randomInt(4, 12);
    const ac = randomInt(4, 12);
    const ad = randomInt(2, 8);
    
    // Théorème de Thalès : AD/AB = AE/AC
    const ratio = ad / ab;
    const ae = Math.round(ac * ratio);
    
    return {
      id: hashQuestion(this.level, 'geometry', [ab, ac, ad]),
      type: 'geometry',
      domain: 'geometry',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(30, 70),
      question: `Dans le triangle ABC, D est un point de [AB] tel que AD = ${ad} cm et AB = ${ab} cm. La parallèle à (BC) passant par D coupe [AC] en E. Calcule AE si AC = ${ac} cm.`,
      answer: ae.toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseInt(input);
        return !isNaN(userResult) && userResult === ae;
      }
    };
  }

  // ── Arithmétique ─────────────────────────────────────────────────────

  private generateArithmetic(): GeneratedQuestion {
    return randomChoice([
      () => this.generatePGCD(),
      () => this.generateCongruence(),
    ])();
  }

  private generatePGCD(): GeneratedQuestion {
    const a = randomInt(12, 100);
    const b = randomInt(12, 100);
    
    const pgcd = this.calculatePGCD(a, b);
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'calculation',
      domain: 'calculation',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(0, 40),
      question: `Calcule PGCD(${a}, ${b}).`,
      answer: pgcd.toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseInt(input);
        return !isNaN(userResult) && userResult === pgcd;
      }
    };
  }

  private generateCongruence(): GeneratedQuestion {
    const a = randomInt(10, 50);
    const n = randomChoice([5, 7, 8, 9, 11, 12]);
    const remainder = randomInt(0, n - 1);
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, n, remainder]),
      type: 'calculation',
      domain: 'calculation',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(20, 60),
      question: `Trouve le reste de la division de ${a} par ${n}.`,
      answer: remainder.toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseInt(input);
        return !isNaN(userResult) && userResult === remainder;
      }
    };
  }

  // ── Utilitaires ─────────────────────────────────────────────────────

  private binomialCoefficient(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - i + 1) / i;
    }
    return result;
  }

  private calculatePGCD(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
}
