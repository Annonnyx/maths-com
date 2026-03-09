// ============================================================================
// CP Level Question Generator (ELO 400-570)
// ============================================================================
// TYPES: numeric, mcq, visual_mcq, contextual
// DOMAINE: Nombres (0-20), Calcul simple, Reconnaissance formes, Problèmes contextuels
// IMPORTANT: Respecte excludeGeometry - pas de questions géométrie si flag actif
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion,
  generateShapeSVG, FIRST_NAMES, OBJECTS, ACTIONS
} from './types';

export class CPGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CP';
  private readonly eloRange = { min: 400, max: 570 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    const domains: DomainType[] = ['numbers', 'calculation', 'contextual'];
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
      case 'geometry':
        return this.generateGeometryQuestion();
      case 'contextual':
        return this.generateContextualQuestion();
      default:
        return this.generateCalculationQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Numbers Domain (0-20)
  // --------------------------------------------------------------------------

  private generateNumbersQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateCounting(),
      () => this.generateNumberComparison(),
      () => this.generateNumberDecomposition(),
      () => this.generateEvenOdd(),
    ];
    return randomChoice(generators)();
  }

  private generateCounting(): GeneratedQuestion {
    const count = randomInt(1, 15);
    const objects = ['🍎', '🌟', '🎈', '🧸', '🎲'];
    const object = randomChoice(objects);
    
    const visualItems = Array(count).fill(object).join(' ');
    
    return {
      id: hashQuestion(this.level, 'numbers', [count]),
      type: 'visual_mcq',
      domain: 'numbers',
      level: this.level,
      difficultyElo: 400,
      question: `Compte les ${object} :`,
      answer: count.toString(),
      acceptableAnswers: [count.toString(), `${count} ${object}`],
      visualData: {
        svg: `<text x="50" y="50" font-size="30">${visualItems}</text>`,
        width: 300,
        height: 100
      },
      explanation: `Il y a ${count} ${object}. On compte : ${Array.from({length: count}, (_, i) => i + 1).join(', ')}.`,
      timeEstimate: 20
    };
  }

  private generateNumberComparison(): GeneratedQuestion {
    const a = randomInt(1, 15);
    const b = randomInt(1, 15);
    
    const operators = [
      { symbol: '<', text: 'est plus petit que', correct: a < b },
      { symbol: '>', text: 'est plus grand que', correct: a > b },
      { symbol: '=', text: 'est égal à', correct: a === b },
    ];
    
    const validOperators = operators.filter(o => o.correct);
    const selected = randomChoice(validOperators);
    
    const options = ['<', '>', '='];
    
    return {
      id: hashQuestion(this.level, 'numbers', [a, b]),
      type: 'mcq',
      domain: 'numbers',
      level: this.level,
      difficultyElo: 420,
      question: `Complète : ${a} ____ ${b}`,
      answer: selected.symbol,
      options: shuffleArray(options),
      correctOptionIndex: 0, // Will be fixed by factory
      explanation: `${a} ${selected.text} ${b}, donc on met ${selected.symbol}`,
      timeEstimate: 15
    };
  }

  private generateNumberDecomposition(): GeneratedQuestion {
    const total = randomInt(5, 12);
    const part1 = randomInt(1, total - 1);
    const part2 = total - part1;
    
    const isPart1Missing = Math.random() > 0.5;
    
    if (isPart1Missing) {
      return {
        id: hashQuestion(this.level, 'numbers', [total, part1, part2]),
        type: 'numeric',
        domain: 'numbers',
        level: this.level,
        difficultyElo: 450,
        question: `${total} = ? + ${part2}`,
        answer: part1.toString(),
        explanation: `Si ${total} = ? + ${part2}, alors ? = ${total} - ${part2} = ${part1}`,
        timeEstimate: 20
      };
    } else {
      return {
        id: hashQuestion(this.level, 'numbers', [total, part1, part2]),
        type: 'numeric',
        domain: 'numbers',
        level: this.level,
        difficultyElo: 450,
        question: `${total} = ${part1} + ?`,
        answer: part2.toString(),
        explanation: `Si ${total} = ${part1} + ?, alors ? = ${total} - ${part1} = ${part2}`,
        timeEstimate: 20
      };
    }
  }

  private generateEvenOdd(): GeneratedQuestion {
    const num = randomInt(1, 20);
    const isEven = num % 2 === 0;
    
    return {
      id: hashQuestion(this.level, 'numbers', [num]),
      type: 'mcq',
      domain: 'numbers',
      level: this.level,
      difficultyElo: 480,
      question: `Le nombre ${num} est :`,
      answer: isEven ? 'pair' : 'impair',
      options: shuffleArray(['pair', 'impair', 'pair et impair', 'ni pair ni impair']),
      explanation: `${num} est ${isEven ? 'pair' : 'impair'} car il ${isEven ? 'se divise en 2 parts égales' : 'ne se divise pas en 2 parts égales'}`,
      timeEstimate: 15
    };
  }

  // --------------------------------------------------------------------------
  // Calculation Domain (+, - sans retenue)
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateAddition(),
      () => this.generateSubtraction(),
      () => this.generateComplement(),
    ];
    return randomChoice(generators)();
  }

  private generateAddition(): GeneratedQuestion {
    // Addition a+b où a,b ≤ 10, résultat ≤ 20
    const a = randomInt(1, 10);
    const b = randomInt(1, Math.min(10, 20 - a));
    const result = a + b;
    
    const wrongAnswers = [
      result + 1,
      result - 1,
      a + b + 2,
    ].filter(x => x > 0 && x !== result).slice(0, 3);
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'mcq',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 500,
      question: `Combien font ${a} + ${b} ?`,
      answer: result.toString(),
      options: shuffleArray([result.toString(), ...wrongAnswers.map(String)]),
      explanation: `${a} + ${b} = ${result}. On peut compter : ${a}, puis ${Array.from({length: b}, (_, i) => a + i + 1).join(', ')}`,
      timeEstimate: 20,
      _meta: { operandA: a, operandB: b, operation: 'add' }
    };
  }

  private generateSubtraction(): GeneratedQuestion {
    // Soustraction a-b où a ≤ 20, résultat ≥ 0
    const a = randomInt(5, 15);
    const b = randomInt(1, a);
    const result = a - b;
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 520,
      question: `${a} - ${b} = ?`,
      answer: result.toString(),
      explanation: `Si j'ai ${a} objets et j'en enlève ${b}, il en reste ${result}. ${a} - ${b} = ${result}`,
      timeEstimate: 20,
      _meta: { operandA: a, operandB: b, operation: 'sub' }
    };
  }

  private generateComplement(): GeneratedQuestion {
    // "7 = 3 + ?"
    const total = randomInt(5, 12);
    const known = randomInt(1, total - 1);
    const unknown = total - known;
    
    return {
      id: hashQuestion(this.level, 'calculation', [total, known]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 550,
      question: `${total} = ${known} + ?`,
      answer: unknown.toString(),
      explanation: `Pour trouver le nombre manquant : ${total} - ${known} = ${unknown}. Donc ${total} = ${known} + ${unknown}`,
      timeEstimate: 25
    };
  }

  // --------------------------------------------------------------------------
  // Geometry Domain (Reconnaissance formes - UNIQUEMENT si !excludeGeometry)
  // --------------------------------------------------------------------------

  private generateGeometryQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateShapeRecognition(),
      () => this.generateCountSides(),
    ];
    return randomChoice(generators)();
  }

  private generateShapeRecognition(): GeneratedQuestion {
    const shapes: Array<{ name: string; type: 'circle' | 'square' | 'triangle' | 'rectangle' }> = [
      { name: 'le cercle', type: 'circle' },
      { name: 'le carré', type: 'square' },
      { name: 'le triangle', type: 'triangle' },
      { name: 'le rectangle', type: 'rectangle' },
    ];
    
    const target = randomChoice(shapes);
    const distractors = shapes.filter(s => s.name !== target.name);
    const selectedDistractors = shuffleArray(distractors).slice(0, 3);
    
    const allOptions = [target, ...selectedDistractors];
    const shuffledOptions = shuffleArray(allOptions);
    
    const svgWidth = 350;
    const svgHeight = 100;
    const shapeSize = 70;
    
    const svgContent = shuffledOptions.map((shape, index) => {
      const x = index * 85 + 10;
      const y = 15;
      const shapeSvg = generateShapeSVG(shape.type, shapeSize);
      return `<g transform="translate(${x}, ${y})">${shapeSvg}<text x="${shapeSize/2}" y="${shapeSize + 15}" text-anchor="middle" font-size="12">${shape.name}</text></g>`;
    }).join('');
    
    const targetIndex = shuffledOptions.findIndex(s => s.name === target.name);
    
    return {
      id: hashQuestion(this.level, 'geometry', [targetIndex, shapes.length]),
      type: 'visual_mcq',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 500,
      question: `Clique sur ${target.name}`,
      answer: target.name,
      options: shuffledOptions.map(s => s.name),
      correctOptionIndex: shuffledOptions.findIndex(s => s.name === target.name),
      visualData: {
        svg: `<svg viewBox="0 0 ${svgWidth} ${svgHeight}">${svgContent}</svg>`,
        width: svgWidth,
        height: svgHeight
      },
      explanation: `${target.name} est la forme ${target.type === 'circle' ? 'ronde' : target.type === 'square' ? 'avec 4 côtés égaux' : target.type === 'triangle' ? 'avec 3 côtés' : 'avec 4 côtés (2 longs, 2 courts)'}`,
      timeEstimate: 15
    };
  }

  private generateCountSides(): GeneratedQuestion {
    const shapes: Array<{ name: string; sides: number }> = [
      { name: 'triangle', sides: 3 },
      { name: 'carré', sides: 4 },
      { name: 'rectangle', sides: 4 },
    ];
    
    const target = randomChoice(shapes);
    const shapeIndex = shapes.findIndex(s => s.name === target.name);
    
    return {
      id: hashQuestion(this.level, 'geometry', [target.sides, shapeIndex]),
      type: 'numeric',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 530,
      question: `Combien de côtés a un ${target.name} ?`,
      answer: target.sides.toString(),
      explanation: `Un ${target.name} a ${target.sides} côté${target.sides > 1 ? 's' : ''}`,
      timeEstimate: 15
    };
  }

  // --------------------------------------------------------------------------
  // Contextual Domain (Problèmes narratifs)
  // --------------------------------------------------------------------------

  private generateContextualQuestion(): GeneratedQuestion {
    const name = randomChoice(FIRST_NAMES);
    const object = randomChoice(OBJECTS.CP);
    const action = randomChoice([...ACTIONS.give, ...ACTIONS.lose, ...ACTIONS.eat]);
    
    // X ≤ 15, Y < X, résultat ≥ 0
    const x = randomInt(3, 12);
    const y = randomInt(1, x - 1);
    const result = x - y;
    
    const isFemale = ['Emma', 'Jade', 'Alice', 'Lina', 'Chloé', 'Manon', 'Sarah', 'Zoé', 'Léa', 'Juliette', 'Camille', 'Anna', 'Maëlys', 'Inès', 'Lola'].includes(name);
    const pronoun = isFemale ? 'elle' : 'il';
    
    return {
      id: hashQuestion(this.level, 'contextual', [x, y]),
      type: 'numeric',
      domain: 'contextual',
      level: this.level,
      difficultyElo: 550,
      question: `${name} a ${x} ${object}. ${pronoun} ${action} ${y}. Combien lui en reste-t-${isFemale ? 'elle' : 'il'} ?`,
      answer: result.toString(),
      explanation: `${name} a ${x} ${object} et en ${action} ${y}. Il reste : ${x} - ${y} = ${result} ${object}`,
      timeEstimate: 30
    };
  }
}
