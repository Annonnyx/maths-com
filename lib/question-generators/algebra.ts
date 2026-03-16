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

    return randomChoice(generators)();
  }

  private generateLinearEquation(difficulty: number): GeneratedQuestion {
    let a: number, b: number, result: number;
    
    switch (difficulty) {
      case 1:
        a = randomInt(1, 3);
        b = randomInt(1, 10);
        result = randomInt(10, 30);
        break;
      case 2:
        a = randomInt(2, 5);
        b = randomInt(5, 15);
        result = randomInt(20, 50);
        break;
      case 3:
        a = randomInt(3, 8);
        b = randomInt(10, 20);
        result = randomInt(30, 80);
        break;
      default:
        a = randomInt(5, 12);
        b = randomInt(15, 30);
        result = randomInt(50, 120);
    }

    const x = (result - b) / a;

    const wrongAnswers = [
      (x + 1).toString(),
      (x - 1).toString(),
      (x + 2).toString(),
      (result / a).toString(), // Common mistake: dividing result by a without subtracting b
    ].filter(ans => ans !== x.toString() && Number(ans) >= 0);

    const answers = shuffleArray([x.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `algebra-${Date.now()}`,
      type: 'mcq',
      domain: 'algebra',
      level: 'CP',
      difficultyElo: 800,
      question: `${a}x + ${b} = ${result}`,
      answer: x.toString(),
      explanation: `${a}x + ${b} = ${result} → ${a}x = ${result - b} → x = ${x}`,
      options: answers,
      timeEstimate: 60
    };
  }

  private generateQuadraticEquation(difficulty: number): GeneratedQuestion {
    let a: number, b: number, c: number;
    
    switch (difficulty) {
      case 4:
        // Simple perfect squares
        const simpleRoots = [1, 2, 3, 4, 5];
        const root1 = randomChoice(simpleRoots);
        const root2 = randomChoice(simpleRoots.filter(r => r !== root1));
        a = 1;
        b = -(root1 + root2);
        c = root1 * root2;
        break;
      case 5:
        // More complex but still simple
        a = randomInt(1, 3);
        const roots = [[1, 6], [2, 3], [1, 8], [2, 4], [1, 10], [2, 5]];
        const selectedRoots = randomChoice(roots);
        b = -a * (selectedRoots[0] + selectedRoots[1]);
        c = a * selectedRoots[0] * selectedRoots[1];
        break;
      default:
        a = randomInt(1, 4);
        b = randomInt(-20, 20);
        c = randomInt(-20, 20);
    }

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      // Retry with different coefficients
      return this.generateQuadraticEquation(difficulty);
    }

    const sqrtDiscriminant = Math.sqrt(discriminant);
    const correctRoot = (-b + sqrtDiscriminant) / (2 * a);

    const wrongAnswers = [
      (correctRoot + 1).toString(),
      (correctRoot - 1).toString(),
      (-correctRoot).toString(),
      (b / a).toString(),
    ].filter(ans => ans !== correctRoot.toString());

    const answers = shuffleArray([correctRoot.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `quadratic-${Date.now()}`,
      type: 'mcq',
      domain: 'algebra',
      level: 'CP',
      difficultyElo: 1200,
      question: `${a}x² + ${b}x + ${c} = 0`,
      answer: correctRoot.toString(),
      explanation: `Δ = ${b}² - 4×${a}×${c} = ${b * b - 4 * a * c}, √Δ = ${sqrtDiscriminant.toFixed(2)}, x = (-${b} ± ${sqrtDiscriminant.toFixed(2)})/(2×${a}) = {${correctRoot.toFixed(2)}, ${((-b - sqrtDiscriminant) / (2 * a)).toFixed(2)}}`,
      options: answers,
      timeEstimate: 90
    };
  }

  private generateSystemOfEquations(difficulty: number): GeneratedQuestion {
    let a1: number, b1: number, c1: number, a2: number, b2: number, c2: number;
    
    switch (difficulty) {
      case 6:
        a1 = randomInt(1, 5);
        b1 = randomInt(1, 5);
        c1 = randomInt(10, 30);
        a2 = randomInt(1, 5);
        b2 = randomInt(1, 5);
        c2 = randomInt(10, 30);
        break;
      default:
        a1 = randomInt(2, 8);
        b1 = randomInt(2, 8);
        c1 = randomInt(20, 60);
        a2 = randomInt(2, 8);
        b2 = randomInt(2, 8);
        c2 = randomInt(20, 60);
    }

    // Solve the system: a1*x + b1*y = c1, a2*x + b2*y = c2
    const determinant = a1 * b2 - a2 * b1;
    if (determinant === 0) {
      // System has no unique solution, retry
      return this.generateSystemOfEquations(difficulty);
    }

    const x = (c1 * b2 - c2 * b1) / determinant;
    const y = (a1 * c2 - a2 * c1) / determinant;

    const wrongAnswers = [
      (x + 1).toString(),
      (x - 1).toString(),
      (y).toString(),
      (x + y).toString(),
    ].filter(ans => ans !== x.toString());

    const answers = shuffleArray([x.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `system-${Date.now()}`,
      type: 'mcq',
      domain: 'algebra',
      level: 'CP',
      difficultyElo: 1000,
      question: `${a1}x + ${b1}y = ${c1}\n${a2}x + ${b2}y = ${c2}\nQue vaut x ?`,
      answer: x.toString(),
      explanation: `Par substitution ou élimination : x = ${x}`,
      options: answers,
      timeEstimate: 120
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
        a = randomInt(1, 4);
        b = randomInt(1, 6);
        c = randomInt(1, 10);
        break;
      default:
        a = randomInt(2, 6);
        b = randomInt(2, 8);
        c = randomInt(5, 15);
    }

    const expanded = `${a * a}x² + ${(2 * a * b)}x + ${b * b}`;
    if (c !== 0) {
      expanded.replace(`${b * b}`, `${b * b + 2 * a * c}x + ${c * c}`);
    }

    const identityWrongAnswers = [
      `${a * a}x² + ${(a * b)}x + ${b * b}`,
      `${a * a}x² + ${(2 * a * b + 1)}x + ${b * b}`,
      `${(a - 1) * (a - 1)}x² + ${(2 * a * b)}x + ${b * b}`,
    ];

    const answers = shuffleArray([expanded, ...identityWrongAnswers.slice(0, 3)]);

    return {
      id: `identity-${Date.now()}`,
      type: 'mcq',
      domain: 'algebra',
      level: 'CP',
      difficultyElo: 1400,
      question: c !== 0
        ? `Développe : (${a}x + ${b})² + ${c}`
        : `Développe : (${a}x + ${b})²`,
      answer: expanded,
      explanation: `(${a}x + ${b})² = ${a}²x² + 2×${a}×${b}x + ${b}² = ${expanded}`,
      options: answers,
      timeEstimate: 90
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
          [1, 12], [2, 6], [3, 4], [1, 15], [3, 5], [1, 20], [4, 5]
        ];
        const pair9 = randomChoice(pairs9);
        a = 1;
        b = -(pair9[0] + pair9[1]);
        c = pair9[0] * pair9[1];
        break;
      default:
        a = randomInt(1, 3);
        const r1 = randomInt(1, 8);
        const r2 = randomInt(1, 8);
        b = -a * (r1 + r2);
        c = a * r1 * r2;
    }

    const r1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    const r2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

    const factorized = r1 === r2 
      ? `(x${r1 > 0 ? '+' : ''}${r1})²`
      : `(x${r1 > 0 ? '+' : ''}${r1})(x${r2 > 0 ? '+' : ''}${r2})`;

    const factorizationWrongAnswers = [
      `(x${r1 + 1 > 0 ? '+' : ''}${r1 + 1})(x${r2 > 0 ? '+' : ''}${r2})`,
      `(x${r1 > 0 ? '+' : ''}${r1})(x${r2 + 1 > 0 ? '+' : ''}${r2 + 1})`,
      `(x${-r1 > 0 ? '+' : ''}${-r1})(x${r2 > 0 ? '+' : ''}${r2})`,
    ];

    const answers = shuffleArray([factorized, ...factorizationWrongAnswers.slice(0, 3)]);

    return {
      id: `factorization-${Date.now()}`,
      type: 'mcq',
      domain: 'algebra',
      level: 'CP',
      difficultyElo: 1600,
      question: `Factorise : x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}`,
      answer: factorized,
      explanation: `x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} = (x${r1 > 0 ? '+' : ''}${r1})(x${r2 > 0 ? '+' : ''}${r2})`,
      options: answers,
      timeEstimate: 100
    };
  }
}
