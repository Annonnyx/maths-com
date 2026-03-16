import { GeneratedQuestion, QuestionGenerator, randomInt, randomFloat, randomChoice, shuffleArray } from './types';

export class ArithmeticGenerator implements QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion {
    // Weight distribution to avoid pattern over-representation
    // Higher difficulty levels should have more operation variety
    let generators: Array<() => GeneratedQuestion> = [];
    let weights: number[] = [];
    
    if (difficulty <= 2) {
      generators = [
        () => this.generateAddition(difficulty),
        () => this.generateSubtraction(difficulty),
      ];
      weights = [0.6, 0.4];
    } else if (difficulty <= 4) {
      generators = [
        () => this.generateAddition(difficulty),
        () => this.generateSubtraction(difficulty),
        () => this.generateMultiplication(difficulty),
      ];
      weights = [0.4, 0.3, 0.3];
    } else if (difficulty <= 6) {
      generators = [
        () => this.generateAddition(difficulty),
        () => this.generateSubtraction(difficulty),
        () => this.generateMultiplication(difficulty),
        () => this.generateDivision(difficulty),
      ];
      weights = [0.25, 0.25, 0.25, 0.25];
    } else if (difficulty <= 8) {
      generators = [
        () => this.generateMultiplication(difficulty),
        () => this.generateDivision(difficulty),
        () => this.generatePower(difficulty),
        () => this.generateSquareRoot(difficulty),
      ];
      weights = [0.3, 0.3, 0.2, 0.2];
    } else {
      generators = [
        () => this.generateMultiplication(difficulty),
        () => this.generateDivision(difficulty),
        () => this.generatePower(difficulty),
        () => this.generateSquareRoot(difficulty),
        () => this.generatePercentage(difficulty),
        () => this.generateMixedOperations(difficulty),
      ];
      weights = [0.2, 0.2, 0.2, 0.15, 0.15, 0.1];
    }

    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return generators[i]();
      }
    }
    
    return generators[0]();
  }

  private generateAddition(difficulty: number): GeneratedQuestion {
    let a: number, b: number;
    
    switch (difficulty) {
      case 1:
        a = randomInt(1, 9);
        b = randomInt(1, 9);
        break;
      case 2:
        a = randomInt(10, 99);
        b = randomInt(10, 99);
        break;
      default:
        a = randomInt(100, 999);
        b = randomInt(100, 999);
    }

    const result = a + b;
    const wrongAnswers = [
      (result + 1).toString(),
      (result - 1).toString(),
      (a + b + 10).toString(),
      (a + b - 10).toString(),
    ].filter(ans => ans !== result.toString());

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `addition-${Date.now()}`,
      type: 'mcq',
      domain: 'arithmetic',
      level: 'CP',
      difficultyElo: 600,
      question: `${a} + ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} + ${b} = ${result}`,
      options: answers,
      timeEstimate: 30
    };
  }

  private generateSubtraction(difficulty: number): GeneratedQuestion {
    let a: number, b: number;
    
    switch (difficulty) {
      case 1:
        a = randomInt(10, 20);
        b = randomInt(1, 9);
        break;
      case 2:
        a = randomInt(50, 100);
        b = randomInt(10, 49);
        break;
      default:
        a = randomInt(200, 1000);
        b = randomInt(50, 199);
    }

    const result = a - b;
    const wrongAnswers = [
      (result + 1).toString(),
      (result - 1).toString(),
      (a - b + 10).toString(),
      (b - a).toString(), // Common mistake: reversing subtraction
    ].filter(ans => ans !== result.toString() && Number(ans) >= 0);

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `subtraction-${Date.now()}`,
      type: 'mcq',
      domain: 'arithmetic',
      level: 'CP',
      difficultyElo: 700,
      question: `${a} - ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} - ${b} = ${result}`,
      options: answers,
      timeEstimate: 30
    };
  }

  private generateMultiplication(difficulty: number): GeneratedQuestion {
    let a: number, b: number;
    
    switch (difficulty) {
      case 3:
        a = randomInt(2, 9);
        b = randomInt(2, 9);
        break;
      case 4:
        a = randomInt(10, 20);
        b = randomInt(2, 9);
        break;
      default:
        a = randomInt(15, 30);
        b = randomInt(10, 25);
    }

    const result = a * b;
    const wrongAnswers = [
      (result + a).toString(),
      (result + b).toString(),
      (a * b + 10).toString(),
      ((a + 1) * b).toString(),
    ].filter(ans => ans !== result.toString());

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `multiplication-${Date.now()}`,
      type: 'mcq',
      domain: 'arithmetic',
      level: 'CP',
      difficultyElo: 900,
      question: `${a} × ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} × ${b} = ${result}`,
      options: answers,
      timeEstimate: 45
    };
  }

  private generateDivision(difficulty: number): GeneratedQuestion {
    let divisor: number, quotient: number;
    
    switch (difficulty) {
      case 5:
        divisor = randomInt(2, 9);
        quotient = randomInt(2, 9);
        break;
      case 6:
        divisor = randomInt(2, 12);
        quotient = randomInt(5, 15);
        break;
      default:
        divisor = randomInt(3, 15);
        quotient = randomInt(10, 30);
    }

    const dividend = divisor * quotient;
    const wrongAnswers = [
      (quotient + 1).toString(),
      (quotient - 1).toString(),
      (dividend / (divisor + 1)).toString(),
      (dividend / (divisor - 1)).toString(),
    ].filter(ans => ans !== quotient.toString() && Number(ans) > 0);

    const answers = shuffleArray([quotient.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `division-${Date.now()}`,
      type: 'mcq',
      domain: 'arithmetic',
      level: 'CP',
      difficultyElo: 1100,
      question: `${dividend} ÷ ${divisor} = ?`,
      answer: quotient.toString(),
      explanation: `${dividend} ÷ ${divisor} = ${quotient}`,
      options: answers,
      timeEstimate: 60
    };
  }

  private generatePower(difficulty: number): GeneratedQuestion {
    let base: number, exponent: number;
    
    switch (difficulty) {
      case 7:
        base = randomInt(2, 8);
        exponent = randomInt(2, 4);
        break;
      case 8:
        base = randomInt(2, 12);
        exponent = randomInt(2, 4);
        break;
      default:
        base = randomInt(3, 15);
        exponent = randomInt(2, 5);
    }

    const result = Math.pow(base, exponent);
    const wrongAnswers = [
      (base * exponent).toString(),
      (base + exponent).toString(),
      Math.pow(base + 1, exponent).toString(),
      Math.pow(base, exponent + 1).toString(),
    ].filter(ans => ans !== result.toString());

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `power-${Date.now()}`,
      type: 'mcq',
      domain: 'arithmetic',
      level: 'CP',
      difficultyElo: 1300,
      question: `${base}^${exponent} = ?`,
      answer: result.toString(),
      explanation: `${base}^${exponent} = ${Array(exponent).fill(base).join(' × ')} = ${result}`,
      options: answers,
      timeEstimate: 75
    };
  }

  private generateSquareRoot(difficulty: number): GeneratedQuestion {
    let number: number;
    
    switch (difficulty) {
      case 7:
        number = randomInt(4, 100);
        break;
      case 8:
        number = randomInt(9, 400);
        break;
      default:
        number = randomInt(16, 900);
    }

    // Ensure perfect square
    const root = Math.floor(Math.sqrt(number));
    number = root * root;
    const result = root;

    const wrongAnswers = [
      (result + 1).toString(),
      (result - 1).toString(),
      (result + 2).toString(),
      (result * 2).toString(),
    ].filter(ans => ans !== result.toString());

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `sqrt-${Date.now()}`,
      type: 'mcq',
      domain: 'arithmetic',
      level: 'CP',
      difficultyElo: 1200,
      question: `√${number} = ?`,
      answer: result.toString(),
      explanation: `√${number} = ${result} car ${result} × ${result} = ${number}`,
      options: answers,
      timeEstimate: 60
    };
  }

  private generatePercentage(difficulty: number): GeneratedQuestion {
    let percentage: number, base: number;
    
    switch (difficulty) {
      case 9:
        percentage = randomInt(10, 50);
        base = randomInt(100, 500);
        break;
      default:
        percentage = randomInt(5, 25);
        base = randomInt(200, 1000);
    }

    const result = (percentage / 100) * base;
    const roundedResult = Math.round(result);
    const wrongAnswers = [
      (roundedResult + base / 10).toString(),
      (roundedResult - base / 10).toString(),
      (percentage * base).toString(),
      (base / percentage).toString(),
    ].filter(ans => ans !== roundedResult.toString());

    const answers = shuffleArray([roundedResult.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `percentage-${Date.now()}`,
      type: 'mcq',
      domain: 'arithmetic',
      level: 'CP',
      difficultyElo: 1400,
      question: `${percentage}% de ${base} = ?`,
      answer: roundedResult.toString(),
      explanation: `${percentage}% de ${base} = (${percentage}/100) × ${base} = ${roundedResult}`,
      options: answers,
      timeEstimate: 90
    };
  }

  private generateMixedOperations(difficulty: number): GeneratedQuestion {
    const a = randomInt(10, 50);
    const b = randomInt(5, 25);
    const c = randomInt(2, 15);
    
    const operations = [
      {
        question: `${a} + ${b} × ${c} = ?`,
        answer: (a + b * c).toString(),
        explanation: `Priorité opératoire : ${b} × ${c} = ${b * c}, puis ${a} + ${b * c} = ${a + b * c}`
      },
      {
        question: `${a} × ${b} + ${c} × ${b} = ?`,
        answer: ((a + c) * b).toString(),
        explanation: `Factorisation : ${a} × ${b} + ${c} × ${b} = (${a} + ${c}) × ${b} = ${(a + c) * b}`
      },
      {
        question: `${a}² + ${b}² = ?`,
        answer: (a * a + b * b).toString(),
        explanation: `${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}`
      }
    ];

    const selected = randomChoice(operations);
    const wrongAnswers = [
      (parseInt(selected.answer) + 10).toString(),
      (parseInt(selected.answer) - 10).toString(),
      (parseInt(selected.answer) + a).toString(),
    ].filter(ans => ans !== selected.answer);

    const answers = shuffleArray([selected.answer, ...wrongAnswers.slice(0, 3)]);

    return {
      id: `mixed-${Date.now()}`,
      type: 'mcq',
      domain: 'arithmetic',
      level: 'CP',
      difficultyElo: 1500,
      question: selected.question,
      answer: selected.answer,
      explanation: selected.explanation,
      options: answers,
      timeEstimate: 120
    };
  }
}
