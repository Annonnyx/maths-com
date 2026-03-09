// ============================================================================
// CM1 Level Question Generator (ELO 914-1084)
// ============================================================================
// TYPES: numeric, mcq, contextual, geometry, expression
// DOMAINE: Multiplication posée (a ≤ 99, b ∈ [2..9]), Division avec reste,
//          Fractions même dénominateur, Nombres décimaux (dixièmes),
//          Aire rectangle, Angles
// IMPORTANT: Respecte excludeGeometry
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion,
  FIRST_NAMES
} from './types';

export class CM1Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CM1';
  private readonly eloRange = { min: 914, max: 1084 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    const domains: DomainType[] = ['calculation', 'fractions', 'contextual'];
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
      case 'fractions':
        return this.generateFractionsQuestion();
      case 'geometry':
        return this.generateGeometryQuestion();
      case 'contextual':
        return this.generateContextualQuestion();
      default:
        return this.generateCalculationQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Calculation Domain (Mul posée, Division avec reste, Décimaux)
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateMultiplicationPosed(),
      () => this.generateDivisionWithRemainder(),
      () => this.generateDecimalAddition(),
    ];
    return randomChoice(generators)();
  }

  private generateMultiplicationPosed(): GeneratedQuestion {
    // a × b où a ≤ 99, b ∈ [2..9]
    // ⚠️ JAMAIS a×b où a,b > 30 (trop calculatoire)
    const b = randomInt(2, 9);
    const maxA = b > 5 ? 30 : 99;
    const a = randomInt(10, maxA);
    const result = a * b;
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 920,
      question: `${a} × ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} × ${b} = ${result}. On calcule : ${a} × ${b} = (${Math.floor(a/10)*10} × ${b}) + (${a%10} × ${b}) = ${Math.floor(a/10)*10*b} + ${(a%10)*b} = ${result}`,
      timeEstimate: 40
    };
  }

  private generateDivisionWithRemainder(): GeneratedQuestion {
    // a ÷ b où b ∈ [2..9], a ≤ 99
    const b = randomInt(2, 9);
    const quotient = randomInt(5, 15);
    const remainder = randomInt(1, b - 1);
    const a = b * quotient + remainder;
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b, remainder]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 960,
      question: `${a} ÷ ${b} = ? (donne le quotient)`,
      answer: quotient.toString(),
      explanation: `${a} ÷ ${b} = ${quotient} reste ${remainder} car ${quotient} × ${b} = ${quotient * b} et ${a} - ${quotient * b} = ${remainder}`,
      timeEstimate: 45
    };
  }

  private generateDecimalAddition(): GeneratedQuestion {
    // Nombres décimaux simples (dixièmes) : 3,5 + 1,2 = ?
    const a = randomInt(1, 20) + randomInt(1, 9) / 10;
    const b = randomInt(1, 20) + randomInt(1, 9) / 10;
    const result = Number((a + b).toFixed(1));
    
    return {
      id: hashQuestion(this.level, 'calculation', [Math.round(a*10), Math.round(b*10)]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 1000,
      question: `${a.toFixed(1).replace('.', ',')} + ${b.toFixed(1).replace('.', ',')} = ?`,
      answer: result.toString().replace('.', ','),
      acceptableAnswers: [result.toString(), result.toString().replace('.', ',')],
      explanation: `On additionne les dixièmes : ${a.toFixed(1)} + ${b.toFixed(1)} = ${result.toFixed(1)}`,
      timeEstimate: 35
    };
  }

  // --------------------------------------------------------------------------
  // Fractions Domain (Même dénominateur, dénominateurs simples)
  // --------------------------------------------------------------------------

  private generateFractionsQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateFractionAdditionSameDenominator(),
      () => this.generateFractionComparison(),
    ];
    return randomChoice(generators)();
  }

  private generateFractionAdditionSameDenominator(): GeneratedQuestion {
    // 2/5 + 1/5 = ?
    const denominator = randomChoice([3, 4, 5, 6, 7, 8, 9, 10]);
    const num1 = randomInt(1, denominator - 2);
    const num2 = randomInt(1, denominator - num1 - 1);
    const resultNum = num1 + num2;
    
    return {
      id: hashQuestion(this.level, 'fractions', [num1, num2, denominator]),
      type: 'numeric',
      domain: 'fractions',
      level: this.level,
      difficultyElo: 940,
      question: `${num1}/${denominator} + ${num2}/${denominator} = ? (format: a/b)`,
      answer: `${resultNum}/${denominator}`,
      explanation: `Quand les dénominateurs sont identiques, on additionne les numérateurs : ${num1}/${denominator} + ${num2}/${denominator} = ${num1 + num2}/${denominator}`,
      timeEstimate: 35
    };
  }

  private generateFractionComparison(): GeneratedQuestion {
    const denominators = [3, 4, 5, 6];
    const denominator = randomChoice(denominators);
    const num1 = randomInt(1, denominator - 1);
    const num2 = randomInt(1, denominator - 1);
    
    const symbol = num1 < num2 ? '<' : num1 > num2 ? '>' : '=';
    
    return {
      id: hashQuestion(this.level, 'fractions', [num1, num2, denominator]),
      type: 'mcq',
      domain: 'fractions',
      level: this.level,
      difficultyElo: 1020,
      question: `Complète : ${num1}/${denominator} ____ ${num2}/${denominator}`,
      answer: symbol,
      options: shuffleArray(['<', '>', '=']),
      explanation: `Avec le même dénominateur, on compare les numérateurs : ${num1} ${symbol} ${num2}, donc ${num1}/${denominator} ${symbol} ${num2}/${denominator}`,
      timeEstimate: 25
    };
  }

  // --------------------------------------------------------------------------
  // Geometry Domain (Aire rectangle, Angles)
  // --------------------------------------------------------------------------

  private generateGeometryQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateAreaRectangle(),
      () => this.generateAngleType(),
    ];
    return randomChoice(generators)();
  }

  private generateAreaRectangle(): GeneratedQuestion {
    const length = randomInt(4, 15);
    const width = randomInt(3, 10);
    const area = length * width;
    
    return {
      id: hashQuestion(this.level, 'geometry', [length, width]),
      type: 'numeric',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 980,
      question: `Aire d'un rectangle de ${length} cm de long et ${width} cm de large ?`,
      answer: area.toString(),
      explanation: `Aire = longueur × largeur = ${length} × ${width} = ${area} cm²`,
      timeEstimate: 30
    };
  }

  private generateAngleType(): GeneratedQuestion {
    const angleTypes: Array<{name: string, min?: number, max?: number, exact?: number}> = [
      { name: 'aigu', min: 10, max: 80 },
      { name: 'droit', exact: 90 },
      { name: 'obtus', min: 100, max: 170 },
    ];
    
    const target = randomChoice(angleTypes);
    const degrees = target.exact !== undefined ? target.exact : randomInt(target.min!, target.max!);
    
    return {
      id: hashQuestion(this.level, 'geometry', [degrees]),
      type: 'mcq',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 1050,
      question: `Un angle de ${degrees}° est :`,
      answer: target.name,
      options: shuffleArray(['aigu', 'droit', 'obtus', 'plat']),
      explanation: `${degrees}° est ${target.name} : aigu < 90°, droit = 90°, obtus > 90° et < 180°, plat = 180°`,
      timeEstimate: 20
    };
  }

  // --------------------------------------------------------------------------
  // Contextual Domain (Problèmes multi-étapes)
  // --------------------------------------------------------------------------

  private generateContextualQuestion(): GeneratedQuestion {
    const name = randomChoice(FIRST_NAMES);
    const isFemale = ['Emma', 'Jade', 'Alice', 'Lina', 'Chloé', 'Manon', 'Sarah', 'Zoé', 'Léa', 'Juliette', 'Camille', 'Anna', 'Maëlys', 'Inès', 'Lola'].includes(name);
    
    // Multi-étape : 2 multiplications + 1 addition, résultat < 200
    const x = randomInt(2, 8);
    const price1 = randomInt(5, 15);
    const y = randomInt(2, 8);
    const price2 = randomInt(5, 15);
    const total = x * price1 + y * price2;
    
    const objects = ['livres', 'cahiers', 'stylos', 'gommes'];
    const obj1 = randomChoice(objects);
    const obj2 = randomChoice(objects.filter(o => o !== obj1));
    
    return {
      id: hashQuestion(this.level, 'contextual', [x, price1, y, price2]),
      type: 'numeric',
      domain: 'contextual',
      level: this.level,
      difficultyElo: 1040,
      question: `${name} achète ${x} ${obj1} à ${price1}€ pièce et ${y} ${obj2} à ${price2}€ pièce. Combien dépense-${isFemale ? 't-elle' : 't-il'} au total ?`,
      answer: total.toString(),
      explanation: `${x} × ${price1}€ = ${x * price1}€ pour les ${obj1}. ${y} × ${price2}€ = ${y * price2}€ pour les ${obj2}. Total : ${x * price1} + ${y * price2} = ${total}€`,
      timeEstimate: 60
    };
  }
}
