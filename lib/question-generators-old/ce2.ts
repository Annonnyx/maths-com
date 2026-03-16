// ============================================================================
// CE2 Level Question Generator (ELO 743-913)
// ============================================================================
// TYPES: numeric, mcq, contextual, geometry
// DOMAINE: Tables 1-9, Division exacte, Fractions simples (1/2, 1/3, 1/4),
//          Périmètre rectangle/carré
// IMPORTANT: Respecte excludeGeometry
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion,
  FIRST_NAMES, OBJECTS
} from './types';

export class CE2Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CE2';
  private readonly eloRange = { min: 743, max: 913 };

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
  // Calculation Domain (Tables 1-9, Division)
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateMultiplication(),
      () => this.generateDivision(),
      () => this.generateMissingFactor(),
    ];
    return randomChoice(generators)();
  }

  private generateMultiplication(): GeneratedQuestion {
    const a = randomInt(2, 9);
    const b = randomInt(2, 9);
    const result = a * b;
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 750,
      question: `${a} × ${b} = ?`,
      answer: result.toString(),
      explanation: `Table de ${a} : ${Array.from({length: 9}, (_, i) => `${a}×${i+1}=${a*(i+1)}`).join(', ')}. Donc ${a} × ${b} = ${result}`,
      timeEstimate: 20
    };
  }

  private generateDivision(): GeneratedQuestion {
    // Générer b (diviseur) et résultat d'abord, puis a
    const b = randomInt(2, 9);
    const result = randomInt(2, 9);
    const a = b * result;
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 800,
      question: `${a} ÷ ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} ÷ ${b} = ${result} car ${result} × ${b} = ${a}`,
      timeEstimate: 25
    };
  }

  private generateMissingFactor(): GeneratedQuestion {
    const tables = [2, 3, 4, 5, 6, 7, 8, 9];
    const table = randomChoice(tables);
    const factor = randomInt(2, 9);
    const result = table * factor;
    
    const formats = [
      `${table} × ? = ${result}`,
      `? × ${table} = ${result}`,
    ];
    
    return {
      id: hashQuestion(this.level, 'calculation', [table, factor]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 850,
      question: randomChoice(formats),
      answer: factor.toString(),
      explanation: `Si ${table} × ? = ${result}, alors ? = ${result} ÷ ${table} = ${factor}`,
      timeEstimate: 30
    };
  }

  // --------------------------------------------------------------------------
  // Fractions Domain (1/2, 1/3, 1/4 d'un entier)
  // --------------------------------------------------------------------------

  private generateFractionsQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateFractionOfNumber(),
      () => this.generateSimpleFractionAddition(),
    ];
    return randomChoice(generators)();
  }

  private generateFractionOfNumber(): GeneratedQuestion {
    const denominators = [2, 3, 4];
    const denominator = randomChoice(denominators);
    const numerator = 1;
    const baseNumber = denominator * randomInt(2, 12); // Pour avoir un résultat entier
    const result = (numerator * baseNumber) / denominator;
    
    return {
      id: hashQuestion(this.level, 'fractions', [numerator, denominator, baseNumber]),
      type: 'numeric',
      domain: 'fractions',
      level: this.level,
      difficultyElo: 820,
      question: `${numerator}/${denominator} de ${baseNumber} = ?`,
      answer: result.toString(),
      explanation: `${numerator}/${denominator} de ${baseNumber} = ${baseNumber} ÷ ${denominator} = ${result}`,
      timeEstimate: 30
    };
  }

  private generateSimpleFractionAddition(): GeneratedQuestion {
    // Même dénominateur : 1/4 + 2/4 = ?
    const denominator = randomChoice([2, 3, 4, 5]);
    const num1 = randomInt(1, denominator - 1);
    const num2 = randomInt(1, denominator - num1);
    const resultNum = num1 + num2;
    
    return {
      id: hashQuestion(this.level, 'fractions', [num1, num2, denominator]),
      type: 'numeric',
      domain: 'fractions',
      level: this.level,
      difficultyElo: 880,
      question: `${num1}/${denominator} + ${num2}/${denominator} = ? (donne le numérateur)`,
      answer: resultNum.toString(),
      explanation: `${num1}/${denominator} + ${num2}/${denominator} = ${num1 + num2}/${denominator}. Quand les dénominateurs sont identiques, on additionne les numérateurs.`,
      timeEstimate: 35
    };
  }

  // --------------------------------------------------------------------------
  // Geometry Domain (Périmètre rectangle/carré)
  // --------------------------------------------------------------------------

  private generateGeometryQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generatePerimeterRectangle(),
      () => this.generatePerimeterSquare(),
    ];
    return randomChoice(generators)();
  }

  private generatePerimeterRectangle(): GeneratedQuestion {
    const length = randomInt(5, 15);
    const width = randomInt(3, 8);
    const perimeter = 2 * (length + width);
    
    return {
      id: hashQuestion(this.level, 'geometry', [length, width]),
      type: 'numeric',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 860,
      question: `Périmètre d'un rectangle de ${length} cm de long et ${width} cm de large ?`,
      answer: perimeter.toString(),
      explanation: `Périmètre = 2 × (longueur + largeur) = 2 × (${length} + ${width}) = 2 × ${length + width} = ${perimeter} cm`,
      timeEstimate: 35
    };
  }

  private generatePerimeterSquare(): GeneratedQuestion {
    const side = randomInt(4, 12);
    const perimeter = 4 * side;
    
    return {
      id: hashQuestion(this.level, 'geometry', [side]),
      type: 'numeric',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 830,
      question: `Périmètre d'un carré de côté ${side} cm ?`,
      answer: perimeter.toString(),
      explanation: `Périmètre d'un carré = 4 × côté = 4 × ${side} = ${perimeter} cm`,
      timeEstimate: 25
    };
  }

  // --------------------------------------------------------------------------
  // Contextual Domain
  // --------------------------------------------------------------------------

  private generateContextualQuestion(): GeneratedQuestion {
    const name = randomChoice(FIRST_NAMES);
    const isFemale = ['Emma', 'Jade', 'Alice', 'Lina', 'Chloé', 'Manon', 'Sarah', 'Zoé', 'Léa', 'Juliette', 'Camille', 'Anna', 'Maëlys', 'Inès', 'Lola'].includes(name);
    const pronoun = isFemale ? 'elle' : 'il';
    
    // Partage équitable
    const object = randomChoice(OBJECTS.CE2);
    const total = randomInt(12, 48);
    const people = randomChoice([2, 3, 4, 6]);
    const perPerson = total / people;
    
    return {
      id: hashQuestion(this.level, 'contextual', [total, people]),
      type: 'numeric',
      domain: 'contextual',
      level: this.level,
      difficultyElo: 870,
      question: `${name} veut partager ${total} ${object} équitablement entre ${people} personnes. Combien chacun recevra-t-${isFemale ? 'elle' : 'il'} ?`,
      answer: perPerson.toString(),
      explanation: `${total} ÷ ${people} = ${perPerson}. Chaque personne reçoit ${perPerson} ${object}.`,
      timeEstimate: 40
    };
  }
}
