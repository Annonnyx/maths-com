// ============================================================================
// CE1.TS — Générateur niveau CE1 (ELO 550-649) — Cours Élémentaire 1
// ============================================================================
// DOMAINES : Additions/soustractions jusqu'à 99, tables de multiplication (2,5,10),
//            mesures simples, problèmes avec contexte
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class CE1Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CE1';
  private readonly eloRange = { min: 550, max: 649 };

  getEloRange() { return this.eloRange; }

  getAvailableDomains(_excludeGeometry: boolean): DomainType[] {
    return ['calculation', 'arithmetic'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domain = randomChoice(this.getAvailableDomains(context.excludeGeometry ?? false));
    switch (domain) {
      case 'calculation': return this.generateCalculation(context);
      case 'arithmetic':  return this.generateArithmetic(context);
      default:            return this.generateCalculation(context);
    }
  }

  // ── Calcul ───────────────────────────────────────────────────────────────

  private generateCalculation(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generateAddition(context),
      () => this.generateSubtraction(context),
      () => this.generateMultiplication(context),
      () => this.generateMissingNumber(context),
    ])();
  }

  private generateAddition(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE1');
    const a = ops.addition();
    const b = ops.addition();
    const result = a + b;
    
    return {
      id: hashQuestion(this.level, 'addition', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} + ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} + ${b} = ${result}`,
      timeEstimate: 25,
    };
  }

  private generateSubtraction(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE1');
    const b = ops.subtraction();
    const result = randomInt(0, b);
    const a = b + result;
    
    return {
      id: hashQuestion(this.level, 'subtraction', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} - ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} - ${b} = ${result}`,
      timeEstimate: 30,
    };
  }

  private generateMultiplication(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE1');
    const { a, b } = ops.multiplication();
    const result = a * b;
    
    return {
      id: hashQuestion(this.level, 'multiplication', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} × ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} × ${b} = ${result}`,
      timeEstimate: 30,
    };
  }

  private generateMissingNumber(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE1');
    const a = ops.addition();
    const b = ops.addition();
    const result = a + b;
    const missingPosition = randomInt(0, 2);
    
    let question = '';
    let answer = '';
    
    switch (missingPosition) {
      case 0:
        question = `? + ${b} = ${result}`;
        answer = a.toString();
        break;
      case 1:
        question = `${a} + ? = ${result}`;
        answer = b.toString();
        break;
      case 2:
        question = `${a} + ${b} = ?`;
        answer = result.toString();
        break;
    }
    
    return {
      id: hashQuestion(this.level, 'missing', [a, b, missingPosition]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer,
      explanation: `${a} + ${b} = ${result}, donc le nombre manquant est ${answer}`,
      timeEstimate: 35,
    };
  }

  // ── Arithmétique ─────────────────────────────────────────────────────────

  private generateArithmetic(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generateWordProblem(context),
      () => this.generateMeasurement(context),
      () => this.generateNumberPattern(context),
      () => this.generateSimpleDivision(context),
    ])();
  }

  private generateWordProblem(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE1');
    const a = ops.addition();
    const b = ops.addition();
    const result = a + b;
    
    const scenarios = [
      { text: `Lucas a ${a} cartes et reçoit ${b} cartes en plus. Combien a-t-il de cartes maintenant ?`, answer: result.toString() },
      { text: `Une classe a ${a} élèves et ${b} élèves arrivent. Combien y a-t-il d'élèves au total ?`, answer: result.toString() },
      { text: `Léa lit ${a} pages le matin et ${b} pages l'après-midi. Combien de pages a-t-elle lues ?`, answer: result.toString() },
    ];
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'wordproblem', [a, b]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      explanation: `${a} + ${b} = ${result}`,
      timeEstimate: 60,
    };
  }

  private generateMeasurement(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE1');
    const a = ops.addition();
    const b = ops.addition();
    const result = a + b;
    
    const units = ['cm', 'm', 'kg', 'g'];
    const unit = randomChoice(units);
    
    const scenarios = [
      { text: `Une ficelle mesure ${a} ${unit} et ${b} ${unit}. Quelle est sa longueur totale ?`, answer: `${result} ${unit}` },
      { text: `Un paquet pèse ${a} ${unit} et un autre pèse ${b} ${unit}. Quel est le poids total ?`, answer: `${result} ${unit}` },
    ];
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'measurement', [a, b, unit]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      explanation: `${a} ${unit} + ${b} ${unit} = ${result} ${unit}`,
      timeEstimate: 45,
    };
  }

  private generateNumberPattern(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE1');
    const step = randomInt(2, Math.min(10, ops.addition()));
    const start = randomInt(0, 20);
    const sequence = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
    const missingIndex = randomInt(1, 4);
    const correctAnswer = sequence[missingIndex].toString();
    
    let question = 'Complète la suite numérique : ';
    for (let i = 0; i < sequence.length; i++) {
      if (i === missingIndex) {
        question += '? ';
      } else {
        question += sequence[i] + ' ';
      }
    }
    
    return {
      id: hashQuestion(this.level, 'pattern', [start, step, missingIndex]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer: correctAnswer,
      explanation: `La suite augmente de ${step} à chaque fois : ${sequence.join(', ')}`,
      timeEstimate: 35,
    };
  }

  private generateSimpleDivision(context: GenerationContext): GeneratedQuestion {
    // Division simple : partage équitable (tables de 2, 5, 10)
    const divisors = [2, 5, 10];
    const divisor = randomChoice(divisors);
    const quotient = randomInt(1, 10);
    const dividend = divisor * quotient;
    
    const scenarios = [
      { text: `${dividend} bonbons sont partagés entre ${divisor} enfants. Combien chaque enfant reçoit-il de bonbons ?`, answer: quotient.toString() },
      { text: `${dividend} fleurs sont mises dans ${divisor} bouquets. Combien y a-t-il de fleurs par bouquet ?`, answer: quotient.toString() },
    ];
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'division', [dividend, divisor]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      explanation: `${dividend} ÷ ${divisor} = ${quotient}`,
      timeEstimate: 50,
    };
  }
}
