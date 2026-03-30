// ============================================================================
// TLE.TS — Générateur niveau Terminale (ELO 2625-2874)
// ============================================================================
// DOMAINES : Limites, Dérivées (renforcement), Intégrales, 
//            Logarithme et exponentielle (renforcement), Loi normale,
//            Suites (renforcement), Géométrie dans l'espace
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class TerminaleGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = 'Tle';
  private readonly eloRange = { min: 2625, max: 2874 };

  getEloRange() { return this.eloRange; }

  getAvailableDomains(): DomainType[] {
    return ['algebra', 'functions', 'calculation', 'statistics', 'geometry', 'complex'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domain = randomChoice(this.getAvailableDomains());
    switch (domain) {
      case 'algebra':     return this.generateLimits();
      case 'functions':   return this.generateDerivatives();
      case 'calculation': return this.generateArithmetic();
      case 'statistics':  return this.generateNormalLaw();
      case 'geometry':    return this.generateGeometry3D();
      case 'complex':     return this.generateComplex();
      default:            return this.generateLimits();
    }
  }

  // ── Limites ─────────────────────────────────────────────────────

  private generateLimits(): GeneratedQuestion {
    return randomChoice([
      () => this.generateRationalLimit(),
      () => this.generateInfinityLimit(),
      () => this.generateSpecialLimit(),
    ])();
  }

  private generateRationalLimit(): GeneratedQuestion {
    const a = randomInt(1, 5);
    const b = randomInt(-10, 10);
    const c = randomInt(-10, 10);
    const d = randomInt(1, 10);
    const x = randomInt(2, 8);
    
    const numerator = a * x * x + b * x + c;
    const denominator = d * x + c;
    
    return {
      id: hashQuestion(this.level, 'limits', ['rational', a, b, c, d]),
      type: 'limits',
      domain: 'algebra',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(100, 200),
      question: `Calcule lim_{x->+∞} (${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}) / (${d}x ${c >= 0 ? '+' : ''} ${c}).`,
      answer: '+∞',
      explanation: `lim_{x->+∞} = lim_{x->+∞} (${a}x² + ${b}x + ${c})/(${d}x + ${c}) = +∞ car le degré du numérateur (2) est supérieur au degré du dénominateur (1)`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input === '+∞' || input === '+inf' || input === '+Infinity';
      }
    };
  }

  private generateInfinityLimit(): GeneratedQuestion {
    const forms = [
      { expr: 'e^x / x^n', result: '+∞', desc: 'n > 0, degré numérateur > degré dénominateur' },
      { expr: 'x^n * e^{-x}', result: '0', desc: 'n > 0, exponentiel l\'emporte sur puissance' },
      { expr: 'ln(x) / x', result: '0', desc: 'logarithme croît moins vite que x' }
    ];
    
    const selected = randomChoice(forms);
    const n = randomInt(2, 5);
    
    return {
      id: hashQuestion(this.level, 'limits', ['infinity', selected.result]),
      type: 'limits',
      domain: 'algebra',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(150, 250),
      question: `Calcule lim_{x->+∞} ${selected.expr.replace('x', 'x').replace('n', n.toString())}.`,
      answer: selected.result,
      explanation: `${selected.desc}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input === selected.result;
      }
    };
  }

  private generateSpecialLimit(): GeneratedQuestion {
    // Limite avec forme indéterminée 0/0
    const a = randomInt(1, 5);
    const b = randomInt(-5, 5);
    const c = randomInt(-10, 10);
    
    return {
      id: hashQuestion(this.level, 'limits', ['special', a, b, c]),
      type: 'limits',
      domain: 'algebra',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(120, 220),
      question: `Calcule lim_{x->${a}} (${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}) / (x${a > 0 ? '-' : '+'} ${Math.abs(a)}).`,
      answer: '-∞',
      explanation: `Forme indéterminée 0/0, limite = -∞ car a < 0`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input === '-∞' || input === '-inf' || input === '-Infinity';
      }
    };
  }

  // ── Dérivées (renforcement) ─────────────────────────────────────────────

  private generateDerivatives(): GeneratedQuestion {
    return randomChoice([
      () => this.generateLogDerivative(),
      () => this.generateExponentialDerivative(),
      () => this.generateProductDerivative(),
      () => this.generateQuotientDerivative(),
      () => this.generateTangentDerivative(),
    ])();
  }

  private generateLogDerivative(): GeneratedQuestion {
    const functions = [
      { expr: 'ln(u)', derivative: 'u\'/u' },
      { expr: 'ln(e^x)', derivative: 'e^x' },
      { expr: 'ln(ax)', derivative: 'a/x' }
    ];
    
    const selected = randomChoice(functions);
    
    return {
      id: hashQuestion(this.level, 'functions', ['log_derivative', selected.derivative]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(140, 260),
      question: `Calcule la dérivée de ${selected.expr}.`,
      answer: selected.derivative,
      explanation: `Dérivée de ${selected.expr} = ${selected.derivative}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input.replace(/\s/g, '') === selected.derivative.replace(/\s/g, '');
      }
    };
  }

  private generateExponentialDerivative(): GeneratedQuestion {
    const a = randomInt(1, 5);
    const b = randomInt(-3, 3);
    
    return {
      id: hashQuestion(this.level, 'functions', ['exp_derivative', a, b]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(160, 280),
      question: `Calcule la dérivée de f(x) = e^${a}x ${b >= 0 ? '+' : ''} ${b}.`,
      answer: `${a}e^${a}x ${b >= 0 ? '+' : ''} ${b}`,
      explanation: `Dérivée de e^${a}x${b >= 0 ? '+' : ''} ${b} = ${a}e^${a}x${b >= 0 ? '+' : ''} ${b}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input.replace(/\s/g, '') === `${a}e^${a}x${b >= 0 ? '+' : ''} ${b}`.replace(/\s/g, '');
      }
    };
  }

  private generateProductDerivative(): GeneratedQuestion {
    const u = ['u', 'v'];
    const v = ['v', 'w'];
    const selectedU = randomChoice(u);
    const selectedV = randomChoice(v);
    
    return {
      id: hashQuestion(this.level, 'functions', ['product_derivative', selectedU, selectedV]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(180, 300),
      question: `Calcule la dérivée de f(x) = ${selectedU}(x) × ${selectedV}(x).`,
      answer: `${selectedU}'(x) × ${selectedV} + ${selectedU}(x)`,
      explanation: `Dérivée de ${selectedU}(x) × ${selectedV}(x) = ${selectedU}'(x) × ${selectedV} + ${selectedU}(x)`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input.replace(/\s/g, '') === `${selectedU}'(x) × ${selectedV} + ${selectedU}(x)`.replace(/\s/g, '');
      }
    };
  }

  private generateQuotientDerivative(): GeneratedQuestion {
    const u = ['u', 'v'];
    const selectedU = randomChoice(u);
    
    return {
      id: hashQuestion(this.level, 'functions', ['quotient_derivative', selectedU]),
      type: 'functions',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(200, 320),
      question: `Calcule la dérivée de f(x) = ${selectedU}(x) / (x + 1).`,
      answer: `${selectedU}'(x) × (x + 1) - ${selectedU}(x) / (x + 1)²`,
      explanation: `Dérivée de ${selectedU}(x)/(x+1) = [${selectedU}'(x)(x+1) - ${selectedU}(x)]/(x+1)²`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input.replace(/\s/g, '') === `${selectedU}'(x) × (x + 1) - ${selectedU}(x) / (x + 1)²`.replace(/\s/g, '');
      }
    };
  }

  private generateTangentDerivative(): GeneratedQuestion {
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
      difficultyElo: this.eloRange.min + randomInt(220, 340),
      question: `Soit f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}. Équation de la tangente en x₀ = ${x0} : y = ?`,
      answer: `${slope.toFixed(1)}x ${y0 >= 0 ? '+' : ''} ${y0.toFixed(1)}`,
      explanation: `y = f'(x₀)(x - x₀) + f(x₀) = (${2*a*x0 + b})(x - ${x0}) + ${a*x0*x0 + b*x0 + c} = ${slope.toFixed(1)}x ${y0 >= 0 ? '+' : ''} ${y0.toFixed(1)}`,
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

  // ── Intégrales ─────────────────────────────────────────────────────

  private generateIntegrals(): GeneratedQuestion {
    return randomChoice([
      () => this.generatePolynomialIntegral(),
      () => this.generateExponentialIntegral(),
      () => this.generateLogIntegral(),
    ])();
  }

  private generatePolynomialIntegral(): GeneratedQuestion {
    const degree = randomChoice([1, 2]);
    const coeffs = degree === 1 ? 
      [randomInt(1, 10), randomInt(1, 20)] :
      [randomInt(1, 5), randomInt(1, 10), randomInt(1, 15)];
    
    const a = randomInt(1, 5);
    const b = randomInt(-10, 10);
    const lower = randomInt(0, 5);
    const upper = randomInt(6, 15);
    
    const integral = degree === 1 ?
      a * (upper * upper - lower * lower) / 2 + b * (upper - lower) :
      a * (upper * upper * upper - lower * lower * lower) / 3 + b * (upper * upper - lower * lower) / 2 + coeffs[0] * (upper - lower) / 4;
    
    return {
      id: hashQuestion(this.level, 'integrals', ['polynomial', degree]),
      type: 'integrals',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(200, 350),
      question: `Calcule ∫_${lower}^${upper} (${coeffs.join(' + ')}x ${degree === 1 ? '' : coeffs[1]}x² ${coeffs.slice(2).join(' + ')}dx.`,
      answer: integral.toFixed(2),
      explanation: `Intégrale du polynôme degré ${degree} = ${integral.toFixed(2)}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - integral) < 0.01;
      }
    };
  }

  private generateExponentialIntegral(): GeneratedQuestion {
    const a = randomInt(1, 5);
    const lower = randomInt(0, 5);
    const upper = randomInt(6, 15);
    
    const result = a * (Math.exp(upper) - Math.exp(lower));
    
    return {
      id: hashQuestion(this.level, 'integrals', ['exponential', a, lower, upper]),
      type: 'integrals',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(220, 380),
      question: `Calcule ∫_${lower}^${upper} ${a}e^x dx.`,
      answer: result.toFixed(2),
      explanation: `∫ ${a}e^x dx = ${a}e^x = ${result.toFixed(2)}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - result) < 0.01;
      }
    };
  }

  private generateLogIntegral(): GeneratedQuestion {
    const a = randomInt(2, 10);
    const b = randomInt(2, 10);
    
    return {
      id: hashQuestion(this.level, 'integrals', ['log', a, b]),
      type: 'integrals',
      domain: 'functions',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(240, 400),
      question: `Calcule ∫_${a}^${b} (1/x) dx où a, b > 0.`,
      answer: `${b} ln(${a})`,
      explanation: `∫ ${a}^${b} (1/x) dx = ${b} ln(${a})`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const match = input.match(/^(\d+(?:\.\d+)?)\s*ln\(\d+\)$/);
        if (!match) return false;
        
        const userB = parseFloat(match[1]);
        const userA = parseFloat(match[2]);
        
        return !isNaN(userB) && !isNaN(userA) && 
               Math.abs(userB - b) < 0.01 && 
               Math.abs(userA - a) < 0.01;
      }
    };
  }

  // ── Loi normale ─────────────────────────────────────────────────────

  private generateNormalLaw(): GeneratedQuestion {
    return randomChoice([
      () => this.generateNormalProbability(),
      () => this.generateFluctuationInterval(),
    ])();
  }

  private generateNormalProbability(): GeneratedQuestion {
    const mu = randomInt(50, 150);
    const sigma = randomChoice([5, 10, 15, 20]);
    const a = randomInt(mu - 3 * sigma, mu + 3 * sigma);
    
    const probability = 0.5; // Valeur lue dans table pour simplifier
    
    return {
      id: hashQuestion(this.level, 'normal_law', ['normal_prob', mu, sigma, a]),
      type: 'normal_law',
      domain: 'statistics',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(250, 450),
      question: `X suit N(${mu}, ${sigma}²). Sachant que P(X < ${a}) = ${probability}, calcule P(X < ${a}).`,
      answer: probability.toString(),
      explanation: `Par symétrie : P(X < ${mu - 3*sigma}) = ${probability}, donc P(X < ${a}) = 1 - ${probability} = ${1 - probability}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - (1 - probability)) < 0.001;
      }
    };
  }

  private generateFluctuationInterval(): GeneratedQuestion {
    const n = randomInt(50, 200);
    const p = randomChoice([0.3, 0.4, 0.5, 0.6, 0.7]);
    
    const lowerBound = p - 1.96 * Math.sqrt(p * (1 - p) / n);
    const upperBound = p + 1.96 * Math.sqrt(p * (1 - p) / n);
    
    return {
      id: hashQuestion(this.level, 'normal_law', ['fluctuation', n, p]),
      type: 'normal_law',
      domain: 'statistics',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(300, 500),
      question: `Intervalle de fluctuation au seuil 95% pour une proportion de ${p} dans un échantillon de taille ${n}.`,
      answer: `[${lowerBound.toFixed(3)} ; ${upperBound.toFixed(3)}]`,
      explanation: `[p - 1.96√(p(1-p)/n) ; p + 1.96√(p(1-p)/n)] = [${lowerBound.toFixed(3)} ; ${upperBound.toFixed(3)}]`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        // Accepter différents formats d'intervalles
        const normalized = input.replace(/\s/g, '').replace(/∞/g, 'inf');
        const patterns = [
          `[${lowerBound.toFixed(3)};${upperBound.toFixed(3)}]`,
          `[${lowerBound.toFixed(3)} ${upperBound.toFixed(3)}]`,
          `[${lowerBound.toFixed(3)},${upperBound.toFixed(3)}]`
        ];
        
        return patterns.some(pattern => normalized === pattern);
      }
    };
  }

  // ── Géométrie dans l'espace ─────────────────────────────────────────────

  private generateGeometry3D(): GeneratedQuestion {
    return randomChoice([
      () => this.generateVectors3D(),
      () => this.generatePlaneEquation(),
    ])();
  }

  private generateVectors3D(): GeneratedQuestion {
    const v1 = [randomInt(-5, 5), randomInt(-5, 5), randomInt(-5, 5)];
    const v2 = [randomInt(-5, 5), randomInt(-5, 5), randomInt(-5, 5)];
    
    const dotProduct = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    const norm1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
    const norm2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);
    
    return {
      id: hashQuestion(this.level, 'geometry_3d', ['vectors', v1, v2]),
      type: 'geometry_3d',
      domain: 'geometry',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(280, 480),
      question: `Soit u⃗(${v1[0]}, ${v1[1]}, ${v1[2]}) et v⃗(${v2[0]}, ${v2[1]}, ${v2[2]}). Calcule u⃗·v⃗.`,
      answer: dotProduct.toString(),
      explanation: `u⃗·v⃗ = ${v1[0]}×${v2[0]} + ${v1[1]}×${v2[1]} + ${v1[2]}×${v2[2]} = ${dotProduct}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseFloat(input);
        return !isNaN(userResult) && Math.abs(userResult - dotProduct) < 0.01;
      }
    };
  }

  private generatePlaneEquation(): GeneratedQuestion {
    const A = [randomInt(1, 5), randomInt(1, 5), randomInt(1, 5)];
    const B = [randomInt(1, 5), randomInt(1, 5), randomInt(1, 5)];
    const C = [randomInt(1, 5), randomInt(1, 5), randomInt(1, 5)];
    
    // Calcul du vecteur normal AB × AC
    const AB = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
    const AC = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const normal = [
      AB[1] * AC[2] - AB[2] * AC[1],
      AB[2] * AC[0] - AB[0] * AC[2],
      AB[0] * AC[1] - AB[1] * AC[0]
    ];
    
    const d = normal[0] * A[0] + normal[1] * A[1] + normal[2] * A[2];
    
    return {
      id: hashQuestion(this.level, 'geometry_3d', ['plane', A, B, C]),
      type: 'geometry_3d',
      domain: 'geometry',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(320, 520),
      question: `Donne l'équation du plan passant par A(${A.join(',')}), B(${B.join(',')}) et C(${C.join(',')}).`,
      answer: `${normal[0]}x + ${normal[1]}y + ${normal[2]}z + ${d} = 0`,
      explanation: `Vecteur normal : (${normal.join(',')}) · (x,y,z) + ${d} = 0`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        // Parser format "ax + by + cz + d = 0"
        const match = input.match(/^(-?\d+(?:\.\d+)?)x\s*\+\s*(-?\d+(?:\.\d+)?)y\s*\+\s*(-?\d+(?:\.\d+)?)z\s*\+\s*(-?\d+(?:\.\d+)?)\s*=\s*0$/);
        if (!match) return false;
        
        const userD = parseFloat(match[5]);
        return !isNaN(userD) && Math.abs(userD - d) < 0.01;
      }
    };
  }

  // ── Nombres complexes ─────────────────────────────────────────────────────

  private generateComplex(): GeneratedQuestion {
    return randomChoice([
      () => this.generateComplexAlgebraic(),
      () => this.generateComplexTrigonometric(),
      () => this.generateComplexExponential(),
    ])();
  }

  private generateComplexAlgebraic(): GeneratedQuestion {
    const operations = [
      { op: 'addition', a: [2, 3], b: [1, 4] },
      { op: 'subtraction', a: [5, 6], b: [2, 3] },
      { op: 'multiplication', a: [1, 2], b: [3, 4] },
      { op: 'division', a: [3, 4], b: [1, 2] }
    ];
    
    const selected = randomChoice(operations);
    
    return {
      id: hashQuestion(this.level, 'complex', ['algebraic', selected.op]),
      type: 'complex_numbers',
      domain: 'complex',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(200, 400),
      question: `Calcule (${selected.a[0]} + ${selected.a[1]}i) ${selected.op} (${selected.b[0]} + ${selected.b[1]}i).`,
      answer: this.performComplexOperation(selected.op, selected.a, selected.b),
      explanation: `Opération sur nombres complexes : ${selected.op}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        return input.replace(/\s/g, '') === this.performComplexOperation(selected.op, selected.a, selected.b).replace(/\s/g, '');
      }
    };
  }

  private generateComplexTrigonometric(): GeneratedQuestion {
    const angles = [0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2, Math.PI];
    const selectedAngle = randomChoice(angles);
    
    return {
      id: hashQuestion(this.level, 'complex', ['trigonometric', selectedAngle]),
      type: 'complex_numbers',
      domain: 'complex',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(250, 480),
      question: `Écris le nombre complexe z = cos(${this.formatAngle(selectedAngle)}) + i sin(${this.formatAngle(selectedAngle)}).`,
      answer: `${Math.cos(selectedAngle).toFixed(2)} + ${Math.sin(selectedAngle).toFixed(2)}i`,
      explanation: `Forme trigonométrique : cos(θ) + i sin(θ) avec θ = ${this.formatAngle(selectedAngle)}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        // Parser "a + bi" format
        const match = input.match(/^(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)i$/);
        if (!match) return false;
        
        const userReal = parseFloat(match[1]);
        const userImag = parseFloat(match[2]);
        
        return !isNaN(userReal) && !isNaN(userImag) && 
               Math.abs(userReal - Math.cos(selectedAngle)) < 0.01 && 
               Math.abs(userImag - Math.sin(selectedAngle)) < 0.01;
      }
    };
  }

  private generateComplexExponential(): GeneratedQuestion {
    const r = randomChoice([2, 3, 4, 5, 6]);
    const theta = randomChoice([Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2]);
    
    const real = r * Math.cos(theta);
    const imag = r * Math.sin(theta);
    
    return {
      id: hashQuestion(this.level, 'complex', ['exponential', r, theta]),
      type: 'complex_numbers',
      domain: 'complex',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(300, 520),
      question: `Donne les racines cubiques de l'unité sous forme exponentielle.`,
      answer: `${real.toFixed(2)} + ${imag.toFixed(2)}i, ${real.toFixed(2)} - ${imag.toFixed(2)}i, ${-real.toFixed(2)} + ${imag.toFixed(2)}i`,
      explanation: `Racines cubiques : r^3 = 1 ⇒ r = e^(2iπk/3) pour k = 0,1,2`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const parts = input.split(',');
        if (parts.length !== 3) return false;
        
        return parts.every(part => {
          const match = part.trim().match(/^(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)i$/);
          if (!match) return false;
          
          const real = parseFloat(match[1]);
          const imag = parseFloat(match[2]);
          
          return !isNaN(real) && !isNaN(imag) && Math.abs(real - parseFloat(parts[0].split(',')[0])) < 0.01;
        });
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
    const a = randomInt(50, 500);
    const b = randomInt(50, 500);
    
    const pgcd = this.calculatePGCD(a, b);
    
    return {
      id: hashQuestion(this.level, 'calculation', ['advanced_pgcd', a, b]),
      type: 'calculation',
      domain: 'calculation',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(100, 200),
      question: `Calcule PGCD(${a}, ${b}) en utilisant l'algorithme d'Euclide.`,
      answer: pgcd.toString(),
      explanation: `PGCD(${a}, ${b}) = ${pgcd}`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseInt(input);
        return !isNaN(userResult) && userResult === pgcd;
      }
    };
  }

  private generateModularEquation(): GeneratedQuestion {
    const a = randomInt(20, 100);
    const n = randomChoice([11, 13, 17, 19, 23, 29, 31]);
    const remainder = randomInt(0, n - 1);
    
    return {
      id: hashQuestion(this.level, 'calculation', ['modular', a, n, remainder]),
      type: 'calculation',
      domain: 'calculation',
      level: this.level,
      difficultyElo: this.eloRange.min + randomInt(120, 250),
      question: `Trouve le plus petit entier x > 0 tel que ${a}x ≡ ${remainder} (mod ${n}).`,
      answer: `${remainder}`,
      explanation: `Solution : x ≡ ${remainder} (mod ${n})`,
      validate: (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const userResult = parseInt(input);
        return !isNaN(userResult) && userResult === remainder;
      }
    };
  }

  // ── Utilitaires ─────────────────────────────────────────────────────

  private performComplexOperation(op: string, a: number[], b: number[]): string {
    switch (op) {
      case 'addition':
        return `${a[0] + b[0]} + ${(a[1] + b[1])}i`;
      case 'subtraction':
        return `${a[0] - b[0]} + ${(a[1] - b[1])}i`;
      case 'multiplication':
        const real = a[0] * b[0] - a[1] * b[1];
        const imag = a[0] * b[1] + a[1] * b[0];
        return `${real} + ${imag}i`;
      case 'division':
        // (a+bi)/(c+di) = ((ac+bd)+(bc-ad)i)/(c²+d²)
        const ac_bd = a[0] * b[0] + a[1] * b[1];
        const bc_ad = b[0] * a[0] - b[1] * a[1];
        const denominator = b[0] * b[0] + b[1] * b[1];
        return `${ac_bd}/${denominator} + ${bc_ad}/${denominator}i`;
      default:
        return '0';
    }
  }

  private calculatePGCD(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  private formatAngle(angle: number): string {
    const piFractions = [
      { value: 0, text: '0' },
      { value: Math.PI/6, text: 'π/6' },
      { value: Math.PI/4, text: 'π/4' },
      { value: Math.PI/3, text: 'π/3' },
      { value: Math.PI/2, text: 'π/2' },
      { value: Math.PI, text: 'π' }
    ];
    
    const match = piFractions.find(f => Math.abs(f.value - angle) < 0.001);
    return match ? match.text : angle.toFixed(2);
  }
}
