// ============================================================================
// SUP1.TS — Générateur niveau Supérieur 1 (ELO 2750-2999) — L1 / CPGE 1ère année
// ============================================================================
// DOMAINES : Algèbre linéaire intro (espaces vectoriels, applications linéaires),
//            Analyse (continuité, dérivabilité, DL), Probabilités (variables
//            aléatoires discrètes), Arithmétique (PGCD, congruences)
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class Sup1Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'Sup1';
  private readonly eloRange = { min: 2750, max: 2999 };

  getEloRange() { return this.eloRange; }

  getAvailableDomains(_excludeGeometry: boolean): DomainType[] {
    return ['algebra', 'functions', 'calculation', 'statistics'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domain = randomChoice(this.getAvailableDomains(context.excludeGeometry ?? false));
    switch (domain) {
      case 'algebra':     return this.generateAlgebra();
      case 'functions':   return this.generateAnalysis();
      case 'calculation': return this.generateArithmetic();
      case 'statistics':  return this.generateProbability();
      default:            return this.generateAlgebra();
    }
  }

  // ── Algèbre linéaire ──────────────────────────────────────────────────────

  private generateAlgebra(): GeneratedQuestion {
    return randomChoice([
      () => this.generateDeterminant3x3(),
      () => this.generateLinearSystemRank(),
      () => this.generateVectorSpaceQuestion(),
    ])();
  }

  private generateDeterminant3x3(): GeneratedQuestion {
    // Matrice triangulaire (déterminant = produit diagonal) pour résultat propre
    const a = randomInt(1, 4), b = randomInt(1, 4), c = randomInt(1, 4);
    const det = a * b * c;
    return {
      id: hashQuestion(this.level, 'algebra', [a, b, c]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: context?.userElo ?? 2800,
      question: `Déterminant de la matrice triangulaire [[${a},2,1],[0,${b},3],[0,0,${c}]]`,
      answer: det.toString(),
      explanation: `Pour une matrice triangulaire, det = produit des éléments diagonaux = ${a}×${b}×${c} = ${det}`,
      timeEstimate: 40,
    };
  }

  private generateLinearSystemRank(): GeneratedQuestion {
    const n = randomInt(2, 4);
    const type = randomChoice(['unique', 'infinite', 'none']);
    const answers = {
      unique: '1 solution unique',
      infinite: 'infinité de solutions',
      none: 'aucune solution',
    };
    return {
      id: hashQuestion(this.level, 'algebra', [n]),
      type: 'mcq',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 2850,
      question: `Un système de ${n} équations à ${n} inconnues avec matrice de rang ${type === 'unique' ? n : n - 1} a :`,
      answer: answers[type],
      options: shuffleArray(Object.values(answers)),
      explanation: `Rang = ${type === 'unique' ? n : n - 1} vs ${n} inconnues → ${answers[type]}`,
      timeEstimate: 30,
    };
  }

  private generateVectorSpaceQuestion(): GeneratedQuestion {
    const dim = randomInt(2, 4);
    const subdim = randomInt(1, dim - 1);
    return {
      id: hashQuestion(this.level, 'algebra', [dim, subdim]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 2900,
      question: `Dans ℝ^${dim}, combien de vecteurs forment une base d'un sous-espace de dimension ${subdim} ?`,
      answer: subdim.toString(),
      explanation: `Une base d'un sous-espace de dimension ${subdim} contient exactement ${subdim} vecteur${subdim > 1 ? 's' : ''} linéairement indépendants.`,
      timeEstimate: 25,
    };
  }

  // ── Analyse ───────────────────────────────────────────────────────────────

  private generateAnalysis(): GeneratedQuestion {
    return randomChoice([
      () => this.generateDLOrder2(),
      () => this.generateContinuityQuestion(),
      () => this.generateIntegralByParts(),
    ])();
  }

  private generateDLOrder2(): GeneratedQuestion {
    const funcs = [
      { name: 'eˣ',        dl: '1 + x + x²/2 + o(x²)' },
      { name: 'sin(x)',     dl: 'x - x³/6 + o(x³)' },
      { name: 'cos(x)',     dl: '1 - x²/2 + o(x²)' },
      { name: 'ln(1+x)',   dl: 'x - x²/2 + o(x²)' },
      { name: '1/(1-x)',   dl: '1 + x + x² + o(x²)' },
      { name: '√(1+x)',    dl: '1 + x/2 - x²/8 + o(x²)' },
    ];
    const { name, dl } = randomChoice(funcs);
    const wrongs = funcs.filter(f => f.name !== name).slice(0, 3).map(f => f.dl);
    return {
      id: hashQuestion(this.level, 'functions', [funcs.findIndex(f => f.name === name)]),
      type: 'mcq',
      domain: 'functions',
      level: this.level,
      difficultyElo: 2800,
      question: `DL à l'ordre 2 de ${name} en 0`,
      answer: dl,
      options: shuffleArray([dl, ...wrongs]),
      explanation: `${name} = ${dl}`,
      timeEstimate: 40,
    };
  }

  private generateContinuityQuestion(): GeneratedQuestion {
    const a = randomInt(1, 5);
    return {
      id: hashQuestion(this.level, 'functions', [a, 1]),
      type: 'mcq',
      domain: 'functions',
      level: this.level,
      difficultyElo: 2760,
      question: `f(x) = x² est-elle dérivable en x = ${a} ?`,
      answer: 'Oui, f\'('+a+') = ' + (2*a),
      options: shuffleArray([
        `Oui, f'(${a}) = ${2*a}`,
        `Non, la limite n'existe pas`,
        `Oui, f'(${a}) = ${a}`,
        `Non, f n'est pas continue`,
      ]),
      explanation: `f'(x) = 2x pour tout x, donc f'(${a}) = ${2*a}. f est dérivable partout.`,
      timeEstimate: 25,
    };
  }

  private generateIntegralByParts(): GeneratedQuestion {
    const n = randomInt(2, 5);
    return {
      id: hashQuestion(this.level, 'functions', [n, 2]),
      type: 'expression',
      domain: 'functions',
      level: this.level,
      difficultyElo: 2950,
      question: `Calcule ∫₀¹ x·eˣ dx`,
      answer: '1',
      acceptableAnswers: ['1', 'e-1', '1.0'],
      explanation: `IPP : u=x, v'=eˣ → [xeˣ]₀¹ - ∫₀¹ eˣdx = e - [eˣ]₀¹ = e - (e-1) = 1`,
      timeEstimate: 90,
    };
  }

  // ── Arithmétique ─────────────────────────────────────────────────────────

  private generateArithmetic(): GeneratedQuestion {
    return randomChoice([
      () => this.generateCongruence(),
      () => this.generateEuclid(),
    ])();
  }

  private generateCongruence(): GeneratedQuestion {
    const mod = randomChoice([7, 11, 13, 17]);
    const a = randomInt(2, 6);
    const n = randomInt(3, 8);
    const result = Math.pow(a, n) % mod;
    return {
      id: hashQuestion(this.level, 'calculation', [a, n, mod]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 2870,
      question: `${a}^${n} mod ${mod} = ?`,
      answer: result.toString(),
      explanation: `${a}^${n} = ${Math.pow(a,n)}, et ${Math.pow(a,n)} = ${Math.floor(Math.pow(a,n)/mod)}×${mod} + ${result}`,
      timeEstimate: 50,
    };
  }

  private generateEuclid(): GeneratedQuestion {
    const b = randomInt(3, 9);
    const q = randomInt(3, 8);
    const r = randomInt(1, b - 1);
    const a = b * q + r;
    const gcd = this.pgcd(a, b);
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 2780,
      question: `PGCD(${a}, ${b}) par l'algorithme d'Euclide`,
      answer: gcd.toString(),
      explanation: `${a} = ${q}×${b} + ${r} → PGCD(${b},${r}) → … = ${gcd}`,
      timeEstimate: 45,
    };
  }

  // ── Probabilités ─────────────────────────────────────────────────────────

  private generateProbability(): GeneratedQuestion {
    const n = randomInt(3, 6);
    const p = randomChoice([0.25, 0.5, 0.3, 0.4]);
    const k = randomInt(1, n - 1);
    const C = this.binom(n, k);
    const prob = Math.round(C * Math.pow(p, k) * Math.pow(1 - p, n - k) * 1000) / 1000;
    return {
      id: hashQuestion(this.level, 'statistics', [n, Math.round(p*100), k]),
      type: 'numeric',
      domain: 'statistics',
      level: this.level,
      difficultyElo: 2920,
      question: `X ~ B(${n}, ${p}). P(X = ${k}) = ? (arrondi à 0,001)`,
      answer: prob.toFixed(3).replace('.', ','),
      acceptableAnswers: [prob.toFixed(3), prob.toFixed(3).replace('.', ',')],
      explanation: `C(${n},${k})×${p}^${k}×${(1-p).toFixed(2)}^${n-k} = ${C}×${Math.pow(p,k).toFixed(4)}×${Math.pow(1-p,n-k).toFixed(4)} ≈ ${prob}`,
      timeEstimate: 60,
    };
  }

  private pgcd(a: number, b: number): number { return b === 0 ? a : this.pgcd(b, a % b); }
  private binom(n: number, k: number): number {
    if (k === 0 || k === n) return 1;
    return this.binom(n - 1, k - 1) + this.binom(n - 1, k);
  }
}

// Hack TypeScript : context accessible dans generateDeterminant3x3
let context: GenerationContext | null = null;
