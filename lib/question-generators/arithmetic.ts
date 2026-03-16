import { GeneratedQuestion, QuestionGenerator, randomInt, randomFloat, randomChoice, shuffleArray } from './types';

export class ArithmeticGenerator implements QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion {
    // Weight distribution to avoid pattern over-representation
    // Higher difficulty levels should have more operation variety
    let generators: Array<() => GeneratedQuestion> = [];
    let weights: number[] = [];
    
    if (difficulty <= 2) {
      // Beginners: focus on basic addition/subtraction
      generators = [
        () => this.generateAddition(difficulty),
        () => this.generateSubtraction(difficulty),
        () => this.generateAddition(difficulty), // Higher weight
      ];
      weights = [0.35, 0.35, 0.30];
    } else if (difficulty <= 4) {
      // Early intermediate: introduce multiplication/division
      generators = [
        () => this.generateAddition(difficulty),
        () => this.generateSubtraction(difficulty),
        () => this.generateMultiplication(difficulty),
        () => this.generateDivision(difficulty),
      ];
      weights = [0.25, 0.25, 0.25, 0.25];
    } else if (difficulty <= 7) {
      // Intermediate: all basic ops + powers/roots
      generators = [
        () => this.generateMultiplication(difficulty),
        () => this.generateDivision(difficulty),
        () => this.generatePower(difficulty),
        () => this.generateRoot(difficulty),
        () => this.generatePercentage(difficulty),
      ];
      weights = [0.25, 0.25, 0.20, 0.15, 0.15];
    } else {
      // Advanced: all operations with equal distribution
      generators = [
        () => this.generateMultiplication(difficulty),
        () => this.generateDivision(difficulty),
        () => this.generatePower(difficulty),
        () => this.generateRoot(difficulty),
        () => this.generatePercentage(difficulty),
        () => this.generateFraction(difficulty),
      ];
      weights = [0.20, 0.20, 0.20, 0.15, 0.15, 0.10];
    }

