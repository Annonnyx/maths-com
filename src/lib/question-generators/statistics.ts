import { GeneratedQuestion, QuestionGenerator, randomInt, randomFloat, randomChoice, shuffleArray } from './types';

export class StatisticsGenerator implements QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion {
    const generators = [
      () => this.generateMean(difficulty),
      () => this.generateMedian(difficulty),
      () => this.generateProbability(difficulty),
      () => this.generateBinomial(difficulty),
    ];

    // Select generators based on difficulty
    const availableGenerators = difficulty <= 4 
      ? generators.slice(0, 2) // Only mean and median
      : difficulty <= 7 
        ? generators.slice(0, 3) // + probability
        : generators; // All generators

    const generator = randomChoice(availableGenerators);
    return generator();
  }

  private generateMean(difficulty: number): GeneratedQuestion {
    let numbers: number[];
    
    switch (difficulty) {
      case 1:
        numbers = Array.from({ length: 3 }, () => randomInt(1, 10));
        break;
      case 2:
        numbers = Array.from({ length: 4 }, () => randomInt(1, 20));
        break;
      case 3:
        numbers = Array.from({ length: 5 }, () => randomInt(1, 30));
        break;
      case 4:
        numbers = Array.from({ length: 6 }, () => randomInt(1, 50));
        break;
      case 5:
        numbers = Array.from({ length: 7 }, () => randomInt(1, 100));
        break;
      case 6:
        numbers = Array.from({ length: 8 }, () => randomInt(10, 200));
        break;
      case 7:
        numbers = Array.from({ length: 10 }, () => randomInt(10, 500));
        break;
      default:
        numbers = Array.from({ length: 5 }, () => randomInt(1, 30));
    }

    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const roundedMean = Math.round(mean * 100) / 100;

    const wrongAnswers = [
      (roundedMean + 1).toFixed(2),
      (roundedMean - 1).toFixed(2),
      (Math.round(mean)).toString(),
      (numbers[0]).toString(),
    ].filter(ans => ans !== roundedMean.toString());

    const answers = shuffleArray([roundedMean.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `Calcule la moyenne de cette série : ${numbers.join(', ')}`,
      answers,
      correct: roundedMean.toString(),
      explanation: `Moyenne = (${numbers.join(' + ')}) / ${numbers.length} = ${numbers.reduce((sum, num) => sum + num, 0)} / ${numbers.length} = ${roundedMean}`,
      difficulty
    };
  }

  private generateMedian(difficulty: number): GeneratedQuestion {
    let numbers: number[];
    
    switch (difficulty) {
      case 1:
        numbers = Array.from({ length: 3 }, () => randomInt(1, 10));
        break;
      case 2:
        numbers = Array.from({ length: 4 }, () => randomInt(1, 20));
        break;
      case 3:
        numbers = Array.from({ length: 5 }, () => randomInt(1, 30));
        break;
      case 4:
        numbers = Array.from({ length: 6 }, () => randomInt(1, 50));
        break;
      case 5:
        numbers = Array.from({ length: 7 }, () => randomInt(1, 100));
        break;
      case 6:
        numbers = Array.from({ length: 8 }, () => randomInt(10, 200));
        break;
      case 7:
        numbers = Array.from({ length: 9 }, () => randomInt(10, 500));
        break;
      default:
        numbers = Array.from({ length: 5 }, () => randomInt(1, 30));
    }

    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    let median: number;

    if (sortedNumbers.length % 2 === 1) {
      median = sortedNumbers[Math.floor(sortedNumbers.length / 2)];
    } else {
      const mid1 = sortedNumbers[sortedNumbers.length / 2 - 1];
      const mid2 = sortedNumbers[sortedNumbers.length / 2];
      median = (mid1 + mid2) / 2;
    }

    const wrongAnswers = [
      (median + 1).toString(),
      (median - 1).toString(),
      (sortedNumbers[0]).toString(),
      (sortedNumbers[sortedNumbers.length - 1]).toString(),
    ].filter(ans => ans !== median.toString());

    const answers = shuffleArray([median.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `Calcule la médiane de cette série : ${numbers.join(', ')}`,
      answers,
      correct: median.toString(),
      explanation: `Série ordonnée : ${sortedNumbers.join(', ')}. Médiane = ${sortedNumbers.length % 2 === 1 ? `le ${Math.floor(sortedNumbers.length / 2) + 1}ème terme = ${median}` : `la moyenne des ${sortedNumbers.length / 2}ème et ${sortedNumbers.length / 2 + 1}ème termes = (${sortedNumbers[sortedNumbers.length / 2 - 1]} + ${sortedNumbers[sortedNumbers.length / 2]}) / 2 = ${median}`}`,
      difficulty
    };
  }

  private generateProbability(difficulty: number): GeneratedQuestion {
    let totalItems: number, favorableItems: number;
    
    switch (difficulty) {
      case 5:
        totalItems = randomInt(4, 10);
        favorableItems = randomInt(1, totalItems - 1);
        break;
      case 6:
        totalItems = randomInt(6, 20);
        favorableItems = randomInt(1, totalItems - 1);
        break;
      case 7:
        totalItems = randomInt(10, 30);
        favorableItems = randomInt(1, totalItems - 1);
        break;
      default:
        totalItems = 6;
        favorableItems = 2;
    }

    const probability = favorableItems / totalItems;
    const percentage = Math.round(probability * 100);

    const wrongAnswers = [
      ((favorableItems + 1) / totalItems).toString(),
      ((favorableItems - 1) / totalItems).toString(),
      (totalItems / favorableItems).toString(),
      (favorableItems).toString(),
    ].filter(ans => ans !== probability.toString());

    const answers = shuffleArray([probability.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `Dans une urne contenant ${totalItems} boules, ${favorableItems} sont rouges. Quelle est la probabilité de tirer une boule rouge ?`,
      answers,
      correct: probability.toString(),
      explanation: `Probabilité = cas favorables / cas possibles = ${favorableItems} / ${totalItems} = ${probability} (${percentage}%)`,
      difficulty
    };
  }

  private generateBinomial(difficulty: number): GeneratedQuestion {
    let n: number, p: number, k: number;
    
    switch (difficulty) {
      case 8:
        n = randomInt(3, 6);
        p = randomChoice([0.25, 0.5, 0.75]);
        k = randomInt(1, n - 1);
        break;
      case 9:
        n = randomInt(4, 8);
        p = randomChoice([0.2, 0.3, 0.4, 0.6, 0.7, 0.8]);
        k = randomInt(1, n - 1);
        break;
      case 10:
        n = randomInt(5, 10);
        p = randomChoice([0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9]);
        k = randomInt(1, n - 1);
        break;
      default:
        n = 4; p = 0.5; k = 2;
    }

    // Calculate binomial coefficient C(n, k)
    const binomialCoefficient = this.calculateBinomialCoefficient(n, k);
    const probability = binomialCoefficient * Math.pow(p, k) * Math.pow(1 - p, n - k);
    const roundedProbability = Math.round(probability * 1000) / 1000;

    const wrongAnswers = [
      (roundedProbability + 0.1).toFixed(3),
      (roundedProbability - 0.1).toFixed(3),
      (Math.pow(p, k)).toFixed(3),
      (k / n).toFixed(3),
    ].filter(ans => ans !== roundedProbability.toString());

    const answers = shuffleArray([roundedProbability.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `On lance ${n} fois une pièce de probabilité pile = ${p}. Quelle est la probabilité d'obtenir exactement ${k} piles ?`,
      answers,
      correct: roundedProbability.toString(),
      explanation: `Loi binomiale : P(X = ${k}) = C(${n}, ${k}) × ${p}^${k} × ${(1 - p)}^${n - k} = ${binomialCoefficient} × ${Math.pow(p, k).toFixed(3)} × ${Math.pow(1 - p, n - k).toFixed(3)} ≈ ${roundedProbability}`,
      difficulty
    };
  }

  private calculateBinomialCoefficient(n: number, k: number): number {
    if (k === 0 || k === n) return 1;
    if (k > n - k) k = n - k;
    
    let result = 1;
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    return result;
  }
}
