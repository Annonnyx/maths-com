import { GeneratedQuestion, QuestionGenerator, randomInt, randomFloat, randomChoice, shuffleArray } from './types';

export class StatisticsGenerator implements QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion {
    const generators = [
      () => this.generateMean(difficulty),
      () => this.generateMedian(difficulty),
      () => this.generateProbability(difficulty),
      () => this.generateBinomial(difficulty),
    ];

    return randomChoice(generators)();
  }

  private generateMean(difficulty: number): GeneratedQuestion {
    let numbers: number[];
    
    switch (difficulty) {
      case 1:
        numbers = Array.from({length: 4}, () => randomInt(1, 20));
        break;
      case 2:
        numbers = Array.from({length: 6}, () => randomInt(1, 50));
        break;
      default:
        numbers = Array.from({length: 8}, () => randomInt(1, 100));
    }

    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const roundedMean = Math.round(mean * 10) / 10;
    
    const wrongAnswers = [
      (roundedMean + 1).toFixed(1),
      (roundedMean - 1).toFixed(1),
      Math.round(mean).toFixed(1),
      (mean / 2).toFixed(1),
    ].filter(ans => Math.abs(parseFloat(ans) - roundedMean) > 0.1);

    const answers = shuffleArray([roundedMean.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `mean-${Date.now()}`,
      type: 'mcq',
      domain: 'statistics',
      level: 'CM2',
      difficultyElo: 1250,
      question: `Calcule la moyenne de cette série : ${numbers.join(', ')}`,
      answer: roundedMean.toString(),
      explanation: `Moyenne = (${numbers.join(' + ')}) / ${numbers.length} = ${numbers.reduce((sum, num) => sum + num, 0)} / ${numbers.length} = ${roundedMean}`,
      options: answers,
      timeEstimate: 90
    };
  }

  private generateMedian(difficulty: number): GeneratedQuestion {
    let numbers: number[];
    
    switch (difficulty) {
      case 2:
        numbers = Array.from({length: 5}, () => randomInt(1, 50));
        break;
      case 3:
        numbers = Array.from({length: 6}, () => randomInt(1, 50));
        break;
      default:
        numbers = Array.from({length: 8}, () => randomInt(1, 100));
    }

    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    let median: number;
    
    if (sortedNumbers.length % 2 === 1) {
      median = sortedNumbers[Math.floor(sortedNumbers.length / 2)];
    } else {
      median = (sortedNumbers[sortedNumbers.length / 2 - 1] + sortedNumbers[sortedNumbers.length / 2]) / 2;
    }
    
    const wrongAnswers = [
      (median + 1).toString(),
      (median - 1).toString(),
      sortedNumbers[0].toString(),
      sortedNumbers[sortedNumbers.length - 1].toString(),
    ].filter(ans => ans !== median.toString());

    const answers = shuffleArray([median.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `median-${Date.now()}`,
      type: 'mcq',
      domain: 'statistics',
      level: 'CM2',
      difficultyElo: 1300,
      question: `Calcule la médiane de cette série : ${numbers.join(', ')}`,
      answer: median.toString(),
      explanation: `Série ordonnée : ${sortedNumbers.join(', ')}. Médiane = ${sortedNumbers.length % 2 === 1 ? `le ${Math.floor(sortedNumbers.length / 2) + 1}ème terme = ${median}` : `la moyenne des ${sortedNumbers.length / 2}ème et ${sortedNumbers.length / 2 + 1}ème termes = (${sortedNumbers[sortedNumbers.length / 2 - 1]} + ${sortedNumbers[sortedNumbers.length / 2]}) / 2 = ${median}`}`,
      options: answers,
      timeEstimate: 120
    };
  }

  private generateProbability(difficulty: number): GeneratedQuestion {
    let totalItems: number, favorableItems: number;
    
    switch (difficulty) {
      case 3:
        totalItems = randomInt(5, 15);
        favorableItems = randomInt(1, totalItems - 1);
        break;
      case 4:
        totalItems = randomInt(10, 30);
        favorableItems = randomInt(1, totalItems - 1);
        break;
      default:
        totalItems = randomInt(20, 50);
        favorableItems = randomInt(1, totalItems - 1);
    }

    const probability = favorableItems / totalItems;
    const percentage = Math.round(probability * 100);
    
    const wrongAnswers = [
      ((favorableItems + 1) / totalItems).toString(),
      ((favorableItems - 1) / totalItems).toString(),
      (totalItems / favorableItems).toString(),
      (favorableItems / (totalItems - favorableItems)).toString(),
    ].filter(ans => Math.abs(parseFloat(ans) - probability) > 0.01);

    const answers = shuffleArray([probability.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `probability-${Date.now()}`,
      type: 'mcq',
      domain: 'statistics',
      level: 'Sup1',
      difficultyElo: 2500,
      question: `Dans une urne contenant ${totalItems} boules, ${favorableItems} sont rouges. Quelle est la probabilité de tirer une boule rouge ?`,
      answer: probability.toString(),
      explanation: `Probabilité = cas favorables / cas possibles = ${favorableItems} / ${totalItems} = ${probability} (${percentage}%)`,
      options: answers,
      timeEstimate: 60
    };
  }

  private generateBinomial(difficulty: number): GeneratedQuestion {
    let n: number, p: number, k: number;
    
    switch (difficulty) {
      case 5:
        n = randomInt(3, 8);
        p = randomChoice([0.25, 0.5, 0.75]);
        k = randomInt(0, n);
        break;
      case 6:
        n = randomInt(5, 12);
        p = randomChoice([0.2, 0.3, 0.4, 0.6, 0.7, 0.8]);
        k = randomInt(0, n);
        break;
      default:
        n = randomInt(8, 15);
        p = randomFloat(0.1, 0.9);
        k = randomInt(0, n);
    }

    // Calculate binomial coefficient C(n, k)
    let binomialCoefficient = 1;
    for (let i = 1; i <= Math.min(k, n - k); i++) {
      binomialCoefficient = binomialCoefficient * (n - i + 1) / i;
    }
    
    const probability = binomialCoefficient * Math.pow(p, k) * Math.pow(1 - p, n - k);
    const roundedProbability = Math.round(probability * 1000) / 1000;
    
    const wrongAnswers = [
      (roundedProbability + 0.05).toString(),
      (roundedProbability - 0.05).toString(),
      (Math.pow(p, k)).toString(),
      (k / n).toString(),
    ].filter(ans => Math.abs(parseFloat(ans) - roundedProbability) > 0.001);

    const answers = shuffleArray([roundedProbability.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `binomial-${Date.now()}`,
      type: 'mcq',
      domain: 'statistics',
      level: 'Sup2',
      difficultyElo: 3300,
      question: `On lance ${n} fois une pièce de probabilité pile = ${p}. Quelle est la probabilité d'obtenir exactement ${k} piles ?`,
      answer: roundedProbability.toString(),
      explanation: `Loi binomiale : P(X = ${k}) = C(${n}, ${k}) × ${p}^${k} × ${(1 - p)}^${n - k} = ${binomialCoefficient} × ${Math.pow(p, k).toFixed(3)} × ${Math.pow(1 - p, n - k).toFixed(3)} ≈ ${roundedProbability}`,
      options: answers,
      timeEstimate: 150
    };
  }
}
