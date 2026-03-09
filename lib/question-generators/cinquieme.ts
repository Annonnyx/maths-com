// ============================================================================
// 5ème Level Question Generator (ELO 1598-1939)
// ============================================================================
// TYPES: numeric, mcq, equation, geometry, expression
// DOMAINE: Puissances, Pythagore, Statistiques (moyenne, médiane),
//          Pourcentages avancés
// IMPORTANT: Respecte excludeGeometry - pas de Pythagore si exclu
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class CinquiemeGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '5eme';
  private readonly eloRange = { min: 1598, max: 1939 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    const domains: DomainType[] = ['calculation', 'statistics'];
    if (!excludeGeometry) {
      domains.push('geometry');
    }
    return domains;
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domains = this.getAvailableDomains(context.excludeGeometry);
    const domain = randomChoice(domains);

    switch (domain) {
      case 'calculation':
        return this.generateCalculationQuestion();
      case 'statistics':
        return this.generateStatisticsQuestion();
      case 'geometry':
        return this.generateGeometryQuestion();
      default:
        return this.generateCalculationQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Calculation Domain (Puissances, Pourcentages)
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generatePowerRules(),
      () => this.generatePercentageAdvanced(),
      () => this.generateSquaresAndCubes(),
    ];
    return randomChoice(generators)();
  }

  private generatePowerRules(): GeneratedQuestion {
    const type = randomChoice(['square', 'multiply', 'divide']);
    
    if (type === 'square') {
      const a = randomInt(2, 12);
      const n = randomChoice([2, 3]);
      const result = n === 2 ? a * a : a * a * a;
      
      return {
        id: hashQuestion(this.level, 'calculation', [a, n]),
        type: 'numeric',
        domain: 'calculation',
        level: this.level,
        difficultyElo: 1620,
        question: `${a}^${n} = ?`,
        answer: result.toString(),
        explanation: `${a}^${n} = ${n === 2 ? `${a} × ${a}` : `${a} × ${a} × ${a}`} = ${result}`,
        timeEstimate: 25
      };
    } else if (type === 'multiply') {
      const a = randomInt(2, 8);
      const m = randomInt(2, 4);
      const n = randomInt(2, 4);
      
      return {
        id: hashQuestion(this.level, 'calculation', [a, m, n]),
        type: 'numeric',
        domain: 'calculation',
        level: this.level,
        difficultyElo: 1700,
        question: `${a}^${m} × ${a}^${n} = ? (format: a^n)`,
        answer: `${a}^${m + n}`,
        explanation: `${a}^${m} × ${a}^${n} = ${a}^(${m}+${n}) = ${a}^${m + n}`,
        timeEstimate: 30
      };
    } else {
      const a = randomInt(2, 8);
      const m = randomInt(3, 5);
      const n = randomInt(2, m - 1);
      
      return {
        id: hashQuestion(this.level, 'calculation', [a, m, n]),
        type: 'numeric',
        domain: 'calculation',
        level: this.level,
        difficultyElo: 1750,
        question: `${a}^${m} ÷ ${a}^${n} = ? (format: a^n)`,
        answer: `${a}^${m - n}`,
        explanation: `${a}^${m} ÷ ${a}^${n} = ${a}^(${m}-${n}) = ${a}^${m - n}`,
        timeEstimate: 35
      };
    }
  }

  private generateSquaresAndCubes(): GeneratedQuestion {
    const a = randomInt(2, 15);
    const b = randomInt(2, 10);
    const operation = randomChoice(['a²+b²', 'a²-b²', '(a+b)²']);
    
    let question: string;
    let answer: number;
    let explanation: string;
    
    if (operation === 'a²+b²') {
      question = `${a}² + ${b}² = ?`;
      answer = a * a + b * b;
      explanation = `${a}² + ${b}² = ${a * a} + ${b * b} = ${answer}`;
    } else if (operation === 'a²-b²') {
      question = `${a}² - ${b}² = ?`;
      answer = a * a - b * b;
      explanation = `${a}² - ${b}² = ${a * a} - ${b * b} = ${answer}`;
    } else {
      const sum = a + b;
      question = `(${a} + ${b})² = ?`;
      answer = sum * sum;
      explanation = `(${a} + ${b})² = ${sum}² = ${answer}`;
    }
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 1800,
      question,
      answer: answer.toString(),
      explanation,
      timeEstimate: 40
    };
  }

  private generatePercentageAdvanced(): GeneratedQuestion {
    const base = randomInt(80, 250);
    const percent = randomChoice([5, 10, 15, 20, 25, 30]);
    const type = randomChoice(['of', 'increase', 'decrease']);
    
    const value = Math.round(base * percent / 100);
    let result: number;
    let question: string;
    let explanation: string;
    
    if (type === 'of') {
      result = value;
      question = `${percent}% de ${base} = ?`;
      explanation = `${percent}% de ${base} = (${base} × ${percent})/100 = ${result}`;
    } else if (type === 'increase') {
      result = base + value;
      question = `Augmente ${base} de ${percent}%`;
      explanation = `Augmentation : ${value}. Nouveau : ${base} + ${value} = ${result}`;
    } else {
      result = base - value;
      question = `Diminue ${base} de ${percent}%`;
      explanation = `Réduction : ${value}. Nouveau : ${base} - ${value} = ${result}`;
    }
    
    return {
      id: hashQuestion(this.level, 'calculation', [base, percent]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 1650,
      question,
      answer: result.toString(),
      explanation,
      timeEstimate: 45
    };
  }

  // --------------------------------------------------------------------------
  // Statistics Domain (Moyenne, Médiane)
  // --------------------------------------------------------------------------

  private generateStatisticsQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateMean(),
      () => this.generateMedian(),
    ];
    return randomChoice(generators)();
  }

  private generateMean(): GeneratedQuestion {
    const count = randomInt(4, 6);
    const values = Array.from({length: count}, () => randomInt(5, 100));
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = Math.round((sum / count) * 10) / 10;
    
    return {
      id: hashQuestion(this.level, 'statistics', values),
      type: 'numeric',
      domain: 'statistics',
      level: this.level,
      difficultyElo: 1700,
      question: `Calcule la moyenne de : ${values.join(', ')}`,
      answer: mean.toString().replace('.', ','),
      acceptableAnswers: [mean.toString(), mean.toString().replace('.', ',')],
      explanation: `Moyenne = (${values.join(' + ')}) / ${count} = ${sum} / ${count} = ${mean.toString().replace('.', ',')}`,
      timeEstimate: 50
    };
  }

  private generateMedian(): GeneratedQuestion {
    const count = randomChoice([5, 7]);
    const values = Array.from({length: count}, () => randomInt(10, 99));
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(count / 2)];
    
    return {
      id: hashQuestion(this.level, 'statistics', values),
      type: 'numeric',
      domain: 'statistics',
      level: this.level,
      difficultyElo: 1850,
      question: `Quelle est la médiane de : ${values.join(', ')} ?`,
      answer: median.toString(),
      explanation: `On ordonne : ${sorted.join(' < ')}. La médiane est la valeur centrale : ${median}.`,
      timeEstimate: 45
    };
  }

  // --------------------------------------------------------------------------
  // Geometry Domain (Pythagore)
  // --------------------------------------------------------------------------

  private generateGeometryQuestion(): GeneratedQuestion {
    return this.generatePythagore();
  }

  private generatePythagore(): GeneratedQuestion {
    const triplets: Array<[number, number, number]> = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
      [9, 12, 15],
    ];
    
    const [a, b, c] = randomChoice(triplets);
    const findHypotenuse = Math.random() > 0.5;
    
    if (findHypotenuse) {
      return {
        id: hashQuestion(this.level, 'geometry', [a, b]),
        type: 'numeric',
        domain: 'geometry',
        level: this.level,
        difficultyElo: 1880,
        question: `Dans un triangle rectangle avec a=${a} et b=${b}, calcule l'hypoténuse c.`,
        answer: c.toString(),
        explanation: `Pythagore : c² = a² + b² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${c*c}. Donc c = ${c}.`,
        timeEstimate: 60
      };
    } else {
      const known = Math.random() > 0.5 ? a : b;
      const unknown = known === a ? b : a;
      
      return {
        id: hashQuestion(this.level, 'geometry', [c, known]),
        type: 'numeric',
        domain: 'geometry',
        level: this.level,
        difficultyElo: 1920,
        question: `Dans un triangle rectangle avec hypoténuse c=${c} et un côté=${known}, calcule l'autre côté.`,
        answer: unknown.toString(),
        explanation: `a² = c² - b² = ${c}² - ${known}² = ${c*c} - ${known*known} = ${unknown*unknown}. Donc le côté = ${unknown}.`,
        timeEstimate: 70
      };
    }
  }
}
