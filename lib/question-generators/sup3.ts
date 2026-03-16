// ============================================================================
// SUP3.TS — Générateur niveau Supérieur 3 (ELO 3500-3999) — L3 / M1 / CPGE
// ============================================================================
// DOMAINES : Analyse fonctionnelle, Géométrie différentielle, Théorie des groupes
//            avancée, EDO/EDP, Probabilités (martingales, processus stochastiques)
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class Sup3Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'Sup3';
  private readonly eloRange = { min: 3500, max: 3999 };

  getEloRange() { return this.eloRange; }

  getAvailableDomains(_excludeGeometry: boolean): DomainType[] {
    return ['algebra', 'functions', 'complex', 'statistics', 'calculation'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domain = randomChoice(this.getAvailableDomains(context.excludeGeometry));
    switch (domain) {
      case 'algebra':     return this.generateAlgebra();
      case 'functions':   return this.generateAnalysis();
      case 'complex':     return this.generateEDP();
      case 'statistics':  return this.generateAdvancedProba();
      case 'calculation': return this.generateCombinatoire();
      default:            return this.generateAlgebra();
    }
  }

  // ── Algèbre avancée ───────────────────────────────────────────────────────

  private generateAlgebra(): GeneratedQuestion {
    return randomChoice([
      () => this.generateJordanForm(),
      () => this.generateGroupTheorem(),
      () => this.generateDualSpace(),
    ])();
  }

  private generateJordanForm(): GeneratedQuestion {
    const l = randomInt(1, 4);
    return {
      id: hashQuestion(this.level, 'algebra', [l, 100]),
      type: 'mcq',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 3600,
      question: `Une matrice 3×3 avec unique valeur propre λ=${l} (multiplicité 3) et rang(A-${l}I)=1. Forme de Jordan ?`,
      answer: `Jordan : 1 bloc 2×2 + 1 bloc 1×1`,
      options: shuffleArray([
        `Jordan : 1 bloc 3×3`,
        `Jordan : 1 bloc 2×2 + 1 bloc 1×1`,
        `Jordan : 3 blocs 1×1`,
        `Non diagonalisable sur ℂ`,
      ]),
      explanation: `rang(A-λI)=1 → nullité=2 → 2 vecteurs propres → 2 blocs. Tailles 2+1=3. Bloc 2×2 + bloc 1×1.`,
      timeEstimate: 70,
    };
  }

  private generateGroupTheorem(): GeneratedQuestion {
    const p = randomChoice([2, 3, 5, 7]);
    const order = p * p;
    return {
      id: hashQuestion(this.level, 'algebra', [p, 200]),
      type: 'mcq',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 3700,
      question: `Tout groupe d'ordre ${order} = ${p}² est :`,
      answer: 'Abélien',
      options: shuffleArray(['Abélien', 'Simple', 'Non résoluble', 'Libre']),
      explanation: `Théorème : tout p-groupe d'ordre p² est abélien (isomorphe à ℤ/p²ℤ ou ℤ/pℤ × ℤ/pℤ).`,
      timeEstimate: 40,
    };
  }

  private generateDualSpace(): GeneratedQuestion {
    const n = randomInt(2, 5);
    return {
      id: hashQuestion(this.level, 'algebra', [n, 300]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 3550,
      question: `dim((ℝ^${n})*)  = ? (dual de ℝ^${n})`,
      answer: n.toString(),
      explanation: `Le dual d'un espace de dimension finie n est isomorphe à ℝ^n, donc dim = ${n}.`,
      timeEstimate: 20,
    };
  }

  // ── Analyse fonctionnelle / EDP ───────────────────────────────────────────

  private generateAnalysis(): GeneratedQuestion {
    return randomChoice([
      () => this.generateBanachQuestion(),
      () => this.generateFourierTransform(),
    ])();
  }

  private generateBanachQuestion(): GeneratedQuestion {
    const spaces = [
      { name: 'C([0,1])', banach: true,  hilbert: false, norm: 'norme sup' },
      { name: 'L²([0,1])', banach: true, hilbert: true,  norm: 'norme L²' },
      { name: 'L¹([0,1])', banach: true, hilbert: false, norm: 'norme L¹' },
    ];
    const s = randomChoice(spaces);
    const q = randomChoice(['Banach', 'Hilbert']);
    return {
      id: hashQuestion(this.level, 'functions', [spaces.indexOf(s), q === 'Hilbert' ? 1 : 0]),
      type: 'mcq',
      domain: 'functions',
      level: this.level,
      difficultyElo: 3650,
      question: `${s.name} muni de la ${s.norm} est-il un espace de ${q} ?`,
      answer: (q === 'Banach' ? s.banach : s.hilbert) ? 'Oui' : 'Non',
      options: ['Oui', 'Non', 'Seulement en dimension finie', 'Seulement sur ℝ'],
      explanation: `${s.name} est ${s.banach ? '' : 'non '}de Banach et ${s.hilbert ? '' : 'non '}de Hilbert avec ${s.norm}.`,
      timeEstimate: 35,
    };
  }

  private generateFourierTransform(): GeneratedQuestion {
    return {
      id: hashQuestion(this.level, 'functions', [42, 1]),
      type: 'mcq',
      domain: 'functions',
      level: this.level,
      difficultyElo: 3800,
      question: `Transformée de Fourier de f(t) = e^(-t²) est :`,
      answer: '√π · e^(-ξ²/4)',
      options: shuffleArray([
        '√π · e^(-ξ²/4)',
        'e^(-ξ²)',
        '√π · e^(-ξ²)',
        '1/(1+ξ²)',
      ]),
      explanation: `TF(e^(-at²)) = √(π/a)·e^(-π²ξ²/a). Pour a=1 : √π·e^(-ξ²/4).`,
      timeEstimate: 60,
    };
  }

  private generateEDP(): GeneratedQuestion {
    const types = [
      { eq: '∂²u/∂t² = c²∂²u/∂x²', name: 'équation des ondes', type: 'hyperbolique' },
      { eq: '∂u/∂t = k∂²u/∂x²',     name: 'équation de la chaleur', type: 'parabolique' },
      { eq: '∂²u/∂x² + ∂²u/∂y² = 0', name: 'équation de Laplace', type: 'elliptique' },
    ];
    const t = randomChoice(types);
    return {
      id: hashQuestion(this.level, 'complex', [types.indexOf(t)]),
      type: 'mcq',
      domain: 'complex',
      level: this.level,
      difficultyElo: 3750,
      question: `${t.eq} est une EDP de type :`,
      answer: t.type,
      options: shuffleArray(['hyperbolique', 'parabolique', 'elliptique', 'mixte']),
      explanation: `${t.name} (${t.eq}) est de type ${t.type}.`,
      timeEstimate: 30,
    };
  }

  // ── Probabilités avancées ─────────────────────────────────────────────────

  private generateAdvancedProba(): GeneratedQuestion {
    return randomChoice([
      () => this.generateCLT(),
      () => this.generateMartingale(),
    ])();
  }

  private generateCLT(): GeneratedQuestion {
    const n = randomChoice([100, 144, 225, 400]);
    const mu = randomInt(1, 5);
    const sigma2 = randomInt(1, 4);
    return {
      id: hashQuestion(this.level, 'statistics', [n, mu, sigma2]),
      type: 'mcq',
      domain: 'statistics',
      level: this.level,
      difficultyElo: 3520,
      question: `X_i iid, E=μ, Var=σ²=${sigma2}. TCL : √n(X̄_n - μ) →(loi) ?`,
      answer: `N(0, ${sigma2})`,
      options: shuffleArray([`N(0, ${sigma2})`, `N(μ, ${sigma2})`, `N(0, ${sigma2/n})`, `N(0,1)`]),
      explanation: `Par le TCL : √n(X̄_n - μ) →(loi) N(0, σ²) = N(0, ${sigma2}).`,
      timeEstimate: 35,
    };
  }

  private generateMartingale(): GeneratedQuestion {
    return {
      id: hashQuestion(this.level, 'statistics', [999]),
      type: 'mcq',
      domain: 'statistics',
      level: this.level,
      difficultyElo: 3900,
      question: `(M_n) est une martingale si E[M_{n+1} | ℱ_n] = ?`,
      answer: 'M_n',
      options: shuffleArray(['M_n', 'M_{n+1}', '0', 'E[M_n]']),
      explanation: `Définition d'une martingale : E[M_{n+1} | ℱ_n] = M_n (espérance conditionnelle = valeur courante).`,
      timeEstimate: 25,
    };
  }

  // ── Combinatoire / dénombrement ───────────────────────────────────────────

  private generateCombinatoire(): GeneratedQuestion {
    const n = randomInt(4, 8);
    const k = randomInt(2, n - 1);
    const C = this.binom(n, k);
    return {
      id: hashQuestion(this.level, 'calculation', [n, k]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 3530,
      question: `C(${n}, ${k}) = ?`,
      answer: C.toString(),
      explanation: `C(${n},${k}) = ${n}! / (${k}! × ${n-k}!) = ${C}`,
      timeEstimate: 40,
    };
  }

  private binom(n: number, k: number): number {
    if (k === 0 || k === n) return 1;
    return this.binom(n - 1, k - 1) + this.binom(n - 1, k);
  }
}
