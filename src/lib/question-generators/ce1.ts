// ============================================================================
// CE1.TS — Générateur niveau CE1 (ELO 550-649) — Cours Élémentaire 1
// ============================================================================
// DOMAINES : Additions/soustractions jusqu'à 99, tables de multiplication (2,5,10),
//            mesures simples, problèmes avec contexte
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice,  hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class CE1Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CE1';
  private readonly eloRange = { min: 550, max: 649 };

  getEloRange() { return this.eloRange; }

  getAvailableDomains(): DomainType[] {
    return ['calculation', 'arithmetic'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domain = randomChoice(this.getAvailableDomains());
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
    // Résultat max : 500 pour le CE1
    const maxResult = 500;
    const a = randomInt(0, maxResult);
    const b = randomInt(0, maxResult - a);
    const result = a + b;
    
    return {
      id: hashQuestion(this.level, 'addition', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} + ${b} = ?`,
      answer: result.toString(),
      timeEstimate: 25,
    };
  }

  private generateSubtraction(context: GenerationContext): GeneratedQuestion {
    // Résultat toujours strictement positif : premier opérande > second
    const maxValue = 500;
    const b = randomInt(1, maxValue - 1);
    const a = randomInt(b + 1, maxValue);
    const result = a - b;
    
    return {
      id: hashQuestion(this.level, 'subtraction', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} - ${b} = ?`,
      answer: result.toString(),
      timeEstimate: 30,
    };
  }

  private generateMultiplication(context: GenerationContext): GeneratedQuestion {
    // Contraintes spécifiques CE1 : 3 chiffres au total, pas de 6 ou 7, résultat max 200
    const maxResult = 200;
    
    // Formats autorisés : A × BC ou BC × A (1 chiffre × 2 chiffres)
    // Exception : 10 × XY ou XY × 10 autorisés
    const useTen = randomChoice([true, false]);
    
    let a: number, b: number;
    
    if (useTen) {
      // Format 10 × XY ou XY × 10
      a = 10;
      b = randomInt(10, 99);
      if (randomChoice([true, false])) {
        [a, b] = [b, a]; // Inverser parfois
      }
    } else {
      // Format A × BC ou BC × A
      const singleDigit = randomInt(2, 9); // Éviter 0, 1 et exclure 6, 7
      const twoDigit = randomInt(10, 99);
      
      // Exclure les facteurs 6 et 7
      const validSingleDigits = [2, 3, 4, 5, 8, 9];
      a = randomChoice(validSingleDigits);
      b = twoDigit;
      
      if (randomChoice([true, false])) {
        [a, b] = [b, a]; // Inverser parfois
      }
    }
    
    const result = a * b;
    
    // Vérifier que le résultat ne dépasse pas 200
    if (result > maxResult) {
      // Si trop grand, réessayer avec des valeurs plus petites
      return this.generateMultiplication(context);
    }
    
    return {
      id: hashQuestion(this.level, 'multiplication', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} × ${b} = ?`,
      answer: result.toString(),
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
      timeEstimate: 50,
    };
  }
}
