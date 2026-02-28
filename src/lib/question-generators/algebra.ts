import { GeneratedQuestion, QuestionGenerator, randomInt, randomFloat, randomChoice, shuffleArray } from './types';

export class AlgebraGenerator implements QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion {
    const generators = [
      () => this.generateLinearEquation(difficulty),
      () => this.generateQuadraticEquation(difficulty),
      () => this.generateSystemOfEquations(difficulty),
      () => this.generateIdentityExpansion(difficulty),
      () => this.generateFactorization(difficulty),
    ];

    // Select generators based on difficulty
    const availableGenerators = difficulty <= 3 
      ? generators.slice(0, 1) // Only linear equations
      : difficulty <= 6 
        ? generators.slice(0, 3) // Linear + quadratic + systems
        : difficulty <= 8 
          ? generators.slice(0, 4) // + identities
          : generators; // All generators

    const generator = randomChoice(availableGenerators);
    return generator();
  }

  private generateLinearEquation(difficulty: number): GeneratedQuestion {
    let a: number, b: number, x: number;
    
    switch (difficulty) {
      case 1:
        a = randomInt(1, 5);
        x = randomInt(1, 5);
        b = randomInt(1, 10);
        break;
      case 2:
        a = randomInt(2, 8);
        x = randomInt(1, 8);
        b = randomInt(5, 20);
        break;
      case 3:
        a = randomInt(3, 10);
        x = randomInt(2, 10);
        b = randomInt(10, 30);
        break;
      case 4:
        a = randomInt(5, 15);
        x = randomInt(2, 15);
        b = randomInt(20, 50);
        break;
      case 5:
        a = randomInt(8, 20);
        x = randomInt(3, 20);
        b = randomInt(30, 80);
        break;
      case 6:
        a = randomInt(10, 25);
        x = randomInt(5, 25);
        b = randomInt(50, 120);
        break;
      case 7:
        a = randomInt(15, 30);
        x = randomInt(5, 30);
        b = randomInt(80, 200);
        break;
      case 8:
        a = randomInt(20, 40);
        x = randomInt(10, 40);
        b = randomInt(120, 300);
        break;
      case 9:
        a = randomInt(25, 50);
        x = randomInt(10, 50);
        b = randomInt(200, 500);
        break;
      case 10:
        a = randomInt(30, 100);
        x = randomInt(20, 100);
        b = randomInt(300, 1000);
        break;
      default:
        a = randomInt(2, 8);
        x = randomInt(1, 8);
        b = randomInt(5, 20);
    }

    const result = a * x + b;
    const wrongAnswers = [
      (x + 1).toString(),
      (x - 1).toString(),
      (x + 2).toString(),
      (result / a).toString(), // Common mistake: dividing result by a without subtracting b
    ].filter(ans => ans !== x.toString() && Number(ans) >= 0);

    const answers = shuffleArray([x.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `${a}x + ${b} = ${result}`,
      answers,
      correct: x.toString(),
      explanation: `${a}x + ${b} = ${result} → ${a}x = ${result - b} → x = ${x}`,
      difficulty
    };
  }

  private generateQuadraticEquation(difficulty: number): GeneratedQuestion {
    let a: number, b: number, c: number;
    
    switch (difficulty) {
      case 4:
        // Simple perfect squares
        const simpleRoots = [1, 2, 3, 4, 5];
        const r1 = randomChoice(simpleRoots);
        const r2 = randomChoice(simpleRoots.filter(r => r !== r1));
        a = 1;
        b = -(r1 + r2);
        c = r1 * r2;
        break;
      case 5:
        const roots5 = [1, 2, 3, 4, 5, 6, 7];
        const root1 = randomChoice(roots5);
        const root2 = randomChoice(roots5.filter(r => r !== root1));
        a = 1;
        b = -(root1 + root2);
        c = root1 * root2;
        break;
      case 6:
        const roots6 = [2, 3, 4, 5, 6, 7, 8, 9];
        const rootA = randomChoice(roots6);
        const rootB = randomChoice(roots6.filter(r => r !== rootA));
        a = 1;
        b = -(rootA + rootB);
        c = rootA * rootB;
        break;
      case 7:
        const roots7 = [3, 4, 5, 6, 7, 8, 9, 10, 11];
        const rootX = randomChoice(roots7);
        const rootY = randomChoice(roots7.filter(r => r !== rootX));
        a = 1;
        b = -(rootX + rootY);
        c = rootX * rootY;
        break;
      case 8:
        a = randomInt(1, 3);
        const r1_8 = randomInt(1, 8);
        const r2_8 = randomInt(1, 8);
        b = -a * (r1_8 + r2_8);
        c = a * r1_8 * r2_8;
        break;
      case 9:
        a = randomInt(1, 4);
        const r1_9 = randomInt(2, 10);
        const r2_9 = randomInt(2, 10);
        b = -a * (r1_9 + r2_9);
        c = a * r1_9 * r2_9;
        break;
      case 10:
        a = randomInt(1, 5);
        const r1_10 = randomInt(3, 12);
        const r2_10 = randomInt(3, 12);
        b = -a * (r1_10 + r2_10);
        c = a * r1_10 * r2_10;
        break;
      default:
        a = 1;
        b = -5;
        c = 6; // (x-2)(x-3) = x²-5x+6
    }

    // Calculate discriminant to ensure real roots
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      // Fallback to simple case
      a = 1;
      b = -5;
      c = 6;
    }

    const sqrtDiscriminant = Math.sqrt(b * b - 4 * a * c);
    const x1 = (-b + sqrtDiscriminant) / (2 * a);
    const x2 = (-b - sqrtDiscriminant) / (2 * a);

    // Use the integer root if available
    const correctRoot = Number.isInteger(x1) ? x1 : x2;
    const wrongAnswers = [
      (correctRoot + 1).toString(),
      (correctRoot - 1).toString(),
      (-correctRoot).toString(),
      (b / a).toString(),
    ].filter(ans => ans !== correctRoot.toString());

    const answers = shuffleArray([correctRoot.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `${a}x² + ${b}x + ${c} = 0`,
      answers,
      correct: correctRoot.toString(),
      explanation: `Δ = ${b}² - 4×${a}×${c} = ${b * b - 4 * a * c}, √Δ = ${sqrtDiscriminant.toFixed(2)}, x = (-${b} ± ${sqrtDiscriminant.toFixed(2)})/(2×${a}) = {${correctRoot.toFixed(2)}, ${((-b - sqrtDiscriminant) / (2 * a)).toFixed(2)}}`,
      difficulty
    };
  }

  private generateSystemOfEquations(difficulty: number): GeneratedQuestion {
    let a1: number, b1: number, c1: number, a2: number, b2: number, c2: number;
    
    switch (difficulty) {
      case 4:
        a1 = randomInt(1, 5);
        b1 = randomInt(1, 5);
        a2 = randomInt(1, 5);
        b2 = randomInt(1, 5);
        break;
      case 5:
        a1 = randomInt(2, 8);
        b1 = randomInt(2, 8);
        a2 = randomInt(2, 8);
        b2 = randomInt(2, 8);
        break;
      case 6:
        a1 = randomInt(3, 10);
        b1 = randomInt(3, 10);
        a2 = randomInt(3, 10);
        b2 = randomInt(3, 10);
        break;
      case 7:
        a1 = randomInt(5, 15);
        b1 = randomInt(5, 15);
        a2 = randomInt(5, 15);
        b2 = randomInt(5, 15);
        break;
      case 8:
        a1 = randomInt(8, 20);
        b1 = randomInt(8, 20);
        a2 = randomInt(8, 20);
        b2 = randomInt(8, 20);
        break;
      case 9:
        a1 = randomInt(10, 25);
        b1 = randomInt(10, 25);
        a2 = randomInt(10, 25);
        b2 = randomInt(10, 25);
        break;
      case 10:
        a1 = randomInt(15, 30);
        b1 = randomInt(15, 30);
        a2 = randomInt(15, 30);
        b2 = randomInt(15, 30);
        break;
      default:
        a1 = randomInt(2, 5);
        b1 = randomInt(2, 5);
        a2 = randomInt(2, 5);
        b2 = randomInt(2, 5);
    }

    // Ensure the system has a unique solution
    const determinant = a1 * b2 - a2 * b1;
    if (Math.abs(determinant) < 1) {
      // Fallback to simple case
      a1 = 2; b1 = 3;
      a2 = 1; b2 = 4;
    }

    const x = randomInt(1, 10);
    const y = randomInt(1, 10);
    c1 = a1 * x + b1 * y;
    c2 = a2 * x + b2 * y;

    const wrongAnswers = [
      (x + 1).toString(),
      (x - 1).toString(),
      (y).toString(),
      (x + y).toString(),
    ].filter(ans => ans !== x.toString());

    const answers = shuffleArray([x.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `${a1}x + ${b1}y = ${c1}\n${a2}x + ${b2}y = ${c2}\nQue vaut x ?`,
      answers,
      correct: x.toString(),
      explanation: `Par substitution ou élimination : x = ${x}`,
      difficulty
    };
  }

  private generateIdentityExpansion(difficulty: number): GeneratedQuestion {
    let a: number, b: number, c: number;
    
    switch (difficulty) {
      case 7:
        a = randomInt(1, 5);
        b = randomInt(1, 5);
        c = 0;
        break;
      case 8:
        a = randomInt(2, 8);
        b = randomInt(2, 8);
        c = randomInt(1, 5);
        break;
      case 9:
        a = randomInt(3, 10);
        b = randomInt(3, 10);
        c = randomInt(2, 8);
        break;
      case 10:
        a = randomInt(5, 15);
        b = randomInt(5, 15);
        c = randomInt(3, 12);
        break;
      default:
        a = 2; b = 3; c = 1;
    }

    const expanded = `${a * a}x² + ${(2 * a * b)}x + ${b * b}`;
    if (c !== 0) {
      expanded.replace(`${b * b}`, `${b * b + 2 * a * c}x + ${c * c}`);
    }

    const wrongAnswers = [
      `${a * a}x² + ${(a * b)}x + ${b * b}`,
      `${a * a}x² + ${(2 * a * b + 1)}x + ${b * b}`,
      `${(a - 1) * (a - 1)}x² + ${(2 * a * b)}x + ${b * b}`,
    ];

    const answers = shuffleArray([expanded, ...wrongAnswers.slice(0, 3)]);

    return {
      question: c === 0 
        ? `Développe : (${a}x + ${b})²`
        : `Développe : (${a}x + ${b})² + ${c}`,
      answers,
      correct: expanded,
      explanation: `(${a}x + ${b})² = ${a}²x² + 2×${a}×${b}x + ${b}² = ${expanded}`,
      difficulty
    };
  }

  private generateFactorization(difficulty: number): GeneratedQuestion {
    let a: number, b: number, c: number;
    
    switch (difficulty) {
      case 8:
        const simplePairs = [
          [1, 6], [2, 3], [1, 8], [2, 4], [1, 10], [2, 5]
        ];
        const pair = randomChoice(simplePairs);
        a = 1;
        b = -(pair[0] + pair[1]);
        c = pair[0] * pair[1];
        break;
      case 9:
        const pairs9 = [
          [2, 8], [3, 7], [4, 6], [2, 9], [3, 8], [4, 7], [5, 6]
        ];
        const pair9 = randomChoice(pairs9);
        a = 1;
        b = -(pair9[0] + pair9[1]);
        c = pair9[0] * pair9[1];
        break;
      case 10:
        const pairs10 = [
          [3, 10], [4, 9], [5, 8], [6, 7], [4, 12], [5, 11], [6, 10], [7, 9]
        ];
        const pair10 = randomChoice(pairs10);
        a = 1;
        b = -(pair10[0] + pair10[1]);
        c = pair10[0] * pair10[1];
        break;
      default:
        a = 1; b = -5; c = 6; // x² - 5x + 6 = (x-2)(x-3)
    }

    const r1 = -b / 2 + Math.sqrt(b * b - 4 * c) / 2;
    const r2 = -b / 2 - Math.sqrt(b * b - 4 * c) / 2;
    const factorized = `(x${r1 > 0 ? '+' : ''}${r1})(x${r2 > 0 ? '+' : ''}${r2})`;

    const wrongAnswers = [
      `(x${r1 > 0 ? '+' : ''}${r1 + 1})(x${r2 > 0 ? '+' : ''}${r2})`,
      `(x${r1 > 0 ? '+' : ''}${r1})(x${r2 > 0 ? '+' : ''}${r2 + 1})`,
      `(x${r1 > 0 ? '+' : ''}${r1 - 1})(x${r2 > 0 ? '+' : ''}${r2})`,
    ];

    const answers = shuffleArray([factorized, ...wrongAnswers.slice(0, 3)]);

    return {
      question: `Factorise : x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}`,
      answers,
      correct: factorized,
      explanation: `x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} = (x${r1 > 0 ? '+' : ''}${r1})(x${r2 > 0 ? '+' : ''}${r2})`,
      difficulty
    };
  }
}
