// ============================================================================
// CE1 Level Question Generator (ELO 571-742)
// ============================================================================
// TYPES: numeric, mcq, visual_mcq, contextual
// DOMAINE: Nombres (0-99), Calcul avec retenue simple, Tables 2/5/10, Mesures
// IMPORTANT: Respecte excludeGeometry
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion,
  FIRST_NAMES, OBJECTS
} from './types';

export class CE1Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CE1';
  private readonly eloRange = { min: 571, max: 742 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    const domains: DomainType[] = ['numbers', 'calculation', 'measurement', 'contextual'];
    if (!excludeGeometry) {
      domains.push('geometry');
    }
    return domains;
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domains = this.getAvailableDomains(context.excludeGeometry);
    const domain = randomChoice(domains);

    switch (domain) {
      case 'numbers':
        return this.generateNumbersQuestion();
      case 'calculation':
        return this.generateCalculationQuestion();
      case 'measurement':
        return this.generateMeasurementQuestion();
      case 'geometry':
        return this.generateGeometryQuestion();
      case 'contextual':
        return this.generateContextualQuestion();
      default:
        return this.generateCalculationQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Numbers Domain (0-99)
  // --------------------------------------------------------------------------

  private generateNumbersQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateDecomposition(),
      () => this.generateNumberLine(),
      () => this.generateComplementToTen(),
    ];
    return randomChoice(generators)();
  }

  private generateDecomposition(): GeneratedQuestion {
    const num = randomInt(11, 99);
    const tens = Math.floor(num / 10);
    const units = num % 10;
    
    const format = randomChoice([
      `${num} = ${tens} dizaine${tens > 1 ? 's' : ''} et ${units} unité${units > 1 ? 's' : ''}`,
      `${num} = ${tens * 10} + ?`,
      `${num} = ? + ${units}`,
    ]);

    let answer: string;
    let question: string;

    if (format.includes('dizaine')) {
      question = `Décompose le nombre ${num}`;
      answer = format;
    } else if (format.includes(`${tens * 10}`)) {
      question = format;
      answer = (tens * 10).toString();
    } else {
      question = format;
      answer = units.toString();
    }

    return {
      id: hashQuestion(this.level, 'numbers', [num]),
      type: 'numeric',
      domain: 'numbers',
      level: this.level,
      difficultyElo: 580,
      question,
      answer,
      explanation: `${num} = ${tens} dizaine${tens > 1 ? 's' : ''} et ${units} unité${units > 1 ? 's' : ''} = ${tens * 10} + ${units}`,
      timeEstimate: 25
    };
  }

  private generateNumberLine(): GeneratedQuestion {
    const center = randomInt(20, 80);
    const step = randomInt(5, 10);
    const marks = [center - step, center, center + step, center + 2 * step];
    const missingIndex = randomInt(0, 3);
    const missingValue = marks[missingIndex];
    
    const lineDisplay = marks.map((m, i) => i === missingIndex ? '?' : m.toString()).join(' — ');
    
    return {
      id: hashQuestion(this.level, 'numbers', [center, step, missingIndex]),
      type: 'numeric',
      domain: 'numbers',
      level: this.level,
      difficultyElo: 620,
      question: `Sur la droite numérique : ${lineDisplay}\nQuel nombre manque ?`,
      answer: missingValue.toString(),
      explanation: `Les nombres augmentent de ${step} en ${step}. Après ${marks[missingIndex > 0 ? missingIndex - 1 : 0]} vient ${missingValue}.`,
      timeEstimate: 25
    };
  }

  private generateComplementToTen(): GeneratedQuestion {
    const a = randomInt(1, 9);
    const b = 10 - a;
    
    return {
      id: hashQuestion(this.level, 'numbers', [a, b]),
      type: 'numeric',
      domain: 'numbers',
      level: this.level,
      difficultyElo: 650,
      question: `${a} + ? = 10`,
      answer: b.toString(),
      explanation: `Le complément à 10 de ${a} est ${b} car ${a} + ${b} = 10. On peut compter : ${a}, ${a + 1}, ${a + 2}, ..., 10`,
      timeEstimate: 15
    };
  }

  // --------------------------------------------------------------------------
  // Calculation Domain (+, - avec retenue simple, × 2/5/10)
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateAddition(),
      () => this.generateSubtraction(),
      () => this.generateMultiplicationTable(),
      () => this.generateHalf(),
    ];
    return randomChoice(generators)();
  }

  private generateAddition(): GeneratedQuestion {
    const a = randomInt(10, 50);
    const b = randomInt(10, 50);
    const result = a + b;
    
    const wrongAnswers = [
      result + 10,
      result - 10,
      a + b + 1,
    ].filter(x => x > 0 && x !== result).slice(0, 3);
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'mcq',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 600,
      question: `Calcule : ${a} + ${b}`,
      answer: result.toString(),
      options: shuffleArray([result.toString(), ...wrongAnswers.map(String)]),
      explanation: `${a} + ${b} = ${result}. On additionne les dizaines (${Math.floor(a/10)}0 + ${Math.floor(b/10)}0 = ${Math.floor(result/10)}0) et les unités (${a%10} + ${b%10} = ${(a%10)+(b%10)}).`,
      timeEstimate: 30
    };
  }

  private generateSubtraction(): GeneratedQuestion {
    const a = randomInt(20, 99);
    const b = randomInt(10, a);
    const result = a - b;
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 650,
      question: `${a} - ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} - ${b} = ${result}. On soustrait les dizaines puis les unités.`,
      timeEstimate: 30
    };
  }

  private generateMultiplicationTable(): GeneratedQuestion {
    const tables = [2, 5, 10];
    const table = randomChoice(tables);
    const factor = randomInt(1, 10);
    const result = table * factor;
    
    const formats = [
      `${table} × ${factor} = ?`,
      `${factor} × ${table} = ?`,
      `${table} × □ = ${result}`,
    ];
    
    const format = randomChoice(formats);
    let question: string;
    let answer: string;
    
    if (format.includes('□')) {
      question = format;
      answer = factor.toString();
    } else {
      question = format;
      answer = result.toString();
    }
    
    return {
      id: hashQuestion(this.level, 'calculation', [table, factor]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 700,
      question,
      answer,
      explanation: `Table de ${table} : ${table} × ${factor} = ${result}. On peut compter par pas de ${table} : ${Array.from({length: factor}, (_, i) => table * (i + 1)).join(', ')}`,
      timeEstimate: 25
    };
  }

  private generateHalf(): GeneratedQuestion {
    const num = randomChoice([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
    const result = num / 2;
    
    return {
      id: hashQuestion(this.level, 'calculation', [num]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 720,
      question: `La moitié de ${num} est ?`,
      answer: result.toString(),
      explanation: `La moitié de ${num} est ${result} car ${result} + ${result} = ${num} (ou ${num} ÷ 2 = ${result})`,
      timeEstimate: 20
    };
  }

  // --------------------------------------------------------------------------
  // Measurement Domain (durées simples, longueurs)
  // --------------------------------------------------------------------------

  private generateMeasurementQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateTimeDuration(),
      () => this.generateLengthComparison(),
    ];
    return randomChoice(generators)();
  }

  private generateTimeDuration(): GeneratedQuestion {
    const startHour = randomInt(1, 11);
    const duration = randomChoice([1, 2, 3]);
    const endHour = startHour + duration;
    
    const scenarios = [
      `Un film commence à ${startHour}h et dure ${duration} heure${duration > 1 ? 's' : ''}. À quelle heure finit-il ?`,
      `Il est ${startHour}h. Dans ${duration} heure${duration > 1 ? 's' : ''}, quelle heure sera-t-il ?`,
    ];
    
    return {
      id: hashQuestion(this.level, 'measurement', [startHour, duration]),
      type: 'numeric',
      domain: 'measurement',
      level: this.level,
      difficultyElo: 680,
      question: randomChoice(scenarios),
      answer: `${endHour}h`,
      acceptableAnswers: [endHour.toString(), `${endHour}h`, `${endHour}:00`],
      explanation: `${startHour}h + ${duration}h = ${endHour}h. On ajoute ${duration} au nombre d'heures.`,
      timeEstimate: 25
    };
  }

  private generateLengthComparison(): GeneratedQuestion {
    const a = randomInt(5, 50);
    const b = randomInt(5, 50);
    
    const comparison = a < b ? 'plus petit' : a > b ? 'plus grand' : 'égal';
    const symbol = a < b ? '<' : a > b ? '>' : '=';
    
    return {
      id: hashQuestion(this.level, 'measurement', [a, b]),
      type: 'mcq',
      domain: 'measurement',
      level: this.level,
      difficultyElo: 650,
      question: `Complète : ${a} cm ____ ${b} cm`,
      answer: symbol,
      options: shuffleArray(['<', '>', '=']),
      explanation: `${a} cm est ${comparison} que ${b} cm, donc on utilise ${symbol}`,
      timeEstimate: 15
    };
  }

  // --------------------------------------------------------------------------
  // Geometry Domain (si non exclu)
  // --------------------------------------------------------------------------

  private generateGeometryQuestion(): GeneratedQuestion {
    return this.generateSymmetryRecognition();
  }

  private generateSymmetryRecognition(): GeneratedQuestion {
    const shapes = [
      { name: 'carré', hasSymmetry: true },
      { name: 'rectangle', hasSymmetry: true },
      { name: 'triangle équilatéral', hasSymmetry: true },
      { name: 'cercle', hasSymmetry: true },
      { name: 'triangle scalène', hasSymmetry: false },
    ];
    
    const target = randomChoice(shapes);
    
    return {
      id: hashQuestion(this.level, 'geometry', [shapes.findIndex(s => s.name === target.name)]),      type: 'mcq',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 700,
      question: `Le ${target.name} a-t-il un axe de symétrie ?`,
      answer: target.hasSymmetry ? 'Oui' : 'Non',
      options: shuffleArray(['Oui', 'Non']),
      explanation: `Le ${target.name} ${target.hasSymmetry ? 'a au moins un axe de symétrie (on peut le plier en deux parties égales)' : "n'a pas d'axe de symétrie"}.`,
      timeEstimate: 20
    };
  }

  // --------------------------------------------------------------------------
  // Contextual Domain (Problèmes à 1-2 étapes)
  // --------------------------------------------------------------------------

  private generateContextualQuestion(): GeneratedQuestion {
    const name = randomChoice(FIRST_NAMES);
    const isFemale = ['Emma', 'Jade', 'Alice', 'Lina', 'Chloé', 'Manon', 'Sarah', 'Zoé', 'Léa', 'Juliette', 'Camille', 'Anna', 'Maëlys', 'Inès', 'Lola'].includes(name);
    const pronoun = isFemale ? 'elle' : 'il';
    
    // Template 1: Addition simple
    const template1 = () => {
      const object = randomChoice(OBJECTS.CE1);
      const x = randomInt(5, 30);
      const y = randomInt(3, 20);
      const result = x + y;
      
      return {
        id: hashQuestion(this.level, 'contextual', [x, y]),
        type: 'numeric',
        domain: 'contextual',
        level: this.level,
        difficultyElo: 650,
        question: `${name} a ${x} ${object} et en reçoit ${y}. Combien en a-${isFemale ? 't' : ''}-il maintenant ?`,
        answer: result.toString(),
        explanation: `${x} + ${y} = ${result}. ${name} a maintenant ${result} ${object}.`,
        timeEstimate: 30
      };
    };
    
    // Template 2: Multiplication table 2/5/10
    const template2 = () => {
      const object = randomChoice(['boîtes', 'sachets', 'paquets']);
      const table = randomChoice([2, 5, 10]);
      const friends = randomInt(2, 6);
      const kept = randomInt(1, 10);
      const totalReceived = table * friends;
      const total = totalReceived + kept;
      
      return {
        id: hashQuestion(this.level, 'contextual', [table, friends, kept]),
        type: 'numeric',
        domain: 'contextual',
        level: this.level,
        difficultyElo: 720,
        question: `${name} reçoit ${table} ${object} de chacun de ses ${friends} amis. ${pronoun} avait déjà ${kept} ${object}. Combien en a-${isFemale ? 't' : ''}-il au total ?`,
        answer: total.toString(),
        explanation: `${table} × ${friends} = ${totalReceived} (ce que ${pronoun} a reçu). ${totalReceived} + ${kept} = ${total} (total).`,
        timeEstimate: 45
      };
    };
    
    const generator = randomChoice([template1, template2]);
    return generator() as GeneratedQuestion;
  }
}
