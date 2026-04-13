// ============================================================================
// 3E.TS — Générateur niveau 3e (ELO 1800-1999) — Troisième
// ============================================================================
// DOMAINES : Multiplication VWX × YZ, pourcentages décimaux, division fractions,
//            puissances X^Y (X ∈ [2,12], Y ∈ [2,10]), racines carrées
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class TroisiemeGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '3e';
  private readonly eloRange = { min: 1800, max: 1999 };

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
      () => this.generateComplexMultiplication(context),
      () => this.generatePowerOperations(context),
      () => this.generateSquareRoot(context),
      () => this.generateFractionDivision(context),
    ])();
  }

  private generateComplexMultiplication(context: GenerationContext): GeneratedQuestion {
    // Format VWX × YZ (3 chiffres × 2 chiffres)
    const threeDigit = randomInt(100, 321); // 321×99 ≈ 31779, raisonnable
    const twoDigit = randomInt(10, 99);
    const result = threeDigit * twoDigit;
    
    return {
      id: hashQuestion(this.level, 'complexmult', [threeDigit, twoDigit]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${threeDigit} × ${twoDigit} = ?`,
      answer: result.toString(),
      timeEstimate: 180,
    };
  }

  private generatePowerOperations(context: GenerationContext): GeneratedQuestion {
    // X ∈ [2,12], Y ∈ [2,10]
    const base = randomInt(2, 12);
    const exponent = randomInt(2, 10);
    const result = Math.pow(base, exponent);
    
    return {
      id: hashQuestion(this.level, 'power', [base, exponent]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${base}^${exponent} = ?`,
      answer: result.toString(),
      timeEstimate: 90,
    };
  }

  private generateSquareRoot(context: GenerationContext): GeneratedQuestion {
    // Deux types : carré parfait ou encadrement
    const isPerfectSquare = randomChoice([true, false]);
    
    if (isPerfectSquare) {
      // Carré parfait
      const base = randomInt(2, 20);
      const result = base * base;
      
      return {
        id: hashQuestion(this.level, 'sqrtperfect', [result]),
        type: 'numeric',
        domain: 'calculation',
        level: this.level,
        difficultyElo: context.userElo,
        question: `√${result} = ?`,
        answer: base.toString(),
        timeEstimate: 60,
      };
    } else {
      // Encadrement
      const base = randomInt(2, 50);
      const lowerRoot = Math.floor(Math.sqrt(base));
      const upperRoot = lowerRoot + 1;
      
      const question: GeneratedQuestion = {
        id: hashQuestion(this.level, 'sqrtencadrement', [base]),
        type: 'numeric',
        domain: 'calculation',
        level: this.level,
        difficultyElo: context.userElo,
        question: `√${base} est compris entre quels entiers consécutifs ?`,
        answer: `${lowerRoot} et ${upperRoot}`,
        timeEstimate: 80,
      };
      
      // Ajouter la fonction de validation pour l'encadrement
      question.validate = (userInput: string | string[]) => {
        const input = Array.isArray(userInput) ? userInput[0] : userInput;
        
        // Parser différents formats : "4 et 5", "4<√N<5", "4;5", "entre 4 et 5"
        const patterns = [
          /(\d+)\s+et\s+(\d+)/,
          /(\d+)\s*<\s*√\d+\s*<\s*(\d+)/,
          /(\d+);(\d+)/,
          /entre\s+(\d+)\s+et\s+(\d+)/
        ];
        
        for (const pattern of patterns) {
          const match = input.toString().toLowerCase().match(pattern);
          if (match) {
            const a = parseInt(match[1]);
            const b = parseInt(match[2]);
            return a === lowerRoot && b === upperRoot;
          }
        }
        
        return false;
      };
      
      return question;
    }
  }

  private generateFractionDivision(context: GenerationContext): GeneratedQuestion {
    // Format (A/B) ÷ (C/D)
    const denominators = [2, 3, 4, 5, 6, 8, 10, 12];
    const denominator1 = randomChoice(denominators);
    const denominator2 = randomChoice(denominators);
    const numerator1 = randomInt(1, denominator1 - 1);
    const numerator2 = randomInt(1, denominator2 - 1);
    
    // Calculer (A/B) ÷ (C/D) = (A/B) × (D/C)
    const resultNum = numerator1 * denominator2;
    const resultDen = denominator1 * numerator2;
    
    // Simplifier
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
      id: hashQuestion(this.level, 'fractiondivision', [numerator1, denominator1, numerator2, denominator2]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `(${numerator1}/${denominator1}) ÷ (${numerator2}/${denominator2}) = ? Donne ta réponse sous forme de fraction ou d'entier`,
      answer,
      timeEstimate: 150,
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
    return randomChoice([
      () => this.generatePercentageDecimal(context),
      () => this.generateComplexProblems(context),
      () => this.generateGeometryAdvanced(context),
    ])();
  }

  private generatePercentageDecimal(context: GenerationContext): GeneratedQuestion {
    // Les résultats peuvent avoir une décimale quelconque (une seule décimale max)
    const base = randomInt(100, 5000);
    const percentages = [5, 10, 12.5, 15, 20, 25, 30, 33.3, 40, 50, 60, 75, 80, 90];
    const percentage = randomChoice(percentages);
    const result = (base * percentage) / 100;
    
    const scenarios = [
      {
        text: `Calculer ${percentage}% de ${base}`,
        answer: result.toFixed(1),
      },
      {
        text: `Un article coûte ${base}€. Il est soldé avec une réduction de ${percentage}%. Quel est le prix soldé ?`,
        answer: (base - result).toFixed(1) + '€',
      },
      {
        text: `Le prix d'un produit augmente de ${percentage}%. Il coûtait ${base}€. Quel est le nouveau prix ?`,
        answer: (base + result).toFixed(1) + '€',
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
      timeEstimate: 100,
    };
  }

  private generateComplexProblems(context: GenerationContext): GeneratedQuestion {
    const scenarios = [
      {
        text: `Une entreprise fabrique 1500 pièces par jour. Après une modernisation, la production augmente de 15%. Combien de pièces sont fabriquées maintenant ?`,
        answer: '1725',
      },
      {
        text: `Un triangle a une base de 12 cm et une hauteur de 8 cm. Quelle est son aire ?`,
        answer: '48',
      },
      {
        text: `Si (2/3) × x = 8, que vaut x ?`,
        answer: '12',
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'complexproblem', [scenarios.indexOf(scenario)]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      timeEstimate: 150,
    };
  }

  private generateGeometryAdvanced(context: GenerationContext): GeneratedQuestion {
    const scenarios = [
      {
        text: `Calculer le volume d'une sphère de rayon 3 cm (π ≈ 3,14, formule : V = 4/3 × π × r³)`,
        answer: '113.04',
      },
      {
        text: `Un cône a un rayon de 4 cm et une hauteur de 9 cm. Quel est son volume (π ≈ 3,14) ?`,
        answer: '150.72',
      },
      {
        text: `Dans un triangle rectangle, un angle mesure 30° et le côté adjacent mesure 8 cm. Quelle est la longueur de l'hypoténuse (cos 30° ≈ 0,87) ?`,
        answer: '9.2',
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'geometry', [scenarios.indexOf(scenario)]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      timeEstimate: 180,
    };
  }

  // ── Algèbre ─────────────────────────────────────────────────────────────

  private generateAlgebra(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generateQuadraticEquation(context),
      () => this.generateSystemEquation(context),
      () => this.generatePowerExpression(context),
    ])();
  }

  private generateQuadraticEquation(context: GenerationContext): GeneratedQuestion {
    // Équations quadratiques simples (factorisables)
    const solutions = [
      { a: 1, b: -5, c: 6, x1: 2, x2: 3 },  // x² - 5x + 6 = 0
      { a: 1, b: -7, c: 12, x1: 3, x2: 4 }, // x² - 7x + 12 = 0
      { a: 1, b: -8, c: 15, x1: 3, x2: 5 }, // x² - 8x + 15 = 0
      { a: 1, b: -6, c: 8, x1: 2, x2: 4 },   // x² - 6x + 8 = 0
    ];
    
    const eq = randomChoice(solutions);
    
    return {
      id: hashQuestion(this.level, 'quadratic', [eq.a, eq.b, eq.c]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: context.userElo,
      question: `Résoudre : ${eq.a}x² ${eq.b >= 0 ? '+' : ''} ${eq.b}x ${eq.c >= 0 ? '+' : ''} ${eq.c} = 0`,
      answer: `${eq.x1} et ${eq.x2}`,
      timeEstimate: 180,
    };
  }

  private generateSystemEquation(context: GenerationContext): GeneratedQuestion {
    // Système de 2 équations à 2 inconnues
    const x = randomInt(-10, 10);
    const y = randomInt(-10, 10);
    
    const a1 = randomInt(2, 5);
    const b1 = randomInt(2, 5);
    const c1 = a1 * x + b1 * y;
    
    const a2 = randomInt(2, 5);
    const b2 = randomInt(2, 5);
    const c2 = a2 * x + b2 * y;
    
    return {
      id: hashQuestion(this.level, 'system', [a1, b1, c1, a2, b2, c2]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: context.userElo,
      question: `Résoudre le système :\n${a1}x ${b1 >= 0 ? '+' : ''} ${b1}y = ${c1}\n${a2}x ${b2 >= 0 ? '+' : ''} ${b2}y = ${c2}`,
      answer: `x = ${x}, y = ${y}`,
      timeEstimate: 200,
    };
  }

  private generatePowerExpression(context: GenerationContext): GeneratedQuestion {
    // Expressions avec puissances
    const base = randomInt(2, 8);
    const exp1 = randomInt(2, 4);
    const exp2 = randomInt(2, 4);
    
    const operations = [
      { text: `${base}^${exp1} × ${base}^${exp2}`, result: Math.pow(base, exp1 + exp2) },
      { text: `${base}^${exp1} ÷ ${base}^${exp2}`, result: Math.pow(base, exp1 - exp2) },
      { text: `(${base}^${exp1})^${exp2}`, result: Math.pow(base, exp1 * exp2) },
    ];
    
    const operation = randomChoice(operations);
    
    return {
      id: hashQuestion(this.level, 'powerexpression', [base, exp1, exp2]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: context.userElo,
      question: `Simplifier : ${operation.text}`,
      answer: operation.result.toString(),
      timeEstimate: 120,
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
