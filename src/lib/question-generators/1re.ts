// ============================================================================
// 1RE.TS — Générateur niveau Première (ELO 2400-2649)
// ============================================================================
// DOMAINES : Suites arithmétiques et géométriques, Probabilités (renforcement),
//            Fonctions (dérivées, extremums, tableau de variation),
//            Exponentielle et logarithme, Géométrie plane
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class PremiereGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '1re';
  private readonly eloRange = { min: 2400, max: 2649 };

  getEloRange() { return this.eloRange; }

  getAvailableDomains(): DomainType[] {
    return ['algebra', 'functions', 'calculation', 'statistics', 'geometry'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domain = randomChoice(this.getAvailableDomains());
    switch (domain) {
      case 'algebra':     return this.generateSequences();
      case 'functions':   return this.generateFunctions();
      case 'calculation': return this.generateArithmetic();
      case 'statistics':  return this.generateProbability();
      case 'geometry':    return this.generateGeometry();
      default:            return this.generateSequences();
    }
  }

  // ── Suites arithmétiques et géométriques ──────────────────────────────────────────────

  private generateSequences(): GeneratedQuestion {
    const sequenceTypes = ['reason', 'term', 'u0_from_un', 'sum'];
    const selectedType = randomChoice(sequenceTypes);
    
    switch (selectedType) {
      case 'reason': return this.generateSequenceReason();
      case 'term': return this.generateSequenceTerm();
      case 'u0_from_un': return this.generateSequenceU0FromUn();
      case 'sum': return this.generateSequenceSum();
      default: return this.generateSequenceReason();
    }
  }

  private generateSequenceReason(): GeneratedQuestion {
    const isArithmetic = randomChoice([true, false]);
    
    if (isArithmetic) {
      const u0 = randomInt(1, 50);
      const u3 = randomInt(10, 100);
      const r = Math.round((u3 - u0) / 3);
      
      return {
        id: hashQuestion(this.level, 'sequences', ['arith_reason', u0, u3, r]),
        type: 'sequences',
        domain: 'algebra',
        level: this.level,
        difficultyElo: this.eloRange.min + randomInt(0, 100),
        question: `Suite arithmétique : u₀ = ${u0}, u₃ = ${u3}. Quelle est la raison ?`,
        answer: r.toString(),
        validate: (userInput: string | string[]) => {
          const input = Array.isArray(userInput) ? userInput[0] : userInput;
          const userResult = parseInt(input);
          return !isNaN(userResult) && userResult === r;
        }
      };
    } else {
      // Géométrique
      const u0 = randomInt(2, 20);
      const u3 = randomInt(5, 200);
      const q = Math.round(Math.pow(u3 / u0, 1/3));
      
      return {
        id: hashQuestion(this.level, 'sequences', ['geo_reason', u0, u3, q]),
        type: 'sequences',
        domain: 'algebra',
        level: this.level,
        difficultyElo: this.eloRange.min + randomInt(50, 150),
        question: `Suite géométrique : u₀ = ${u0}, u₃ = ${u3}. Quelle est la raison ?`,
        answer: q.toFixed(1),
        validate: (userInput: string | string[]) => {
          const input = Array.isArray(userInput) ? userInput[0] : userInput;
          const userResult = parseFloat(input);
          return !isNaN(userResult) && Math.abs(userResult - q) < 0.05;
        }
      };
    }
  }

  private generateSequenceTerm(): GeneratedQuestion {
    const isArithmetic = randomChoice([true, false]);
    const n = randomInt(1, 10);
    
    if (isArithmetic) {
      const r = randomInt(-10, 10);
      const u0 = randomInt(1, 100);
      const un = u0 + n * r;
      
      return {
        id: hashQuestion(this.level, 'sequences', ['arith_term', r, n, u0]),
        type: 'sequences',
        domain: 'algebra',
        level: this.level,
        difficultyElo: this.eloRange.min + randomInt(30, 120),
        question: `Suite arithmétique de raison r, u₀ = ${u0}. Calcule u_${n}.`,
        answer: un.toString(),
        validate: (userInput: string | string[]) => {
          const input = Array.isArray(userInput) ? userInput[0] : userInput;
          const userResult = parseInt(input);
          return !isNaN(userResult) && userResult === un;
        }
      };
    } else {
      // Géométrique
      const q = randomChoice([2, 3, 4, 5, 0.5, 1/3]);
      const u0 = randomInt(1, 50);
      const un = u0 * Math.pow(q, n);
      
      return {
        id: hashQuestion(this.level, 'sequences', ['geo_term', q, n, u0]),
        type: 'sequences',
        domain: 'algebra',
        level: this.level,
        difficultyElo: this.eloRange.min + randomInt(80, 200),
        question: `Suite géométrique de raison q, u₀ = ${u0}. Calcule u_${n}.`,
        answer: un.toFixed(1),
        validate: (userInput: string | string[]) => {
          const input = Array.isArray(userInput) ? userInput[0] : userInput;
          const userResult = parseFloat(input);
          return !isNaN(userResult) && Math.abs(userResult - un) < 0.05;
        }
      };
    }
  }

  private generateSequenceU0FromUn(): GeneratedQuestion {
    const isArithmetic = randomChoice([true, false]);
    const r = isArithmetic ? randomInt(-10, 10) : randomChoice([2, 3, 4, 5, 0.5, 1/3]);
    const n = randomInt(1, 10);
    const un = randomInt(10, 100);
    const u0 = isArithmetic ? (un - n * r) : (un / Math.pow(r, n));
    
    return {
      id: hashQuestion(this.level, 'sequences', ['u0_from_un', isArithmetic, r, n, un, u0]),
      type: 'sequences',
      domain: 'algebra',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(40, 160),
      question: `Suite ${isArithmetic ? 'arithmétique' : 'géométrique'} de raison ${r}, u_${n} = ${un}. Calcule u₀.`,
      answer: u0.toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - u0) < 0.05;
      }
    };
  }

  private generateSequenceSum(): GeneratedQuestion {
    const isArithmetic = randomChoice([true, false]);
    const n = randomInt(3, 8);
    
    if (isArithmetic) {
      const u1 = randomInt(1, 50);
      const un = randomInt(10, 100);
      const r = (un - u1) / (n - 1);
      const sum = n * (u1 + un) / 2;
      
      return {
        id: hashQuestion(this.level, 'sequences', ['arith_sum', u1, un, n]),
        type: 'sequences',
        domain: 'algebra',
        level: this.level,
        difficultyElo: this.eloRange.min + randomInt(60, 180),
        question: `Calcule u₁ + u₂ + ... + u_${n} pour une suite arithmétique avec u₁ = ${u1}, u_${n} = ${un}.`,
        answer: sum.toString(),
        validate: (userInput: string | string[]) => {
          const input = Array.isArray(userInput) ? userInput[0] : userInput;
          const userResult = parseInt(input);
          return !isNaN(userResult) && userResult === sum;
        }
      };
    } else {
      // Géométrique
      const u0 = randomInt(1, 20);
      const q = randomChoice([2, 3, 4, 5]);
      const un = u0 * Math.pow(q, n - 1);
      const sum = u0 * (Math.pow(q, n) - 1) / (q - 1);
      
      return {
        id: hashQuestion(this.level, 'sequences', ['geo_sum', u0, q, n]),
        type: 'sequences',
        domain: 'algebra',
        level: this.level,
        difficultyElo: this.eloRange.min + randomInt(100, 250),
        question: `Calcule u₀ + u₁ + ... + u_${n-1} pour une suite géométrique avec u₀ = ${u0}, q = ${q}.`,
        answer: sum.toFixed(1),
        validate: (userInput: string | string[]) => {
          const input = Array.isArray(userInput) ? userInput[0] : userInput;
          const userResult = parseFloat(input);
          return !isNaN(userResult) && Math.abs(userResult - sum) < 0.05;
        }
      };
    }
  }

  private generateSequenceAffine(): GeneratedQuestion {
    const a = randomChoice([2, 3, 0.5]);
    const b = randomInt(-5, 5);
    const u0 = randomInt(1, 20);
    const u3 = u0 + a * (a * u0 + b) + a * (a * u0 + b) + b;
    
    return {
      id: hashQuestion(this.level, 'sequences', ['affine', a, b, u0, u3]),
      type: 'sequences',
      domain: 'algebra',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(80, 200),
      question: `u₀ = ${u0}, u_{n+1} = a*u_n + b. Calcule u₃ (a = ${a}, b = ${b}).`,
      answer: u3.toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseInt(input);
        return !isNaN(userResult) && userResult === u3;
      }
    };
  }

  // ── Probabilités (renforcement) ─────────────────────────────────────────────

  private generateProbability(): GeneratedQuestion {
    return randomChoice([
      () => this.generateBinomialLaw(),
      () => this.generateExpectation(),
      () => this.generateConditionalProbability(),
      () => this.generateProbabilityTree(),
    ])();
  }

  private generateBinomialLaw(): GeneratedQuestion {
    const n = randomInt(10, 30);
    const p = randomChoice([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
    const k = randomInt(0, Math.min(n, 15));
    
    const binomialCoeff = this.binomialCoefficient(n, k);
    const probability = binomialCoeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
    
    return {
      id: hashQuestion(this.level, 'probabilities', ['binomial', n, p, k]),
      type: 'probabilities',
      domain: 'statistics',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(100, 200),
      question: `X suit B(${n}, ${p}). Calcule P(X = ${k}).`,
      answer: probability.toFixed(4),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - probability) < 0.001;
      }
    };
  }

  private generateExpectation(): GeneratedQuestion {
    const n = randomInt(10, 50);
    const p = randomChoice([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
    
    const expectation = n * p;
    const variance = n * p * (1 - p);
    
    return {
      id: hashQuestion(this.level, 'probabilities', ['expectation', n, p]),
      type: 'probabilities',
      domain: 'statistics',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(120, 220),
      question: `X suit B(${n}, ${p}). Calcule E(X) et V(X).`,
      answer: `E(X) = ${expectation.toFixed(2)}, V(X) = ${variance.toFixed(2)}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const parts = input.split(',');
        if (parts.length !== 2) return false;
        
        const userE = parseFloat(parts[0].replace('E(X) =', '').trim());
        const userV = parseFloat(parts[1].replace('V(X) =', '').trim());
        
        return !isNaN(userE) && !isNaN(userV) && 
               Math.abs(userE - expectation) < 0.001 && 
               Math.abs(userV - variance) < 0.001;
      }
    };
  }

  private generateConditionalProbability(): GeneratedQuestion {
    // Tableau de contingence 3x3
    const table = [
      [randomInt(5, 30), randomInt(5, 30), randomInt(5, 30)],
      [randomInt(5, 30), randomInt(5, 30), randomInt(5, 30)],
      [randomInt(5, 30), randomInt(5, 30), randomInt(5, 30)]
    ];
    
    const total = table.flat().reduce((sum, val) => sum + val, 0);
    const pA = (table[0][0] + table[0][1]) / total;
    const pB = (table[0][0] + table[1][0]) / total;
    const pAInterB = table[0][0] / total;
    const pBGivenA = pAInterB / pA;
    
    return {
      id: hashQuestion(this.level, 'probabilities', ['conditional']),
      type: 'probabilities',
      domain: 'statistics',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(140, 250),
      question: `Tableau de contingence :\n│     | B₁   | B₂   | Total │\n│ A₁ │ ${table[0][0]}   │ ${table[0][1]}   │ ${table[0][0] + table[0][1]} │\n│ A₂ │ ${table[1][0]}   │ ${table[1][1]}   │ ${table[1][0] + table[1][1]} │\n│ Total│ ${table[0][0] + table[1][0]} │ ${table[0][1] + table[1][1]} │ ${total} │\n\nCalcule P(A₁|B₁).`,
      answer: pBGivenA.toFixed(3),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - pBGivenA) < 0.001;
      }
    };
  }

  private generateProbabilityTree(): GeneratedQuestion {
    // Arbre de probabilités à deux niveaux
    const p = randomChoice([0.3, 0.4, 0.5, 0.6, 0.7]);
    const q = 1 - p;
    
    const scenarios = [
      { prob: p * 0.8, desc: 'succès au premier essai' },
      { prob: p * q * 0.6, desc: 'échec puis succès' },
      { prob: p * q * 0.4, desc: 'deux échecs puis succès' }
    ];
    
    const selected = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'probabilities', ['tree', p, selected.prob]),
      type: 'probabilities',
      domain: 'statistics',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(160, 280),
      question: `Arbre de probabilités : p = ${p}. Une expérience a deux essais. Calcule ${selected.desc}.`,
      answer: selected.prob.toFixed(3),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - selected.prob) < 0.001;
      }
    };
  }

  // ── Fonctions ─────────────────────────────────────────────────────

  private generateFunctions(): GeneratedQuestion {
    return randomChoice([
      () => this.generateDerivative(),
      () => this.generateDerivativeSign(),
      () => this.generateExtremum(),
      () => this.generateTangent(),
    ])();
  }

  private generateDerivative(): GeneratedQuestion {
    const functions = [
      { expr: 'f(x) = 2x³ + 3x² - 5x + 1', derivative: 'f\'(x) = 6x² + 6x - 5' },
      { expr: 'f(x) = x⁴ - 2x² + 4x - 3', derivative: 'f\'(x) = 4x³ - 4x + 4' },
      { expr: 'f(x) = 3x² - 2x + 7', derivative: 'f\'(x) = 6x - 2' },
      { expr: 'f(x) = -x³ + 4x² - x + 2', derivative: 'f\'(x) = -3x² + 8x - 1' }
    ];
    
    const selected = randomChoice(functions);
    
    return {
      id: hashQuestion(this.level, 'functions', ['derivative', selected.derivative]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(80, 200),
      question: `Calcule la dérivée de ${selected.expr}.`,
      answer: selected.derivative,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input.replace(/\s/g, '') === selected.derivative.replace(/\s/g, '');
      }
    };
  }

  private generateDerivativeSign(): GeneratedQuestion {
    const a = randomInt(1, 5);
    const b = randomInt(-10, 10);
    const c = randomInt(-20, 20);
    const root1 = (-b + Math.sqrt(b*b - 4*a*c)) / (2*a);
    const root2 = (-b - Math.sqrt(b*b - 4*a*c)) / (2*a);
    
    return {
      id: hashQuestion(this.level, 'functions', ['derivative_sign', a, b, c]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(100, 250),
      question: `Soit f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}. Sur quel intervalle f'(x) > 0 ?`,
      answer: `]${root1.toFixed(1)} ; ${root2.toFixed(1)}[`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        // Accepter divers formats d'intervalles
        const normalized = input.replace(/\s/g, '').replace(/∞/g, 'inf');
        const patterns = [
          `]${root1.toFixed(1)};${root2.toFixed(1)}[`,
          `[${root1.toFixed(1)};${root2.toFixed(1)}]`,
          `]${root1.toFixed(1)} ${root2.toFixed(1)}[`,
          `[${root1.toFixed(1)} ${root2.toFixed(1)}]`
        ];
        
        return patterns.some(pattern => normalized === pattern);
      }
    };
  }

  private generateExtremum(): GeneratedQuestion {
    const a = randomInt(1, 5);
    const b = randomInt(-10, 10);
    const c = randomInt(-20, 20);
    const extremum = -b * b / (4 * a);
    
    const isMaximum = a > 0;
    
    return {
      id: hashQuestion(this.level, 'functions', ['extremum', a, b, c]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(120, 240),
      question: `Soit f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}. Donne le ${isMaximum ? 'maximum' : 'minimum'} de f.`,
      answer: extremum.toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - extremum) < 0.01;
      }
    };
  }

  private generateTangent(): GeneratedQuestion {
    const a = randomInt(1, 5);
    const b = randomInt(-5, 15);
    const c = randomInt(-10, 20);
    const x0 = randomInt(-3, 3);
    
    const y0 = a * x0 * x0 + b * x0 + c;
    const slope = 2 * a * x0 + b;
    
    return {
      id: hashQuestion(this.level, 'functions', ['tangent', a, b, c, x0]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(150, 280),
      question: `Soit f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}. Équation de la tangente en x₀ = ${x0} : y = ?`,
      answer: `${slope.toFixed(1)}x ${y0 >= 0 ? '+' : ''} ${y0.toFixed(1)}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        // Parser "ax + b" format
        const match = input.match(/^(-?\d+(?:\.\d+)?)x\s*([+-]\s*\d+(?:\.\d+)?)?$/);
        if (!match) return false;
        
        const userSlope = parseFloat(match[1]);
        const userIntercept = parseFloat(match[2]);
        
        return !isNaN(userSlope) && !isNaN(userIntercept) && 
               Math.abs(userSlope - slope) < 0.01 && 
               Math.abs(userIntercept - y0) < 0.01;
      }
    };
  }

  // ── Exponentielle et logarithme ─────────────────────────────────────────────

  private generateExpLog(): GeneratedQuestion {
    return randomChoice([
      () => this.generateExponentialEquation(),
      () => this.generateLogarithm(),
      () => this.generateLogProperties(),
    ])();
  }

  private generateExponentialEquation(): GeneratedQuestion {
    const result = randomInt(2, 100);
    
    return {
      id: hashQuestion(this.level, 'exp_log', ['exp_eq', result]),
      type: 'exp_log',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(100, 250),
      question: `Résous e^x = ${result}.`,
      answer: `x = ${Math.log(result).toFixed(2)}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        // Accepter "x = nombre" ou juste le nombre
        const match = input.match(/x\s*=\s*(-?\d+(?:\.\d+)?)/);
        if (!match) return false;
        
        const userResult = parseFloat(match[1]);
        return !isNaN(userResult) && Math.abs(userResult - Math.log(result)) < 0.01;
      }
    };
  }

  private generateLogarithm(): GeneratedQuestion {
    const a = randomChoice([2, 3, 5, 10, Math.E]);
    const b = randomChoice([2, 3, 5, 10, Math.E]);
    
    let result: string;
    let answer: string;
    
    if (a === Math.E && b === Math.E) {
      result = `${Math.E}`;
      answer = `${Math.E}`;
    } else if (a === Math.E) {
      result = `ln(${b})`;
      answer = `${Math.log(b).toFixed(2)}`;
    } else if (b === Math.E) {
      result = `ln(${a})`;
      answer = `${Math.log(a).toFixed(2)}`;
    } else {
      result = `ln(${a} × ${b})`;
      answer = `${(Math.log(a) + Math.log(b)).toFixed(2)}`;
    }
    
    return {
      id: hashQuestion(this.level, 'exp_log', ['log', a, b]),
      type: 'exp_log',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(120, 260),
      question: `Calcule ln(${a} × ${b}).`,
      answer: answer,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - parseFloat(answer)) < 0.01;
      }
    };
  }

  private generateLogProperties(): GeneratedQuestion {
    const operations = [
      { expr: 'ln(a/b)', result: 'ln(a) - ln(b)', desc: 'ln(a/b) = ln(a) - ln(b)' },
      { expr: 'ln(a^n)', result: 'n × ln(a)', desc: 'ln(a^n) = n × ln(a)' },
      { expr: 'e^(a+b)', result: 'e^a × e^b', desc: 'e^(a+b) = e^a × e^b' },
      { expr: 'e^(iπ) + 1', result: '0', desc: 'e^(iπ) + 1 = 0' }
    ];
    
    const selected = randomChoice(operations);
    const a = randomInt(2, 10);
    const b = randomInt(2, 10);
    const n = randomInt(2, 5);
    
    return {
      id: hashQuestion(this.level, 'exp_log', ['log_prop', selected.result]),
      type: 'exp_log',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(140, 280),
      question: `Simplifie ${selected.expr.replace('a', a.toString()).replace('b', b.toString()).replace('n', n.toString())}.`,
      answer: selected.result,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input.replace(/\s/g, '') === selected.result;
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
    const a = randomInt(5, 20);
    const b = randomInt(5, 20);
    const c = Math.sqrt(a * a + b * b);
    
    return {
      id: hashQuestion(this.level, 'geometry', ['pythagore', a, b]),
      type: 'geometry',
      domain: 'geometry',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(60, 180),
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
    const ab = randomInt(8, 25);
    const ac = randomInt(8, 25);
    const ad = randomInt(3, 15);
    
    const ratio = ad / ab;
    const ae = Math.round(ac * ratio);
    
    return {
      id: hashQuestion(this.level, 'geometry', ['thales', ab, ac, ad]),
      type: 'geometry',
      domain: 'geometry',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(80, 220),
      question: `Dans le triangle ABC, D est un point de [AB] tel que AD = ${ad} cm et AB = ${ab} cm. La parallèle à (BC) passant par D coupe [AC] en E. Calcule AE si AC = ${ac} cm.`,
      answer: ae.toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseInt(input);
        return !isNaN(userResult) && userResult === ae;
      }
    };
  }

  // ── Arithmétique (renforcement) ─────────────────────────────────────────────

  private generateArithmetic(): GeneratedQuestion {
    return randomChoice([
      () => this.generateAdvancedPGCD(),
      () => this.generateModularEquation(),
    ])();
  }

  private generateAdvancedPGCD(): GeneratedQuestion {
    const a = randomInt(20, 200);
    const b = randomInt(20, 200);
    
    const pgcd = this.calculatePGCD(a, b);
    
    return {
      id: hashQuestion(this.level, 'calculation', ['advanced_pgcd', a, b]),
      type: 'calculation',
      domain: 'calculation',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(40, 120),
      question: `Calcule PGCD(${a}, ${b}) en utilisant l'algorithme d'Euclide.`,
      answer: pgcd.toString(),
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseInt(input);
        return !isNaN(userResult) && userResult === pgcd;
      }
    };
  }

  private generateModularEquation(): GeneratedQuestion {
    const a = randomInt(10, 50);
    const n = randomChoice([7, 11, 13, 17, 19, 23]);
    const remainder = randomInt(0, n - 1);
    
    return {
      id: hashQuestion(this.level, 'calculation', ['modular', a, n, remainder]),
      type: 'calculation',
      domain: 'calculation',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(60, 150),
      question: `Trouve le plus petit entier x > 0 tel que ${a}x ≡ ${remainder} (mod ${n}).`,
      answer: `${remainder}`,
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
