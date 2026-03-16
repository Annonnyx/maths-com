// ============================================================================
// SUP2.TS — Générateur niveau Supérieur 2 (ELO 3000-3499) — L2 / CPGE 2ème année
// ============================================================================
// DOMAINES : Analyse complexe (séries, résidus), Topologie, Algèbre (groupes,
//            anneaux), Probabilités (lois continues, TCL, loi des grands nombres)
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class Sup2Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'Sup2';
  private readonly eloRange = { min: 3000, max: 3499 };

  getEloRange() { return this.eloRange; }

  getAvailableDomains(_excludeGeometry: boolean): DomainType[] {
    return ['algebra', 'functions', 'complex', 'statistics'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domain = randomChoice(this.getAvailableDomains(context.excludeGeometry));
    switch (domain) {
      case 'algebra':    return this.generateAlgebra();
      case 'functions':  return this.generateAnalysis();
      case 'complex':    return this.generateComplex();
      case 'statistics': return this.generateProbability();
      default:           return this.generateAlgebra();
    }
  }

  // ── Algèbre (groupes / anneaux) ──────────────────────────────────────────

  private generateAlgebra(): GeneratedQuestion {
    return randomChoice([
      () => this.generateGroupOrder(),
      () => this.generateRingQuestion(),
      () => this.generateEigenvalues(),
    ])();
  }

  private generateGroupOrder(): GeneratedQuestion {
    const primes = [2, 3, 5, 7, 11, 13];
    const p = randomChoice(primes);
    const n = randomInt(2, 5);
    const order = Math.pow(p, n);
    return {
      id: hashQuestion(this.level, 'algebra', [p, n]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 3050,
      question: `Quel est l'ordre du groupe ℤ/${order}ℤ ?`,
      answer: order.toString(),
      explanation: `ℤ/nℤ est un groupe cyclique d'ordre n. Ici n = ${p}^${n} = ${order}.`,
      timeEstimate: 25,
    };
  }

  private generateRingQuestion(): GeneratedQuestion {
    const p = randomChoice([2, 3, 5, 7]);
    return {
      id: hashQuestion(this.level, 'algebra', [p, 0]),
      type: 'mcq',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 3150,
      question: `ℤ/${p}ℤ est-il un corps ?`,
      answer: p <= 7 ? `Oui, car ${p} est premier` : `Non, car ${p} n'est pas premier`,
      options: shuffleArray([
        `Oui, car ${p} est premier`,
        `Non, car ${p} n'est pas premier`,
        `Oui, toujours pour ℤ/nℤ`,
        `Non, ℤ/nℤ n'est jamais un corps`,
      ]),
      explanation: `ℤ/pℤ est un corps si et seulement si p est premier. ${p} est premier → c'est un corps.`,
      timeEstimate: 30,
    };
  }

  private generateEigenvalues(): GeneratedQuestion {
    // Matrice 2x2 avec valeurs propres entières
    const l1 = randomInt(-3, 3);
    const l2 = randomInt(-3, 3);
    const trace = l1 + l2;
    const det = l1 * l2;
    return {
      id: hashQuestion(this.level, 'algebra', [l1, l2]),
      type: 'expression',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 3200,
      question: `Matrice A avec tr(A)=${trace} et det(A)=${det}. Valeurs propres ?`,
      answer: `${l1} et ${l2}`,
      acceptableAnswers: [`${l1} et ${l2}`, `${l2} et ${l1}`, `{${l1},${l2}}`, `{${l2},${l1}}`],
      explanation: `Polynôme caract. : λ²-${trace}λ+${det}=0. Racines : λ=${l1} et λ=${l2}`,
      timeEstimate: 60,
    };
  }

  // ── Analyse ───────────────────────────────────────────────────────────────

  private generateAnalysis(): GeneratedQuestion {
    return randomChoice([
      () => this.generateSeriesConvergence(),
      () => this.generateFourierCoeff(),
      () => this.generateTopologyQuestion(),
    ])();
  }

  private generateSeriesConvergence(): GeneratedQuestion {
    const series = [
      { expr: 'Σ 1/n²',     converges: true,  raison: 'série de Riemann, p=2>1' },
      { expr: 'Σ 1/n',      converges: false, raison: 'série harmonique divergente' },
      { expr: 'Σ 1/n^(3/2)',converges: true,  raison: 'série de Riemann, p=3/2>1' },
      { expr: 'Σ (-1)^n/n', converges: true,  raison: 'critère des séries alternées' },
      { expr: 'Σ n/2^n',    converges: true,  raison: 'série géométrique-puissance' },
      { expr: 'Σ 1/ln(n)',  converges: false, raison: 'comparaison avec 1/n' },
    ];
    const s = randomChoice(series);
    return {
      id: hashQuestion(this.level, 'functions', [series.indexOf(s)]),
      type: 'mcq',
      domain: 'functions',
      level: this.level,
      difficultyElo: 3100,
      question: `La série ${s.expr} (n≥2) est-elle convergente ?`,
      answer: s.converges ? 'Oui, convergente' : 'Non, divergente',
      options: shuffleArray(['Oui, convergente', 'Non, divergente', 'On ne peut pas savoir', 'Conditionnellement convergente']),
      explanation: `${s.expr} : ${s.raison}`,
      timeEstimate: 45,
    };
  }

  private generateFourierCoeff(): GeneratedQuestion {
    const n = randomInt(1, 4);
    return {
      id: hashQuestion(this.level, 'functions', [n, 10]),
      type: 'mcq',
      domain: 'functions',
      level: this.level,
      difficultyElo: 3350,
      question: `Le coefficient de Fourier a_n de f(x)=1 sur [-π,π] vaut :`,
      answer: n === 0 ? '2π' : '0',
      options: shuffleArray(['0', '1', '2π', '1/π']),
      explanation: `Pour f(x)=1, a_n = (1/π)∫₋ᵨᵨ cos(nx)dx = 0 pour n≥1 (intégrale d'un cosinus sur période entière).`,
      timeEstimate: 50,
    };
  }

  private generateTopologyQuestion(): GeneratedQuestion {
    return {
      id: hashQuestion(this.level, 'functions', [99]),
      type: 'mcq',
      domain: 'functions',
      level: this.level,
      difficultyElo: 3250,
      question: `L'ensemble ]0,1[ ⊂ ℝ est-il compact ?`,
      answer: 'Non, il n\'est pas fermé',
      options: shuffleArray([
        'Oui, il est borné',
        "Non, il n'est pas fermé",
        'Oui, il est connexe',
        'Non, il est non borné',
      ]),
      explanation: `Un compact de ℝ est fermé ET borné (Heine-Borel). ]0,1[ est borné mais pas fermé → non compact.`,
      timeEstimate: 35,
    };
  }

  // ── Nombres complexes / analyse complexe ─────────────────────────────────

  private generateComplex(): GeneratedQuestion {
    return randomChoice([
      () => this.generateComplexForm(),
      () => this.generateResidue(),
    ])();
  }

  private generateComplexForm(): GeneratedQuestion {
    const angles = [
      { rad: 'π/6', deg: 30, re: '√3/2', im: '1/2' },
      { rad: 'π/4', deg: 45, re: '√2/2', im: '√2/2' },
      { rad: 'π/3', deg: 60, re: '1/2',  im: '√3/2' },
      { rad: 'π/2', deg: 90, re: '0',    im: '1' },
    ];
    const { rad, re, im } = randomChoice(angles);
    const r = randomInt(1, 4);
    return {
      id: hashQuestion(this.level, 'complex', [r, angles.findIndex(a => a.rad === rad)]),
      type: 'expression',
      domain: 'complex',
      level: this.level,
      difficultyElo: 3050,
      question: `Forme algébrique de z = ${r > 1 ? r : ''}e^(i${rad})`,
      answer: `${r > 1 ? r+'×' : ''}${re} + ${r > 1 ? r+'×' : ''}${im}i`,
      explanation: `e^(iθ) = cos(θ) + i·sin(θ). Ici : ${r}(${re} + ${im}i)`,
      timeEstimate: 40,
    };
  }

  private generateResidue(): GeneratedQuestion {
    const a = randomInt(1, 4);
    return {
      id: hashQuestion(this.level, 'complex', [a, 50]),
      type: 'numeric',
      domain: 'complex',
      level: this.level,
      difficultyElo: 3400,
      question: `Résidu de f(z) = 1/(z-${a}) en z = ${a}`,
      answer: '1',
      explanation: `f a un pôle simple en z=${a}. Résidu = lim(z→${a}) (z-${a})·f(z) = 1.`,
      timeEstimate: 30,
    };
  }

  // ── Probabilités continues ────────────────────────────────────────────────

  private generateProbability(): GeneratedQuestion {
    const laws = [
      { name: 'N(0,1)', mean: 0, var_: 1 },
      { name: 'N(2,4)', mean: 2, var_: 4 },
      { name: 'Exp(λ=1)', mean: 1, var_: 1 },
    ];
    const law = randomChoice(laws);
    const q = randomChoice(['espérance', 'variance']);
    const answer = q === 'espérance' ? law.mean : law.var_;
    return {
      id: hashQuestion(this.level, 'statistics', [laws.indexOf(law)]),
      type: 'numeric',
      domain: 'statistics',
      level: this.level,
      difficultyElo: 3080,
      question: `X ~ ${law.name}. ${q === 'espérance' ? 'E[X]' : 'Var(X)'} = ?`,
      answer: answer.toString(),
      explanation: `Pour ${law.name} : E[X]=${law.mean}, Var(X)=${law.var_}`,
      timeEstimate: 20,
    };
  }
}


// ============================================================================
// SUP3.TS — Générateur niveau Supérieur 3 (ELO 3500-3999) — L3 / M1 / CPGE
// ============================================================================
// DOMAINES : Analyse fonctionnelle, Géométrie différentielle, Théorie des groupes
//            avancée, EDO/EDP, Probabilités (martingales, processus stochastiques)
// ============================================================================

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
