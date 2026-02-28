import { GeneratedQuestion, QuestionGenerator, randomInt, randomFloat, randomChoice, shuffleArray } from './types';

export class FunctionsGenerator implements QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion {
    const generators = [
      () => this.generateLinearFunction(difficulty),
      () => this.generateQuadraticFunction(difficulty),
      () => this.generateDerivative(difficulty),
      () => this.generateVariation(difficulty),
      () => this.generateLimit(difficulty),
    ];

    // Select generators based on difficulty
    const availableGenerators = difficulty <= 6 
      ? generators.slice(0, 1) // Only linear functions
      : difficulty <= 8 
        ? generators.slice(0, 2) // + quadratic functions
        : difficulty <= 9 
          ? generators.slice(0, 4) // + derivatives and variations
          : generators; // All generators

    const generator = randomChoice(availableGenerators);
    return generator();
  }

  private generateLinearFunction(difficulty: number): GeneratedQuestion {
    let a: number, b: number, x: number;
    
    switch (difficulty) {
      case 1:
        a = randomInt(1, 3);
        b = randomInt(0, 5);
        x = randomInt(0, 3);
        break;
      case 2:
        a = randomInt(1, 5);
        b = randomInt(-2, 8);
        x = randomInt(0, 5);
        break;
      case 3:
        a = randomInt(1, 8);
        b = randomInt(-5, 10);
        x = randomInt(-2, 6);
        break;
      case 4:
        a = randomInt(2, 10);
        b = randomInt(-8, 15);
        x = randomInt(-5, 8);
        break;
      case 5:
        a = randomInt(3, 12);
        b = randomInt(-10, 20);
        x = randomInt(-8, 10);
        break;
      case 6:
        a = randomInt(5, 15);
        b = randomInt(-15, 25);
        x = randomInt(-10, 12);
        break;
      default:
        a = randomInt(1, 5);
        b = randomInt(0, 5);
        x = randomInt(0, 3);
    }

    const result = a * x + b;
    const wrongAnswers = [
      (result + a).toString(),
      (result - a).toString(),
      (a * x).toString(),
      (b).toString(),
    ].filter(ans => ans !== result.toString());

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `Soit f(x) = ${a}x ${b >= 0 ? '+' : ''} ${b}. Calcule f(${x}).`,
      answers,
      correct: result.toString(),
      explanation: `f(${x}) = ${a} × ${x} ${b >= 0 ? '+' : ''} ${b} = ${a * x} ${b >= 0 ? '+' : ''} ${b} = ${result}`,
      difficulty
    };
  }

  private generateQuadraticFunction(difficulty: number): GeneratedQuestion {
    let a: number, b: number, c: number, x: number;
    
    switch (difficulty) {
      case 7:
        a = randomInt(1, 3);
        b = randomInt(-5, 5);
        c = randomInt(-5, 5);
        x = randomInt(-3, 3);
        break;
      case 8:
        a = randomInt(1, 4);
        b = randomInt(-8, 8);
        c = randomInt(-8, 8);
        x = randomInt(-5, 5);
        break;
      case 9:
        a = randomInt(1, 5);
        b = randomInt(-10, 10);
        c = randomInt(-10, 10);
        x = randomInt(-6, 6);
        break;
      case 10:
        a = randomInt(1, 6);
        b = randomInt(-12, 12);
        c = randomInt(-12, 12);
        x = randomInt(-8, 8);
        break;
      default:
        a = 1; b = 0; c = 0; x = 2;
    }

    const result = a * x * x + b * x + c;
    const wrongAnswers = [
      (result + a).toString(),
      (result - a).toString(),
      (a * x + b).toString(),
      (x * x + b * x + c).toString(),
    ].filter(ans => ans !== result.toString());

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `Soit f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}. Calcule f(${x}).`,
      answers,
      correct: result.toString(),
      explanation: `f(${x}) = ${a} × ${x}² ${b >= 0 ? '+' : ''} ${b} × ${x} ${c >= 0 ? '+' : ''} ${c} = ${a} × ${x * x} ${b >= 0 ? '+' : ''} ${b * x} ${c >= 0 ? '+' : ''} ${c} = ${result}`,
      difficulty
    };
  }

  private generateDerivative(difficulty: number): GeneratedQuestion {
    let a: number, b: number, c: number;
    let functionType: 'linear' | 'quadratic' | 'cubic';
    
    switch (difficulty) {
      case 9:
        functionType = randomChoice(['linear', 'quadratic']);
        if (functionType === 'linear') {
          a = randomInt(2, 8);
          b = randomInt(-5, 10);
          c = 0; // Not used for linear
        } else {
          a = randomInt(1, 4);
          b = randomInt(-6, 6);
          c = randomInt(-5, 5);
        }
        break;
      case 10:
        functionType = randomChoice(['linear', 'quadratic', 'cubic']);
        if (functionType === 'linear') {
          a = randomInt(3, 10);
          b = randomInt(-8, 15);
          c = 0; // Not used for linear
        } else if (functionType === 'quadratic') {
          a = randomInt(2, 6);
          b = randomInt(-8, 8);
          c = randomInt(-8, 8);
        } else {
          a = randomInt(1, 3);
          b = randomInt(2, 6);
          c = randomInt(-5, 5);
        }
        break;
      default:
        functionType = 'linear';
        a = 2; b = 3; c = 0;
    }

    let derivative: string;
    let questionText: string;
    let explanation: string;

    switch (functionType) {
      case 'linear':
        derivative = a.toString();
        questionText = `Soit f(x) = ${a}x ${b >= 0 ? '+' : ''} ${b}. Quelle est f'(x) ?`;
        explanation = `La dérivée de ${a}x est ${a}, et la dérivée de ${b} est 0. Donc f'(x) = ${a}`;
        break;
      case 'quadratic':
        derivative = `${2 * a}x ${b >= 0 ? '+' : ''} ${b}`;
        questionText = `Soit f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}. Quelle est f'(x) ?`;
        explanation = `La dérivée de ${a}x² est ${2 * a}x, la dérivée de ${b}x est ${b}, et la dérivée de ${c} est 0. Donc f'(x) = ${2 * a}x ${b >= 0 ? '+' : ''} ${b}`;
        break;
      case 'cubic':
        derivative = `${3 * a}x² ${2 * b >= 0 ? '+' : ''} ${2 * b}`;
        questionText = `Soit f(x) = ${a}x³ ${b >= 0 ? '+' : ''} ${b}x² ${c >= 0 ? '+' : ''} ${c}x. Quelle est f'(x) ?`;
        explanation = `La dérivée de ${a}x³ est ${3 * a}x², la dérivée de ${b}x² est ${2 * b}x, et la dérivée de ${c}x est ${c}. Donc f'(x) = ${3 * a}x² ${2 * b >= 0 ? '+' : ''} ${2 * b}x ${c >= 0 ? '+' : ''} ${c}`;
        break;
    }

    const wrongAnswers = [
      `${a}x`,
      `${2 * a}x`,
      `${a}`,
      `${3 * a}x²`,
    ].filter(ans => ans !== derivative);

    const answers = shuffleArray([derivative, ...wrongAnswers.slice(0, 3)]);

    return {
      question: questionText,
      answers,
      correct: derivative,
      explanation,
      difficulty
    };
  }

  private generateVariation(difficulty: number): GeneratedQuestion {
    let a: number, vertex: number;
    
    switch (difficulty) {
      case 9:
        a = randomChoice([-3, -2, -1, 1, 2, 3]);
        vertex = randomInt(-5, 5);
        break;
      case 10:
        a = randomChoice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
        vertex = randomInt(-8, 8);
        break;
      default:
        a = 1; vertex = 0;
    }

    const variation = a > 0 ? 'croissante' : 'décroissante';
    const interval = a > 0 
      ? `[${vertex}; +∞)` 
      : `]-∞; ${vertex}]`;

    const wrongAnswers = [
      a > 0 ? 'décroissante' : 'croissante',
      a > 0 ? `]-∞; ${vertex}]` : `[${vertex}; +∞)`,
      'constante',
      'alternée',
    ];

    const answers = shuffleArray([variation, ...wrongAnswers.slice(0, 3)]);

    return {
      question: `Soit f(x) = ${a}(x - ${vertex})². Sur quel intervalle la fonction est-elle ${variation} ?`,
      answers,
      correct: interval,
      explanation: `Comme a = ${a} ${a > 0 ? '> 0' : '< 0'}, la parabole est ${a > 0 ? 'ouverte vers le haut' : 'ouverte vers le bas'}. La fonction est ${variation} sur ${interval}`,
      difficulty
    };
  }

  private generateLimit(difficulty: number): GeneratedQuestion {
    let a: number, b: number, limitType: 'infinity' | 'zero' | 'finite';
    
    switch (difficulty) {
      case 10:
        limitType = randomChoice(['infinity', 'zero', 'finite']);
        if (limitType === 'infinity') {
          a = randomInt(1, 5);
          b = randomInt(1, 5);
        } else if (limitType === 'zero') {
          a = randomInt(1, 5);
          b = randomInt(1, 5);
        } else {
          a = randomInt(2, 8);
          b = randomInt(-10, 10);
        }
        break;
      default:
        limitType = 'finite';
        a = 2; b = 3;
    }

    let limit: string;
    let questionText: string;
    let explanation: string;

    switch (limitType) {
      case 'infinity':
        limit = '+∞';
        questionText = `Calcule limₓ→+∞ (${a}x + ${b})`;
        explanation = `Quand x tend vers +∞, ${a}x tend vers +∞ et ${b} devient négligeable. Donc la limite est +∞`;
        break;
      case 'zero':
        limit = '0';
        questionText = `Calcule limₓ→+∞ (${a}/x + ${b}/x²)`;
        explanation = `Quand x tend vers +∞, ${a}/x tend vers 0 et ${b}/x² tend vers 0. Donc la limite est 0`;
        break;
      case 'finite':
        limit = a.toString();
        questionText = `Calcule limₓ→+∞ (${a} + ${b}/x)`;
        explanation = `Quand x tend vers +∞, ${b}/x tend vers 0. Donc la limite est ${a}`;
        break;
    }

    const wrongAnswers = [
      '-∞',
      '1',
      'n\'existe pas',
      (a + b).toString(),
    ].filter(ans => ans !== limit);

    const answers = shuffleArray([limit, ...wrongAnswers.slice(0, 3)]);

    return {
      question: questionText,
      answers,
      correct: limit,
      explanation,
      difficulty
    };
  }
}
