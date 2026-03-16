// ============================================================================
// CE2.TS — Générateur niveau CE2 (ELO 650-799) — Cours Élémentaire 2
// ============================================================================
// DOMAINES : Tables de multiplication complètes, division exacte,
//            fractions simples, problèmes complexes, début géométrie
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class CE2Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CE2';
  private readonly eloRange = { min: 650, max: 799 };

  getEloRange() { return this.eloRange; }

  getAvailableDomains(excludeGeometry: boolean = false): DomainType[] {
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
      () => this.generateMultiplication(context),
      () => this.generateDivision(context),
      () => this.generateMixedOperations(context),
      () => this.generateMissingNumber(context),
    ])();
  }

  private generateMultiplication(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE2');
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
      timeEstimate: 35,
    };
  }

  private generateDivision(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE2');
    const { divisor: b, quotient: result } = ops.division();
    const a = b * result;
    
    return {
      id: hashQuestion(this.level, 'division', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} ÷ ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} ÷ ${b} = ${result}`,
      timeEstimate: 40,
    };
  }

  private generateMixedOperations(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE2');
    const a = ops.addition();
    const { a: multA, b: multB } = ops.multiplication();
    const multResult = multA * multB;
    const finalResult = a + multResult;
    
    return {
      id: hashQuestion(this.level, 'mixed', [a, multA, multB]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} + ${multA} × ${multB} = ?`,
      answer: finalResult.toString(),
      explanation: `D'abord la multiplication : ${multA} × ${multB} = ${multResult}, puis l'addition : ${a} + ${multResult} = ${finalResult}`,
      timeEstimate: 60,
    };
  }

  private generateMissingNumber(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE2');
    const { a, b } = ops.multiplication();
    const result = a * b;
    const missingPosition = randomInt(0, 2);
    
    let question = '';
    let answer = '';
    
    switch (missingPosition) {
      case 0:
        question = `? × ${b} = ${result}`;
        answer = a.toString();
        break;
      case 1:
        question = `${a} × ? = ${result}`;
        answer = b.toString();
        break;
      case 2:
        question = `${a} × ${b} = ?`;
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
      explanation: `${a} × ${b} = ${result}, donc le nombre manquant est ${answer}`,
      timeEstimate: 40,
    };
  }

  // ── Arithmétique ─────────────────────────────────────────────────────────

  private generateArithmetic(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generateComplexWordProblem(context),
      () => this.generateSimpleFractions(context),
      () => this.generateNumberPatterns(context),
      () => this.generateMeasurementProblems(context),
    ])();
  }

  private generateComplexWordProblem(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE2');
    const { a, b } = ops.multiplication();
    const c = ops.addition();
    
    const scenarios = [
      { 
        text: `Un magasin a ${a} boîtes de ${b} crayons chacune. Il vend ${c} crayons. Combien de crayons reste-t-il ?`, 
        answer: (a * b - c).toString() 
      },
      { 
        text: `${a} enfants reçoivent chacun ${b} bonbons. Si on distribue ${c} bonbons de plus, combien y a-t-il de bonbons au total ?`, 
        answer: (a * b + c).toString() 
      },
      { 
        text: `Une bibliothèque a ${a} étagères avec ${b} livres chacune. On ajoute ${c} nouveaux livres. Combien y a-t-il de livres maintenant ?`, 
        answer: (a * b + c).toString() 
      },
    ];
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'complexword', [a, b, c]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      explanation: `Calcul : ${a} × ${b} ${scenario.text.includes('vend') ? '-' : '+'} ${c} = ${scenario.answer}`,
      timeEstimate: 90,
    };
  }

  private generateSimpleFractions(context: GenerationContext): GeneratedQuestion {
    const denominators = [2, 3, 4, 5, 6, 8, 10];
    const denominator = randomChoice(denominators);
    const numerator1 = randomInt(1, denominator - 1);
    const numerator2 = randomInt(1, denominator - 1);
    
    // Assurer que la somme ne dépasse pas 1
    const sum = numerator1 + numerator2;
    let question = '';
    let answer = '';
    
    if (sum < denominator) {
      question = `${numerator1}/${denominator} + ${numerator2}/${denominator} = ?`;
      answer = `${sum}/${denominator}`;
    } else if (sum === denominator) {
      question = `${numerator1}/${denominator} + ${numerator2}/${denominator} = ?`;
      answer = '1';
    } else {
      // Cas avec dépassement (plus avancé)
      const wholePart = Math.floor(sum / denominator);
      const remainder = sum % denominator;
      question = `${numerator1}/${denominator} + ${numerator2}/${denominator} = ?`;
      answer = remainder === 0 ? wholePart.toString() : `${wholePart} ${remainder}/${denominator}`;
    }
    
    return {
      id: hashQuestion(this.level, 'fractions', [numerator1, numerator2, denominator]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer,
      explanation: `${numerator1}/${denominator} + ${numerator2}/${denominator} = ${numerator1 + numerator2}/${denominator} = ${answer}`,
      timeEstimate: 60,
    };
  }

  private generateNumberPatterns(context: GenerationContext): GeneratedQuestion {
    const patterns = [
      { type: 'addition', step: () => randomInt(3, 15) },
      { type: 'multiplication', step: () => randomChoice([2, 3, 4, 5]) },
      { type: 'alternating', step: () => randomInt(2, 8) },
    ];
    
    const pattern = randomChoice(patterns);
    const step = pattern.step();
    const start = randomInt(1, 20);
    let sequence: number[] = [];
    
    switch (pattern.type) {
      case 'addition':
        sequence = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
        break;
      case 'multiplication':
        sequence = [start, start * step, start * step * step, start * step * step * step];
        break;
      case 'alternating':
        sequence = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
        break;
    }
    
    const missingIndex = randomInt(1, sequence.length - 1);
    const correctAnswer = sequence[missingIndex].toString();
    
    let question = 'Complète la suite : ';
    for (let i = 0; i < sequence.length; i++) {
      if (i === missingIndex) {
        question += '? ';
      } else {
        question += sequence[i] + ' ';
      }
    }
    
    return {
      id: hashQuestion(this.level, 'patterns', [start, step, pattern.type, missingIndex]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer: correctAnswer,
      explanation: `La suite ${pattern.type === 'multiplication' ? 'multiplie' : 'additionne'} par ${step} : ${sequence.join(', ')}`,
      timeEstimate: 45,
    };
  }

  private generateMeasurementProblems(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CE2');
    const { a, b } = ops.multiplication();
    const units = ['cm', 'm', 'km', 'g', 'kg', 'L', 'mL'];
    const unit = randomChoice(units);
    
    const scenarios = [
      { 
        text: `Un rectangle mesure ${a} ${unit} de longueur et ${b} ${unit} de largeur. Quel est son périmètre ?`, 
        answer: (2 * (a + b)).toString() + ' ' + unit 
      },
      { 
        text: `${a} boîtes contiennent chacune ${b} ${unit} de liquide. Quel est le volume total ?`, 
        answer: (a * b).toString() + ' ' + unit 
      },
      { 
        text: `Un camion transporte ${a} paquets pesant ${b} ${unit} chacun. Quelle est la masse totale ?`, 
        answer: (a * b).toString() + ' ' + unit 
      },
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
      explanation: `Calcul : ${scenario.text.includes('périmètre') ? `2 × (${a} + ${b}) = ${2 * (a + b)}` : `${a} × ${b} = ${a * b}`} ${unit}`,
      timeEstimate: 70,
    };
  }
}
