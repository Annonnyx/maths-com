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

  getAvailableDomains(): DomainType[] {
    return ['algebra', 'functions', 'complex', 'statistics'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domain = randomChoice(this.getAvailableDomains());
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
      timeEstimate: 20,
    };
  }
}
