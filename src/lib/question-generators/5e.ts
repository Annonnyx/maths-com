// ============================================================================
// 5E.TS — Générateur niveau 5e (ELO 1400-1599) — Cinquième
// ============================================================================
// DOMAINES : Opérations étendues (-5000 à +5000), équations simples,
//            multiples de 7 dans divisions, une décimale max
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class CinquiemeGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '5e';
  private readonly eloRange = { min: 1400, max: 1599 };

  getEloRange() { return this.eloRange; }

  getAvailableDomains(): DomainType[] {
    return ['calculation', 'arithmetic', 'algebra'];
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domain = randomChoice(this.getAvailableDomains());
    switch (domain) {
      case 'calculation': return this.generateCalculation(context);
      case 'arithmetic':  return this.generateArithmetic(context);
      case 'algebra':     return this.generateAlgebra(context);
      default:            return this.generateCalculation(context);
    }
  }

  // ── Calcul ───────────────────────────────────────────────────────────────

  private generateCalculation(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generateAdditionSubtraction(context),
      () => this.generateMultiplication(context),
      () => this.generateDivision(context),
    ])();
  }

  private generateAdditionSubtraction(context: GenerationContext): GeneratedQuestion {
    // Résultat entre -5000 et +5000
    const minValue = -5000;
    const maxValue = 5000;
    const operation = randomChoice(['addition', 'subtraction']);
    
    let a: number, b: number, result: number, question: string;
    
    if (operation === 'addition') {
      a = randomInt(minValue, maxValue);
      b = randomInt(Math.max(minValue - a, -2000), Math.min(maxValue - a, 2000));
      result = a + b;
      question = `${a} + ${b} = ?`;
    } else {
      a = randomInt(minValue, maxValue);
      b = randomInt(minValue, maxValue);
      result = a - b;
      question = `${a} - ${b} = ?`;
    }
    
    return {
      id: hashQuestion(this.level, operation, [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer: result.toString(),
      timeEstimate: 40,
    };
  }

  private generateMultiplication(context: GenerationContext): GeneratedQuestion {
    // Résultat entre -2000 et +2000
    const maxResult = 2000;
    const useNegative = randomChoice([true, false]);
    
    let a: number, b: number;
    
    if (useNegative) {
      // Facteurs négatifs possibles
      const negativeCount = randomChoice([1, 2]);
      const absA = randomInt(2, 44); // 44*44 = 1936 < 2000
      const absB = randomInt(2, 44);
      
      if (negativeCount === 1) {
        a = randomChoice([true, false]) ? -absA : absA;
        b = a < 0 ? absB : -absB;
      } else {
        a = -absA;
        b = -absB;
      }
    } else {
      a = randomInt(2, 44);
      b = randomInt(2, 44);
    }
    
    const result = a * b;
    
    // Vérifier que le résultat est dans la plage
    if (Math.abs(result) > maxResult) {
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
      timeEstimate: 60,
    };
  }

  private generateDivision(context: GenerationContext): GeneratedQuestion {
    // Résultat entre -2000 et +2000, ajouter multiples de 7
    const maxResult = 2000;
    const useSeven = randomChoice([true, false]);
    
    let divisor: number, quotient: number, dividend: number;
    
    if (useSeven) {
      // Utiliser un multiple de 7 comme diviseur ou dividende
      divisor = randomChoice([7, 14, 21, 28, 35, 42, 49]);
      quotient = randomInt(1, Math.floor(maxResult / divisor));
      dividend = divisor * quotient;
    } else {
      divisor = randomInt(2, 50);
      quotient = randomInt(1, Math.floor(maxResult / divisor));
      dividend = divisor * quotient;
    }
    
    // Parfois ajouter une décimale
    const hasDecimal = randomChoice([true, false]);
    let finalResult = quotient;
    
    if (hasDecimal) {
      const decimalPart = randomInt(1, 9);
      dividend = dividend * 10 + decimalPart;
      finalResult = quotient + decimalPart / divisor;
    }
    
    // Parfois rendre négatif
    if (randomChoice([true, false])) {
      dividend = -dividend;
      finalResult = -finalResult;
    }
    
    const question: GeneratedQuestion = {
      id: hashQuestion(this.level, 'division', [dividend, divisor]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${dividend} ÷ ${divisor} = ?`,
      answer: hasDecimal ? finalResult.toFixed(1) : finalResult.toString(),
      timeEstimate: 80,
      expectedDecimals: hasDecimal ? 1 : 0,
    };
    
    // Ajouter la fonction de validation si décimale
    if (hasDecimal) {
      question.validate = (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        const user = parseFloat(input.toString());
        if (isNaN(user)) return false;
        
        const exact = finalResult;
        const truncated = Math.floor(exact * 10) / 10;
        
        return user === exact || user === truncated;
      };
    }
    
    return question;
  }

  // ── Arithmétique ─────────────────────────────────────────────────────────

  private generateArithmetic(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generatePercentageProblems(context),
      () => this.generateProportionalityProblems(context),
      () => this.generateComplexWordProblems(context),
    ])();
  }

  private generatePercentageProblems(context: GenerationContext): GeneratedQuestion {
    const base = randomInt(50, 1000);
    const percentages = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90];
    const percentage = randomChoice(percentages);
    const result = (base * percentage) / 100;
    
    const scenarios = [
      {
        text: `Calculer ${percentage}% de ${base}`,
        answer: result.toString(),
      },
      {
        text: `Un article de ${base}€ est soldé à ${percentage}% de son prix. Quel est le prix soldé ?`,
        answer: result.toString(),
      },
      {
        text: `Le prix d'un produit augmente de ${percentage}%. Il coûtait ${base}€. Quel est le nouveau prix ?`,
        answer: (base + result).toString(),
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'percentage', [base, percentage]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      timeEstimate: 80,
    };
  }

  private generateProportionalityProblems(context: GenerationContext): GeneratedQuestion {
    const baseValue = randomInt(10, 100);
    const multiplier = randomInt(2, 12);
    const resultValue = baseValue * multiplier;
    
    const scenarios = [
      {
        text: `Si ${baseValue} kg de pommes coûtent 15€, combien coûtent ${multiplier} kg de pommes ?`,
        answer: (15 * multiplier / baseValue).toFixed(2) + '€',
      },
      {
        text: `Une voiture parcourt ${baseValue} km en 1 heure. Combien de temps faut-il pour parcourir ${resultValue} km ?`,
        answer: (resultValue / baseValue).toString() + ' heures',
      },
      {
        text: `Un mélange contient ${baseValue}% de jus d'orange. Dans une bouteille de ${multiplier * 10}cL, combien de cL de jus d'orange y a-t-il ?`,
        answer: (baseValue * multiplier * 10 / 100).toString() + ' cL',
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'proportionality', [baseValue, multiplier]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      timeEstimate: 100,
    };
  }

  private generateComplexWordProblems(context: GenerationContext): GeneratedQuestion {
    const scenarios = [
      {
        text: `Une bibliothèque achète 25 livres à 12€ chacun et reçoit une réduction de 15% sur le total. Combien paie-t-elle ?`,
        answer: '255',
      },
      {
        text: `Un cycliste parcourt 45 km en 2 heures. Quelle est sa vitesse moyenne en km/h ?`,
        answer: '22.5',
      },
      {
        text: `Dans une classe de 28 élèves, 3/4 des élèves ont réussi le test. Combien d'élèves ont réussi ?`,
        answer: '21',
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'complexword', [scenarios.indexOf(scenario)]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      timeEstimate: 120,
    };
  }

  // ── Algèbre ─────────────────────────────────────────────────────────────

  private generateAlgebra(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generateSimpleEquation(context),
    ])();
  }

  private generateSimpleEquation(context: GenerationContext): GeneratedQuestion {
    // Les solutions x sont comprises entre -20 et +20
    const x = randomInt(-20, 20);
    const a = randomInt(2, 10);
    const b = randomInt(-50, 50);
    const c = a * x + b;
    
    const equation = `${a}x + ${b >= 0 ? '+' : ''} ${b} = ${c}`;
    
    return {
      id: hashQuestion(this.level, 'equation', [a, b, c]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: context.userElo,
      question: `Résoudre : ${equation}`,
      answer: x.toString(),
      timeEstimate: 90,
    };
  }
}