    // Weighted random selection
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return generators[i]();
      }
    }
    
    return generators[generators.length - 1]();
  }

  private generateAddition(difficulty: number): GeneratedQuestion {
    let a: number, b: number;
    
    switch (difficulty) {
      case 1: // CP - very basic
        a = randomInt(1, 5);
        b = randomInt(1, 5);
        break;
      case 2: // CE1
        a = randomInt(1, 10);
        b = randomInt(1, 10);
        break;
      case 3: // CE2
        a = randomInt(1, 20);
        b = randomInt(1, 20);
        break;
      case 4: // CM1
        a = randomInt(10, 50);
        b = randomInt(10, 50);
        break;
      case 5: // CM2
        a = randomInt(20, 100);
        b = randomInt(10, 50);
        break;
      case 6: // 6e
        a = randomInt(50, 200);
        b = randomInt(50, 200);
        break;
      case 7: // 5e
        a = randomInt(100, 500);
        b = randomInt(100, 500);
        break;
      case 8: // 4e
        a = randomInt(200, 999);
        b = randomInt(200, 999);
        break;
      case 9: // 3e
        a = randomInt(100, 999);
        b = randomInt(100, 999);
        break;
      case 10: // 2de+
        a = randomInt(1000, 9999);
        b = randomInt(1000, 9999);
        break;
      default:
        a = randomInt(1, 20);
        b = randomInt(1, 20);
    }

    const result = a + b;
    const wrongAnswers = [
      (result + randomInt(1, 10)).toString(),
      (result - randomInt(1, 10)).toString(),
      (result + randomInt(10, 50)).toString(),
    ].filter(ans => ans !== result.toString() && Number(ans) > 0);

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `${a} + ${b} = ?`,
      answers,
      correct: result.toString(),
      explanation: `${a} + ${b} = ${result}`,
      difficulty
    };
  }

  private generateSubtraction(difficulty: number): GeneratedQuestion {
    let a: number, b: number;
    
    switch (difficulty) {
      case 1:
        a = randomInt(5, 10);
        b = randomInt(1, 5);
        break;
      case 2:
        a = randomInt(10, 20);
        b = randomInt(1, 10);
        break;
      case 3:
        a = randomInt(20, 50);
        b = randomInt(1, 20);
        break;
      case 4:
        a = randomInt(50, 100);
        b = randomInt(10, 50);
        break;
      case 5:
        a = randomInt(100, 200);
        b = randomInt(10, 100);
        break;
      case 6:
        a = randomInt(200, 500);
        b = randomInt(50, 200);
        break;
      case 7:
        a = randomInt(500, 1000);
        b = randomInt(100, 500);
        break;
      case 8:
        a = randomInt(1000, 2000);
        b = randomInt(100, 1000);
        break;
      case 9:
        a = randomInt(2000, 5000);
        b = randomInt(500, 2000);
        break;
      case 10:
        a = randomInt(5000, 10000);
        b = randomInt(1000, 5000);
        break;
      default:
        a = randomInt(10, 20);
        b = randomInt(1, 10);
    }

    const result = a - b;
    const wrongAnswers = [
      (result + randomInt(1, 10)).toString(),
      (result - randomInt(1, 10)).toString(),
      (a + b).toString(), // Common mistake
    ].filter(ans => ans !== result.toString() && Number(ans) >= 0);

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `${a} - ${b} = ?`,
      answers,
      correct: result.toString(),
      explanation: `${a} - ${b} = ${result}`,
      difficulty
    };
  }

  private generateMultiplication(difficulty: number): GeneratedQuestion {
    let a: number, b: number;
    
    switch (difficulty) {
      case 1:
        a = randomInt(1, 5);
        b = randomInt(1, 5);
        break;
      case 2:
        a = randomInt(2, 10);
        b = randomInt(2, 10);
        break;
      case 3:
        a = randomInt(5, 15);
        b = randomInt(5, 15);
        break;
      case 4:
        a = randomInt(10, 20);
        b = randomInt(10, 20);
        break;
      case 5:
        a = randomInt(15, 30);
        b = randomInt(15, 30);
        break;
      case 6:
        a = randomInt(20, 50);
        b = randomInt(20, 50);
        break;
      case 7:
        a = randomInt(30, 100);
        b = randomInt(30, 100);
        break;
      case 8:
        a = randomInt(50, 200);
        b = randomInt(50, 200);
        break;
      case 9:
        a = randomInt(100, 500);
        b = randomInt(100, 500);
        break;
      case 10:
        a = randomInt(200, 1000);
        b = randomInt(200, 1000);
        break;
      default:
        a = randomInt(2, 10);
        b = randomInt(2, 10);
    }

    const result = a * b;
    const wrongAnswers = [
      (result + a).toString(), // Common mistake (adding instead of multiplying)
      (result + b).toString(),
      (result + randomInt(10, 100)).toString(),
      (a + b).toString(), // Another common mistake
    ].filter(ans => ans !== result.toString());

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `${a} × ${b} = ?`,
      answers,
      correct: result.toString(),
      explanation: `${a} × ${b} = ${result}`,
      difficulty
    };
  }

  private generateDivision(difficulty: number): GeneratedQuestion {
    let divisor: number, quotient: number;
    
    switch (difficulty) {
      case 1:
        divisor = randomInt(1, 5);
        quotient = randomInt(1, 5);
        break;
      case 2:
        divisor = randomInt(2, 10);
        quotient = randomInt(1, 10);
        break;
      case 3:
        divisor = randomInt(2, 10);
        quotient = randomInt(2, 15);
        break;
      case 4:
        divisor = randomInt(3, 15);
        quotient = randomInt(3, 15);
        break;
      case 5:
        divisor = randomInt(5, 20);
        quotient = randomInt(5, 20);
        break;
      case 6:
        divisor = randomInt(5, 25);
        quotient = randomInt(5, 25);
        break;
      case 7:
        divisor = randomInt(10, 50);
        quotient = randomInt(10, 50);
        break;
      case 8:
        divisor = randomInt(10, 100);
        quotient = randomInt(10, 100);
        break;
      case 9:
        divisor = randomInt(20, 100);
        quotient = randomInt(20, 100);
        break;
      case 10:
        divisor = randomInt(50, 200);
        quotient = randomInt(50, 200);
        break;
      default:
        divisor = randomInt(2, 10);
        quotient = randomInt(1, 10);
    }

    const dividend = divisor * quotient;
    const wrongAnswers = [
      (dividend - divisor).toString(),
      (dividend + divisor).toString(),
      (divisor + quotient).toString(),
      (dividend / 2).toString(),
    ].filter(ans => ans !== quotient.toString() && Number(ans) > 0);

    const answers = shuffleArray([quotient.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `${dividend} ÷ ${divisor} = ?`,
      answers,
      correct: quotient.toString(),
      explanation: `${dividend} ÷ ${divisor} = ${quotient}`,
      difficulty
    };
  }

  private generatePower(difficulty: number): GeneratedQuestion {
    let base: number, exponent: number;
    
    switch (difficulty) {
      case 1:
        base = randomInt(1, 5);
        exponent = 2;
        break;
      case 2:
        base = randomInt(2, 10);
        exponent = 2;
        break;
      case 3:
        base = randomInt(2, 10);
        exponent = randomInt(2, 3);
        break;
      case 4:
        base = randomInt(3, 12);
        exponent = randomInt(2, 3);
        break;
      case 5:
        base = randomInt(3, 15);
        exponent = randomInt(2, 3);
        break;
      case 6:
        base = randomInt(2, 10);
        exponent = randomInt(3, 4);
        break;
      case 7:
        base = randomInt(2, 8);
        exponent = randomInt(3, 4);
        break;
      case 8:
        base = randomInt(2, 6);
        exponent = randomInt(4, 5);
        break;
      case 9:
        base = randomInt(2, 5);
        exponent = randomInt(4, 6);
        break;
      case 10:
        base = randomInt(2, 4);
        exponent = randomInt(5, 7);
        break;
      default:
        base = randomInt(2, 5);
        exponent = 2;
    }

    const result = Math.pow(base, exponent);
    const wrongAnswers = [
      (result + base).toString(),
      (result - base).toString(),
      (base * exponent).toString(),
      Math.pow(base, exponent - 1).toString(),
    ].filter(ans => ans !== result.toString() && Number(ans) > 0);

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `${base}^${exponent} = ?`,
      answers,
      correct: result.toString(),
      explanation: `${base}^${exponent} = ${Array(exponent).fill(base).join(' × ')} = ${result}`,
      difficulty
    };
  }

  private generateRoot(difficulty: number): GeneratedQuestion {
    // Generate perfect squares only
    const perfectSquares: Record<number, number[]> = {
      1: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100],
      2: [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169],
      3: [9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225],
      4: [16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256],
      5: [25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361],
      6: [36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400],
      7: [49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441],
      8: [64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484],
      9: [81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529],
      10: [100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625]
    };

    const squares = perfectSquares[difficulty] || perfectSquares[2];
    const number = randomChoice(squares);
    const result = Math.sqrt(number);
    const wrongAnswers = [
      (result + 1).toString(),
      (result - 1).toString(),
      (result + 2).toString(),
      number > 4 ? Math.sqrt(number / 2).toString() : (result + 3).toString(),
    ].filter(ans => ans !== result.toString() && Number(ans) > 0 && !isNaN(Number(ans)));

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `√${number} = ?`,
      answers,
      correct: result.toString(),
      explanation: `√${number} = ${result} car ${result} × ${result} = ${number}`,
      difficulty
    };
  }

  private generatePercentage(difficulty: number): GeneratedQuestion {
    let percentage: number, base: number;
    
    switch (difficulty) {
      case 1:
        percentage = randomChoice([10, 25, 50, 75, 100]);
        base = randomInt(2, 20);
        break;
      case 2:
        percentage = randomChoice([5, 10, 20, 25, 50, 75]);
        base = randomInt(4, 40);
        break;
      case 3:
        percentage = randomChoice([5, 10, 15, 20, 25, 30, 50, 75]);
        base = randomInt(10, 60);
        break;
      case 4:
        percentage = randomInt(5, 50) * 5;
        base = randomInt(20, 100);
        break;
      case 5:
        percentage = randomInt(1, 40) * 5;
        base = randomInt(40, 200);
        break;
      case 6:
        percentage = randomInt(1, 30) * 5;
        base = randomInt(100, 500);
        break;
      case 7:
        percentage = randomInt(1, 25) * 4;
        base = randomInt(200, 1000);
        break;
      case 8:
        percentage = randomInt(1, 20) * 5;
        base = randomInt(500, 2000);
        break;
      case 9:
        percentage = randomInt(1, 15) * 5;
        base = randomInt(1000, 5000);
        break;
      case 10:
        percentage = randomInt(1, 20) * 5;
        base = randomInt(2000, 10000);
        break;
      default:
        percentage = 25;
        base = 20;
    }

    const result = (base * percentage) / 100;
    const wrongAnswers = [
      Math.round((base * (percentage + 5)) / 100).toString(),
      Math.round((base * (percentage - 5)) / 100).toString(),
      Math.round(base / percentage).toString(),
      Math.round(base + percentage).toString(),
    ].filter(ans => ans !== result.toString() && Number(ans) > 0);

    const answers = shuffleArray([result.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `${percentage}% de ${base} = ?`,
      answers,
      correct: result.toString(),
      explanation: `${percentage}% de ${base} = (${percentage}/100) × ${base} = ${result}`,
      difficulty
    };
  }

  private generateFraction(difficulty: number): GeneratedQuestion {
    let numerator1: number, denominator1: number, numerator2: number, denominator2: number;
    let operation: 'add' | 'subtract' | 'multiply' | 'divide';
    
    switch (difficulty) {
      case 1:
        numerator1 = randomInt(1, 5);
        denominator1 = randomInt(2, 6);
        numerator2 = randomInt(1, 5);
        denominator2 = randomInt(2, 6);
        operation = 'add';
        break;
      case 2:
        numerator1 = randomInt(1, 8);
        denominator1 = randomInt(2, 10);
        numerator2 = randomInt(1, 8);
        denominator2 = randomInt(2, 10);
        operation = randomChoice(['add', 'subtract']);
        break;
      case 3:
        numerator1 = randomInt(1, 10);
        denominator1 = randomInt(2, 12);
        numerator2 = randomInt(1, 10);
        denominator2 = randomInt(2, 12);
        operation = randomChoice(['add', 'subtract', 'multiply']);
        break;
      case 4:
        numerator1 = randomInt(2, 15);
        denominator1 = randomInt(3, 15);
        numerator2 = randomInt(2, 15);
        denominator2 = randomInt(3, 15);
        operation = randomChoice(['add', 'subtract', 'multiply']);
        break;
      case 5:
        numerator1 = randomInt(3, 20);
        denominator1 = randomInt(4, 20);
        numerator2 = randomInt(3, 20);
        denominator2 = randomInt(4, 20);
        operation = randomChoice(['add', 'subtract', 'multiply', 'divide']);
        break;
      default:
        numerator1 = randomInt(1, 10);
        denominator1 = randomInt(2, 10);
        numerator2 = randomInt(1, 10);
        denominator2 = randomInt(2, 10);
        operation = 'add';
    }

    let result: number;
    let questionText: string;

    switch (operation) {
      case 'add':
        const commonDenom = denominator1 * denominator2;
        const newNum1 = numerator1 * denominator2;
        const newNum2 = numerator2 * denominator1;
        result = (newNum1 + newNum2) / commonDenom;
        questionText = `${numerator1}/${denominator1} + ${numerator2}/${denominator2} = ?`;
        break;
      case 'subtract':
        const commonDenomSub = denominator1 * denominator2;
        const newNum1Sub = numerator1 * denominator2;
        const newNum2Sub = numerator2 * denominator1;
        result = (newNum1Sub - newNum2Sub) / commonDenomSub;
        questionText = `${numerator1}/${denominator1} - ${numerator2}/${denominator2} = ?`;
        break;
      case 'multiply':
        result = (numerator1 * numerator2) / (denominator1 * denominator2);
        questionText = `${numerator1}/${denominator1} × ${numerator2}/${denominator2} = ?`;
        break;
      case 'divide':
        result = (numerator1 * denominator2) / (denominator1 * numerator2);
        questionText = `${numerator1}/${denominator1} ÷ ${numerator2}/${denominator2} = ?`;
        break;
    }

    const roundedResult = Math.round(result * 100) / 100;
    const wrongAnswers = [
      Math.round((roundedResult + 0.5) * 100) / 100,
      Math.round((roundedResult - 0.5) * 100) / 100,
      Math.round((roundedResult + 1) * 100) / 100,
    ].filter(ans => ans !== roundedResult && ans > 0);

    const answers = shuffleArray([roundedResult.toString(), ...wrongAnswers.slice(0, 3).map(a => a.toString())]);

    return {
      question: questionText,
      answers,
      correct: roundedResult.toString(),
      explanation: `${questionText.replace(' = ?', '')} = ${roundedResult}`,
      difficulty
    };
  }
}
