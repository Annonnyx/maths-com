import { GeneratedQuestion, QuestionGenerator, randomInt, randomFloat, randomChoice, shuffleArray } from './types';

export class ComplexGenerator implements QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion {
    const generators = [
      () => this.generateComplexNumbers(difficulty),
      () => this.generateComplexArithmetic(difficulty),
      () => this.generateComplexConjugate(difficulty),
    ];

    return randomChoice(generators)();
  }

  private generateComplexNumbers(difficulty: number): GeneratedQuestion {
    let realPart: number, imagPart: number;
    
    switch (difficulty) {
      case 1:
        realPart = randomInt(-5, 5);
        imagPart = randomInt(-5, 5);
        break;
      case 2:
        realPart = randomInt(-10, 10);
        imagPart = randomInt(-10, 10);
        break;
      default:
        realPart = randomInt(-20, 20);
        imagPart = randomInt(-20, 20);
    }

    const questionText = this.formatComplexNumber(realPart, imagPart);
    const result = Math.sqrt(realPart * realPart + imagPart * imagPart);
    
    const wrongAnswers = [
      (result + 1).toFixed(2),
      (result - 1).toFixed(2),
      (Math.abs(realPart) + Math.abs(imagPart)).toFixed(2),
      (realPart + imagPart).toFixed(2),
    ].filter(ans => Math.abs(parseFloat(ans) - result) > 0.1);

    const answers = shuffleArray([result.toFixed(2), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `complex-${Date.now()}`,
      type: 'mcq',
      domain: 'complex',
      level: 'Sup2',
      difficultyElo: 3200,
      question: `Quel est le module de ${questionText} ?`,
      answer: result.toFixed(2),
      explanation: `|${questionText}| = √(${realPart}² + ${imagPart}²) = √(${realPart * realPart} + ${imagPart * imagPart}) = ${result.toFixed(2)}`,
      options: answers,
      timeEstimate: 90
    };
  }

  private generateComplexArithmetic(difficulty: number): GeneratedQuestion {
    let a1: number, b1: number, a2: number, b2: number;
    
    switch (difficulty) {
      case 2:
        a1 = randomInt(-5, 5);
        b1 = randomInt(-5, 5);
        a2 = randomInt(-5, 5);
        b2 = randomInt(-5, 5);
        break;
      default:
        a1 = randomInt(-10, 10);
        b1 = randomInt(-10, 10);
        a2 = randomInt(-10, 10);
        b2 = randomInt(-10, 10);
    }

    const operation = randomChoice(['+', '-']);
    let resultReal: number, resultImag: number;
    let questionText: string;

    if (operation === '+') {
      resultReal = a1 + a2;
      resultImag = b1 + b2;
      questionText = `(${this.formatComplexNumber(a1, b1)}) + (${this.formatComplexNumber(a2, b2)})`;
    } else {
      resultReal = a1 - a2;
      resultImag = b1 - b2;
      questionText = `(${this.formatComplexNumber(a1, b1)}) - (${this.formatComplexNumber(a2, b2)})`;
    }

    const resultString = this.formatComplexNumber(resultReal, resultImag);
    
    const wrongAnswers = [
      this.formatComplexNumber(resultReal + 1, resultImag),
      this.formatComplexNumber(resultReal - 1, resultImag),
      this.formatComplexNumber(resultReal, resultImag + 1),
      operation === '+' ? this.formatComplexNumber(a1 - a2, b1 - b2) : this.formatComplexNumber(a1 + a2, b1 + b2),
    ].filter(ans => ans !== resultString);

    const answers = shuffleArray([resultString, ...wrongAnswers.slice(0, 3)]);

    return {
      id: `complex-arithmetic-${Date.now()}`,
      type: 'mcq',
      domain: 'complex',
      level: 'Sup2',
      difficultyElo: 3400,
      question: `${questionText} = ?`,
      answer: resultString,
      explanation: `${questionText} = ${this.formatComplexNumber(resultReal, resultImag)}`,
      options: answers,
      timeEstimate: 120
    };
  }

  private generateComplexConjugate(difficulty: number): GeneratedQuestion {
    let realPart: number, imagPart: number;
    
    switch (difficulty) {
      case 3:
        realPart = randomInt(-8, 8);
        imagPart = randomInt(-8, 8);
        break;
      default:
        realPart = randomInt(-15, 15);
        imagPart = randomInt(-15, 15);
    }

    const questionText = this.formatComplexNumber(realPart, imagPart);
    const conjugate = this.formatComplexNumber(realPart, -imagPart);
    
    const wrongAnswers = [
      this.formatComplexNumber(-realPart, imagPart),
      this.formatComplexNumber(realPart, imagPart + 1),
      this.formatComplexNumber(realPart, imagPart - 1),
      this.formatComplexNumber(-realPart, -imagPart),
    ].filter(ans => ans !== conjugate);

    const answers = shuffleArray([conjugate, ...wrongAnswers.slice(0, 3)]);

    return {
      id: `complex-conjugate-${Date.now()}`,
      type: 'mcq',
      domain: 'complex',
      level: 'Sup2',
      difficultyElo: 3300,
      question: `Quel est le conjugué de ${questionText} ?`,
      answer: conjugate,
      explanation: `Le conjugué de ${questionText} est ${conjugate}`,
      options: answers,
      timeEstimate: 60
    };
  }

  private formatComplexNumber(real: number, imag: number): string {
    if (imag === 0) {
      return real.toString();
    } else if (real === 0) {
      return imag === 1 ? 'i' : imag === -1 ? '-i' : `${imag}i`;
    } else {
      const imagStr = imag === 1 ? '+i' : imag === -1 ? '-i' : imag > 0 ? `+${imag}i` : `${imag}i`;
      return `${real}${imagStr}`;
    }
  }
}
