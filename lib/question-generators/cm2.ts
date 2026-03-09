// ============================================================================
// CM2 Level Question Generator (ELO 1085-1255)
// ============================================================================
// TYPES: numeric, mcq, contextual, geometry, expression
// DOMAINE: Fractions (addition/soustraction, mêmes/dénom. simples),
//          Proportionnalité, Pourcentages simples, Volume pavé droit,
//          Symétrie axiale
// IMPORTANT: Respecte excludeGeometry
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion,
  FIRST_NAMES
} from './types';

export class CM2Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CM2';
  private readonly eloRange = { min: 1085, max: 1255 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    const domains: DomainType[] = ['fractions', 'calculation', 'contextual'];
    if (!excludeGeometry) {
      domains.push('geometry');
    }
    return domains;
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domains = this.getAvailableDomains(context.excludeGeometry);
    const domain = randomChoice(domains);

    switch (domain) {
      case 'fractions':
        return this.generateFractionsQuestion();
      case 'calculation':
        return this.generateCalculationQuestion();
      case 'geometry':
        return this.generateGeometryQuestion();
      case 'contextual':
        return this.generateContextualQuestion();
      default:
        return this.generateFractionsQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Fractions Domain (Avancé)
  // --------------------------------------------------------------------------

  private generateFractionsQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateFractionSubtraction(),
      () => this.generateFractionDifferentDenominator(),
      () => this.generateFractionDecimalConversion(),
    ];
    return randomChoice(generators)();
  }

  private generateFractionSubtraction(): GeneratedQuestion {
    const denominator = randomChoice([4, 5, 6, 7, 8, 9, 10]);
    const num1 = randomInt(2, denominator - 1);
    const num2 = randomInt(1, num1 - 1);
    const resultNum = num1 - num2;
    
    return {
      id: hashQuestion(this.level, 'fractions', [num1, num2, denominator]),
      type: 'numeric',
      domain: 'fractions',
      level: this.level,
      difficultyElo: 1100,
      question: `${num1}/${denominator} - ${num2}/${denominator} = ? (format: a/b)`,
      answer: `${resultNum}/${denominator}`,
      explanation: `Quand les dénominateurs sont identiques, on soustrait les numérateurs : ${num1}/${denominator} - ${num2}/${denominator} = ${resultNum}/${denominator}`,
      timeEstimate: 35
    };
  }

  private generateFractionDifferentDenominator(): GeneratedQuestion {
    // 1/4 + 1/2 = ? (réduire au même dénominateur)
    const den1 = randomChoice([2, 3, 4]);
    const den2 = den1 * 2;
    const num1 = 1;
    const num2 = 1;
    const commonDen = den2;
    const newNum1 = num1 * (commonDen / den1);
    const resultNum = newNum1 + num2;
    
    return {
      id: hashQuestion(this.level, 'fractions', [num1, den1, num2, den2]),
      type: 'numeric',
      domain: 'fractions',
      level: this.level,
      difficultyElo: 1180,
      question: `${num1}/${den1} + ${num2}/${den2} = ? (format: a/b)`,
      answer: `${resultNum}/${commonDen}`,
      explanation: `On réduit au même dénominateur : ${num1}/${den1} = ${newNum1}/${commonDen}. Puis ${newNum1}/${commonDen} + ${num2}/${commonDen} = ${resultNum}/${commonDen}`,
      timeEstimate: 50
    };
  }

  private generateFractionDecimalConversion(): GeneratedQuestion {
    const fractions: Array<[number, number, string]> = [
      [1, 2, '0,5'], [1, 4, '0,25'], [3, 4, '0,75'],
      [1, 5, '0,2'], [2, 5, '0,4'], [3, 5, '0,6'],
      [1, 10, '0,1'], [3, 10, '0,3'], [7, 10, '0,7'],
    ];
    
    const [num, den, decimal] = randomChoice(fractions);
    
    const format = randomChoice([
      { q: `${num}/${den} = ? (en décimal)`, a: decimal },
      { q: `${decimal} = ? (en fraction)`, a: `${num}/${den}` },
    ]);
    
    return {
      id: hashQuestion(this.level, 'fractions', [num, den]),
      type: 'numeric',
      domain: 'fractions',
      level: this.level,
      difficultyElo: 1150,
      question: format.q,
      answer: format.a,
      acceptableAnswers: [format.a, format.a.replace(',', '.')],
      explanation: `${num}/${den} = ${num} ÷ ${den} = ${decimal}`,
      timeEstimate: 30
    };
  }

  // --------------------------------------------------------------------------
  // Calculation Domain (Proportionnalité, Pourcentages)
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateProportionalityTable(),
      () => this.generatePercentageSimple(),
    ];
    return randomChoice(generators)();
  }

  private generateProportionalityTable(): GeneratedQuestion {
    const factor = randomInt(2, 6);
    const values = [randomInt(1, 5), randomInt(6, 10), randomInt(11, 15), randomInt(16, 20)];
    const results = values.map(v => v * factor);
    
    const missingIndex = randomInt(0, 3);
    const missingValue = results[missingIndex];
    
    const display = values.map((v, i) => `| ${v} `).join('') + '|\n' +
                    results.map((r, i) => i === missingIndex ? '| ? ' : `| ${r} `).join('') + '|';
    
    return {
      id: hashQuestion(this.level, 'calculation', [factor, missingIndex]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 1200,
      question: `Complète le tableau de proportionnalité :\n${display}\nChaque nombre de la 2ème ligne est le nombre de la 1ère ligne × ?`,
      answer: missingValue.toString(),
      explanation: `Le coefficient de proportionnalité est ${factor}. Donc ? = ${values[missingIndex]} × ${factor} = ${missingValue}`,
      timeEstimate: 45
    };
  }

  private generatePercentageSimple(): GeneratedQuestion {
    const base = randomInt(20, 200);
    const percentages = [
      { p: 10, calc: base / 10 },
      { p: 25, calc: base / 4 },
      { p: 50, calc: base / 2 },
    ];
    
    const { p, calc } = randomChoice(percentages);
    const result = Math.round(calc);
    
    return {
      id: hashQuestion(this.level, 'calculation', [base, p]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 1220,
      question: `Quel est ${p}% de ${base} ?`,
      answer: result.toString(),
      explanation: `${p}% de ${base} = (${base} × ${p}) / 100 = ${base * p}/100 = ${result}`,
      timeEstimate: 35
    };
  }

  // --------------------------------------------------------------------------
  // Geometry Domain (Volume, Symétrie)
  // --------------------------------------------------------------------------

  private generateGeometryQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateVolumePave(),
      () => this.generateVolumeCube(),
    ];
    return randomChoice(generators)();
  }

  private generateVolumePave(): GeneratedQuestion {
    const length = randomInt(4, 12);
    const width = randomInt(3, 8);
    const height = randomInt(2, 6);
    const volume = length * width * height;
    
    return {
      id: hashQuestion(this.level, 'geometry', [length, width, height]),
      type: 'numeric',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 1190,
      question: `Volume d'un pavé droit de ${length} cm × ${width} cm × ${height} cm ?`,
      answer: volume.toString(),
      explanation: `Volume = longueur × largeur × hauteur = ${length} × ${width} × ${height} = ${volume} cm³`,
      timeEstimate: 40
    };
  }

  private generateVolumeCube(): GeneratedQuestion {
    const side = randomInt(3, 10);
    const volume = side ** 3;
    
    return {
      id: hashQuestion(this.level, 'geometry', [side]),
      type: 'numeric',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 1160,
      question: `Volume d'un cube d'arête ${side} cm ?`,
      answer: volume.toString(),
      explanation: `Volume d'un cube = arête³ = ${side}³ = ${side} × ${side} × ${side} = ${volume} cm³`,
      timeEstimate: 30
    };
  }

  // --------------------------------------------------------------------------
  // Contextual Domain
  // --------------------------------------------------------------------------

  private generateContextualQuestion(): GeneratedQuestion {
    const name = randomChoice(FIRST_NAMES);
    const isFemale = ['Emma', 'Jade', 'Alice', 'Lina', 'Chloé', 'Manon', 'Sarah', 'Zoé', 'Léa', 'Juliette', 'Camille', 'Anna', 'Maëlys', 'Inès', 'Lola'].includes(name);
    const pronoun = isFemale ? 'elle' : 'il';
    
    // Réduction pourcentage
    const originalPrice = randomInt(40, 200);
    const discountPercent = randomChoice([10, 20, 25]);
    const discount = Math.round(originalPrice * discountPercent / 100);
    const finalPrice = originalPrice - discount;
    
    return {
      id: hashQuestion(this.level, 'contextual', [originalPrice, discountPercent]),
      type: 'numeric',
      domain: 'contextual',
      level: this.level,
      difficultyElo: 1230,
      question: `${name} veut acheter un article à ${originalPrice}€. Il y a une réduction de ${discountPercent}%. Quel est le nouveau prix ?`,
      answer: finalPrice.toString(),
      explanation: `Réduction : ${discountPercent}% de ${originalPrice}€ = ${discount}€. Nouveau prix : ${originalPrice} - ${discount} = ${finalPrice}€`,
      timeEstimate: 60
    };
  }
}
