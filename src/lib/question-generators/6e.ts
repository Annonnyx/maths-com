// ============================================================================
// 6E.TS — Générateur niveau 6e (ELO 1200-1399) — Sixième
// ============================================================================
// DOMAINES : Divisions complexes, pourcentages, multiplication fraction×fraction,
//            suppression totale des suites logiques
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class SixiemeGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '6e';
  private readonly eloRange = { min: 1200, max: 1399 };

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
      () => this.generateComplexDivision(context),
      () => this.generatePercentageCalculation(context),
      () => this.generateFractionMultiplication(context),
    ])();
  }

  private generateComplexDivision(context: GenerationContext): GeneratedQuestion {
    // Formats autorisés : XY ÷ ZA ou WXY ÷ ZA
    // Pour WXY ÷ ZA : dividende multiple du diviseur via facteur 2, 3, 5 ou 10
    const useThreeDigits = randomChoice([true, false]);
    
    let dividend: number, divisor: number, result: number;
    
    if (useThreeDigits) {
      // Format WXY ÷ ZA (3 chiffres ÷ 2 chiffres)
      const factors = [2, 3, 5, 10];
      const factor = randomChoice(factors);
      divisor = randomInt(11, 99);
      dividend = divisor * factor;
      
      // S'assurer que dividend a bien 3 chiffres
      if (dividend < 100) dividend = dividend * 10;
      if (dividend > 999) dividend = Math.floor(dividend / 10);
      
      result = factor;
    } else {
      // Format XY ÷ ZA (2 chiffres ÷ 2 chiffres)
      divisor = randomInt(11, 99);
      const quotient = randomInt(1, 9);
      dividend = divisor * quotient;
      
      // S'assurer que dividend a bien 2 chiffres
      if (dividend < 10) dividend = dividend * 10;
      if (dividend > 99) dividend = Math.floor(dividend / 10);
      
      result = quotient;
    }
    
    // Parfois ajouter une décimale
    const hasDecimal = randomChoice([true, false]);
    let finalResult = result;
    let expectedDecimals: 0 | 1 = 0;
    
    if (hasDecimal) {
      // Créer une division qui donne une décimale
      const decimalPart = randomInt(1, 9);
      dividend = dividend * 10 + decimalPart;
      finalResult = result + decimalPart / divisor;
      expectedDecimals = 1;
    }
    
    const question: GeneratedQuestion = {
      id: hashQuestion(this.level, 'complexdiv', [dividend, divisor]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${dividend} ÷ ${divisor} = ?`,
      answer: expectedDecimals === 0 ? finalResult.toString() : finalResult.toFixed(1),
      timeEstimate: 90,
      expectedDecimals,
    };
    
    // Ajouter la fonction de validation pour la tolérance décimale
    if (expectedDecimals === 1) {
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

  private generatePercentageCalculation(context: GenerationContext): GeneratedQuestion {
    // Les résultats peuvent être X.5 (demi-entiers) ou des entiers ronds
    const base = randomInt(20, 500);
    const percentages = [10, 20, 25, 50, 75, 30, 40, 60, 80, 90];
    const percentage = randomChoice(percentages);
    
    // Parfois utiliser un pourcentage qui donne un demi-entier
    const useHalfInteger = randomChoice([true, false]);
    let result: number;
    
    if (useHalfInteger) {
      // Utiliser un pourcentage impair pour obtenir un demi-entier
      const oddPercentage = randomChoice([5, 15, 35, 45, 55, 65, 85, 95]);
      result = (base * oddPercentage) / 100;
      
      // S'assurer que c'est bien un demi-entier
      if (result % 1 !== 0.5) {
        result = Math.floor(result) + 0.5;
      }
    } else {
      result = (base * percentage) / 100;
    }
    
    const problems = [
      {
        text: `Calculer ${percentage}% de ${base}`,
        answer: result.toString(),
      },
      {
        text: `Un article coûte ${base}€, il est en solde à ${percentage}% de son prix. Quel est le prix soldé ?`,
        answer: result.toString(),
      },
    ];
    
    const problem = randomChoice(problems);
    
    return {
      id: hashQuestion(this.level, 'percentage', [base, percentage]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: problem.text,
      answer: problem.answer,
      timeEstimate: 70,
    };
  }

  private generateFractionMultiplication(context: GenerationContext): GeneratedQuestion {
    // Format fraction × fraction : A/B × C/D
    const denominators = [2, 3, 4, 5, 6, 8, 10, 12];
    const denominator1 = randomChoice(denominators);
    const denominator2 = randomChoice(denominators);
    const numerator1 = randomInt(1, denominator1 - 1);
    const numerator2 = randomInt(1, denominator2 - 1);
    
    // Calculer le résultat
    const resultNum = numerator1 * numerator2;
    const resultDen = denominator1 * denominator2;
    
    // Simplifier la fraction
    const gcd = this.gcd(resultNum, resultDen);
    const simplifiedNum = resultNum / gcd;
    const simplifiedDen = resultDen / gcd;
    
    let answer = '';
    if (simplifiedDen === 1) {
      answer = simplifiedNum.toString();
    } else if (simplifiedNum > simplifiedDen) {
      const wholePart = Math.floor(simplifiedNum / simplifiedDen);
      const remainder = simplifiedNum % simplifiedDen;
      answer = remainder === 0 ? wholePart.toString() : `${wholePart} ${remainder}/${simplifiedDen}`;
    } else {
      answer = `${simplifiedNum}/${simplifiedDen}`;
    }
    
    const question: GeneratedQuestion = {
      id: hashQuestion(this.level, 'fractionmult', [numerator1, denominator1, numerator2, denominator2]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${numerator1}/${denominator1} × ${numerator2}/${denominator2} = ? Donne ta réponse sous forme de fraction ou d'entier`,
      answer,
      timeEstimate: 100,
    };
    
    // Ajouter la fonction de validation pour les fractions
    question.validate = (userInput: string | string[]) => {
      const input = Array.isArray(userInput) ? userInput[0] : userInput;
      
      if (typeof input !== 'string') return false;
      
      // Parser les formats : "3/4", "2", "1 3/4"
      const fractionMatch = input.match(/^(\d+)\s*(\d+)?\/(\d+)$/);
      const integerMatch = input.match(/^(\d+)$/);
      
      let userNum: number, userDen: number;
      
      if (fractionMatch) {
        const wholePart = parseInt(fractionMatch[1]);
        const optionalNum = fractionMatch[2];
        const den = parseInt(fractionMatch[3]);
        
        if (optionalNum) {
          userNum = wholePart * den + parseInt(optionalNum);
          userDen = den;
        } else {
          userNum = parseInt(fractionMatch[1]);
          userDen = den;
        }
      } else if (integerMatch) {
        userNum = parseInt(integerMatch[1]);
        userDen = 1;
      } else {
        return false;
      }
      
      // Comparer par produits croisés avec la fraction simplifiée
      return userNum * simplifiedDen === simplifiedNum * userDen;
    };
    
    return question;
  }

  // ── Arithmétique ─────────────────────────────────────────────────────────

  private generateArithmetic(context: GenerationContext): GeneratedQuestion {
    // Supprimer totalement les questions de type "suite" du pool logique
    return randomChoice([
      () => this.generateComplexWordProblems(context),
      () => this.generateProportionalityProblems(context),
      () => this.generateGeometryProblems(context),
    ])();
  }

  private generateComplexWordProblems(context: GenerationContext): GeneratedQuestion {
    const scenarios = [
      {
        text: `Un magasin fait une promotion de 25% sur un article à 80€. Quel est le prix après réduction ?`,
        answer: '60',
      },
      {
        text: `Dans une classe de 24 élèves, 75% aiment les mathématiques. Combien d'élèves aiment les mathématiques ?`,
        answer: '18',
      },
      {
        text: `Une recette nécessite 3/4 de litre de lait. Si on veut faire 2 fois la recette, combien de litres faut-il ?`,
        answer: '1.5',
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'wordproblem', [scenarios.indexOf(scenario)]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      timeEstimate: 120,
    };
  }

  private generateProportionalityProblems(context: GenerationContext): GeneratedQuestion {
    const baseValue = randomInt(5, 50);
    const multiplier = randomInt(2, 8);
    const resultValue = baseValue * multiplier;
    
    const scenarios = [
      {
        text: `Si ${baseValue} stylos coûtent 12€, combien coûtent ${multiplier} stylos ?`,
        answer: (12 * multiplier / baseValue).toFixed(2) + '€',
      },
      {
        text: `Une voiture consomme ${baseValue}L pour 100km. Combien consomme-t-elle pour ${multiplier * 100}km ?`,
        answer: (baseValue * multiplier).toString() + 'L',
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
      timeEstimate: 90,
    };
  }

  private generateGeometryProblems(context: GenerationContext): GeneratedQuestion {
    const length = randomInt(5, 20);
    const width = randomInt(5, 20);
    
    const problems = [
      {
        text: `Un rectangle mesure ${length} cm de longueur et ${width} cm de largeur. Quel est son périmètre ?`,
        answer: (2 * (length + width)).toString() + ' cm',
      },
      {
        text: `Quelle est l'aire d'un carré de côté ${length} cm ?`,
        answer: (length * length).toString() + ' cm²',
      },
    ];
    
    const problem = randomChoice(problems);
    
    return {
      id: hashQuestion(this.level, 'geometry', [length, width, problems.indexOf(problem)]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: problem.text,
      answer: problem.answer,
      timeEstimate: 80,
    };
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
