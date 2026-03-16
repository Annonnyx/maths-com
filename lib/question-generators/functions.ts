import { GeneratedQuestion, QuestionGenerator, randomInt, randomFloat, randomChoice, shuffleArray } from './types';

export class FunctionsGenerator implements QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion {
    const generators = [
      () => this.generateLinearFunction(difficulty),
      () => this.generateQuadraticFunction(difficulty),
      () => this.generateDerivative(difficulty),
      () => this.generateParabolaAnalysis(difficulty),
      () => this.generateLimits(difficulty),
    ];

    return randomChoice(generators)();
  }

  private generateLinearFunction(difficulty: number): GeneratedQuestion {
    let a: number, b: number, x: number;
    
    switch (difficulty) {
      case 1:
        a = randomInt(1, 5);
        b = randomInt(1, 10);
        x = randomInt(1, 5);
        break;
      case 2:
        a = randomInt(-5, 5);
        b = randomInt(-10, 10);
        x = randomInt(-5, 5);
        break;
      default:
        a = randomInt(-10, 10);
        b = randomInt(-20, 20);
        x = randomInt(-10, 10);
    }

    const result = a * x + b;
    const wrongAnswers = [
      (result + a).toString(),
      (result - a).toString(),
      (a * x - b).toString(),
      (x + b).toString(),
    ].filter(ans => ans !== result.toString());

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `linear-function-${Date.now()}`,
      type: 'mcq',
      domain: 'functions',
      level: 'Sup1',
      difficultyElo: 2800,
      question: `Soit f(x) = ${a}x ${b >= 0 ? '+' : ''} ${b}. Calcule f(${x}).`,
      answer: result.toString(),
      explanation: `f(${x}) = ${a} × ${x} ${b >= 0 ? '+' : ''} ${b} = ${a * x} ${b >= 0 ? '+' : ''} ${b} = ${result}`,
      options: answers,
      timeEstimate: 60
    };
  }

  private generateQuadraticFunction(difficulty: number): GeneratedQuestion {
    let a: number, b: number, c: number, x: number;
    
    switch (difficulty) {
      case 3:
        a = randomInt(1, 3);
        b = randomInt(-5, 5);
        c = randomInt(-5, 5);
        x = randomInt(-3, 3);
        break;
      default:
        a = randomInt(1, 5);
        b = randomInt(-10, 10);
        c = randomInt(-10, 10);
        x = randomInt(-5, 5);
    }

    const result = a * x * x + b * x + c;
    const wrongAnswers = [
      (result + a).toString(),
      (result - a).toString(),
      (a * x + b * x + c).toString(),
      (x * x + b * x + c).toString(),
    ].filter(ans => ans !== result.toString());

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `quadratic-function-${Date.now()}`,
      type: 'mcq',
      domain: 'functions',
      level: 'Sup1',
      difficultyElo: 2900,
      question: `Soit f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}. Calcule f(${x}).`,
      answer: result.toString(),
      explanation: `f(${x}) = ${a} × ${x}² ${b >= 0 ? '+' : ''} ${b} × ${x} ${c >= 0 ? '+' : ''} ${c} = ${a} × ${x * x} ${b >= 0 ? '+' : ''} ${b * x} ${c >= 0 ? '+' : ''} ${c} = ${result}`,
      options: answers,
      timeEstimate: 90
    };
  }

  private generateDerivative(difficulty: number): GeneratedQuestion {
    let a: number, b: number, c: number;
    let questionText: string;
    let derivative: string;
    let explanation: string;
    
    switch (difficulty) {
      case 4:
        a = randomInt(1, 5);
        b = randomInt(-5, 5);
        questionText = `Soit f(x) = ${a}x ${b >= 0 ? '+' : ''} ${b}. Quelle est la dérivée f'(x) ?`;
        derivative = `${a}`;
        explanation = `La dérivée de ${a}x est ${a}, et la dérivée de ${b} est 0. Donc f'(x) = ${a}`;
        break;
      case 5:
        a = randomInt(1, 3);
        b = randomInt(-5, 5);
        c = randomInt(-5, 5);
        questionText = `Soit f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}. Quelle est la dérivée f'(x) ?`;
        derivative = `${2 * a}x ${b >= 0 ? '+' : ''} ${b}`;
        explanation = `La dérivée de ${a}x² est ${2 * a}x, la dérivée de ${b}x est ${b}, et la dérivée de ${c} est 0. Donc f'(x) = ${2 * a}x ${b >= 0 ? '+' : ''} ${b}`;
        break;
      default:
        a = randomInt(1, 3);
        b = randomInt(1, 3);
        c = randomInt(-5, 5);
        const d = randomInt(-5, 5);
        questionText = `Soit f(x) = ${a}x³ ${b >= 0 ? '+' : ''} ${b}x² ${c >= 0 ? '+' : ''} ${c}x ${d >= 0 ? '+' : ''} ${d}. Quelle est la dérivée f'(x) ?`;
        derivative = `${3 * a}x² ${b >= 0 ? '+' : ''} ${2 * b}x ${c >= 0 ? '+' : ''} ${c}`;
        explanation = `La dérivée de ${a}x³ est ${3 * a}x², la dérivée de ${b}x² est ${2 * b}x, la dérivée de ${c}x est ${c}, et la dérivée de ${d} est 0. Donc f'(x) = ${3 * a}x² ${b >= 0 ? '+' : ''} ${2 * b}x ${c >= 0 ? '+' : ''} ${c}`;
    }

    const wrongAnswers = [
      derivative.replace(/[0-9]/g, (match) => (parseInt(match) + 1).toString()),
      derivative.replace(/[0-9]/g, (match) => (parseInt(match) - 1).toString()),
      derivative.replace(/x/g, ''),
      derivative.replace(/x²/g, 'x'),
    ].filter(ans => ans !== derivative);

    const answers = shuffleArray([derivative, ...wrongAnswers.slice(0, 3)]);

    return {
      id: `derivative-${Date.now()}`,
      type: 'mcq',
      domain: 'functions',
      level: 'Sup2',
      difficultyElo: 3100,
      question: questionText,
      answer: derivative,
      explanation,
      options: answers,
      timeEstimate: 120
    };
  }

  private generateParabolaAnalysis(difficulty: number): GeneratedQuestion {
    let a: number, vertex: number;
    let variation: string;
    let interval: string;
    
    switch (difficulty) {
      case 6:
        a = randomChoice([1, 2, -1, -2]);
        vertex = randomInt(-5, 5);
        variation = a > 0 ? 'croissante' : 'décroissante';
        interval = a > 0 ? `[${vertex}, +∞)` : `(-∞, ${vertex}]`;
        break;
      default:
        a = randomChoice([3, 4, -3, -4]);
        vertex = randomInt(-10, 10);
        variation = a > 0 ? 'croissante' : 'décroissante';
        interval = a > 0 ? `[${vertex}, +∞)` : `(-∞, ${vertex}]`;
    }

    const wrongAnswers = [
      a > 0 ? `(-∞, ${vertex}]` : `[${vertex}, +∞)`,
      a > 0 ? `[${vertex - 1}, +∞)` : `(-∞, ${vertex + 1}]`,
      a > 0 ? `[${vertex + 1}, +∞)` : `(-∞, ${vertex - 1}]`,
      `ℝ`,
    ].filter(ans => ans !== interval);

    const answers = shuffleArray([interval, ...wrongAnswers.slice(0, 3)]);

    return {
      id: `parabola-${Date.now()}`,
      type: 'mcq',
      domain: 'functions',
      level: 'Sup2',
      difficultyElo: 3200,
      question: `Soit f(x) = ${a}(x - ${vertex})². Sur quel intervalle la fonction est-elle ${variation} ?`,
      answer: interval,
      explanation: `Comme a = ${a} ${a > 0 ? '> 0' : '< 0'}, la parabole est ${a > 0 ? 'ouverte vers le haut' : 'ouverte vers le bas'}. La fonction est ${variation} sur ${interval}`,
      options: answers,
      timeEstimate: 90
    };
  }

  private generateLimits(difficulty: number): GeneratedQuestion {
    let questionText: string;
    let limit: string;
    let explanation: string;
    
    switch (difficulty) {
      case 7:
        const a1 = randomInt(1, 5);
        const b1 = randomInt(-5, 5);
        questionText = `Calcule limₓ→+∞ (${a1}x + ${b1})`;
        limit = '+∞';
        explanation = `Quand x → +∞, ${a1}x → +∞, donc ${a1}x + ${b1} → +∞`;
        break;
      case 8:
        const a2 = randomInt(-5, -1);
        const b2 = randomInt(-5, 5);
        questionText = `Calcule limₓ→+∞ (${a2}x + ${b2})`;
        limit = '-∞';
        explanation = `Quand x → +∞, ${a2}x → -∞ (car a2 < 0), donc ${a2}x + ${b2} → -∞`;
        break;
      default:
        const a3 = randomInt(1, 3);
        const b3 = randomInt(1, 3);
        const c3 = randomInt(-5, 5);
        questionText = `Calcule limₓ→+∞ (${a3}x² ${b3 >= 0 ? '+' : ''} ${b3}x ${c3 >= 0 ? '+' : ''} ${c3})`;
        limit = '+∞';
        explanation = `Quand x → +∞, le terme ${a3}x² domine, et ${a3}x² → +∞, donc la limite est +∞`;
    }

    const wrongAnswers = [
      limit === '+∞' ? '-∞' : '+∞',
      '0',
      '1',
      `limₓ→-∞ (...)`,
    ].filter(ans => ans !== limit);

    const answers = shuffleArray([limit, ...wrongAnswers.slice(0, 3)]);

    return {
      id: `limits-${Date.now()}`,
      type: 'mcq',
      domain: 'functions',
      level: 'Sup3',
      difficultyElo: 3500,
      question: questionText,
      answer: limit,
      explanation,
      options: answers,
      timeEstimate: 90
    };
  }
}
