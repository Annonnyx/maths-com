// ============================================================================
// CM2.TS — Générateur niveau CM2 (ELO 1000-1199) — Cours Moyen 2
// ============================================================================
// DOMAINES : Toutes opérations, pourcentages, solides, symétrie,
//            problèmes complexes, nombres décimaux avancés
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice,  hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class CM2Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CM2';
  private readonly eloRange = { min: 1000, max: 1199 };

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
      () => this.generateComplexMultiplication(context),
      () => this.generateDecimalOperations(context),
      () => this.generatePercentageCalculation(context),
      () => this.generateDivisionWithDecimal(context),
      () => this.generateAdvancedMixedOperations(context),
    ])();
  }

  private generateComplexMultiplication(context: GenerationContext): GeneratedQuestion {
    // Ajouter des questions avec facteurs négatifs
    const useNegative = randomChoice([true, false]);
    
    let a: number, b: number;
    
    if (useNegative) {
      // Un ou deux facteurs peuvent être négatifs
      const negativeCount = randomChoice([1, 2]);
      const absA = randomInt(2, 31);
      const absB = randomInt(2, 31);
      
      if (negativeCount === 1) {
        // Un seul facteur négatif
        a = randomChoice([true, false]) ? -absA : absA;
        b = a < 0 ? absB : -absB;
      } else {
        // Deux facteurs négatifs
        a = -absA;
        b = -absB;
      }
    } else {
      // Facteurs positifs (ancienne logique)
      const ops = getScaledOperands(context.userElo, 'CM2');
      const { a: opA, b: opB } = ops.multiplication();
      a = opA;
      b = opB;
    }
    
    const result = a * b;
    
    return {
      id: hashQuestion(this.level, 'complexmult', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} × ${b} = ?`,
      answer: result.toString(),
      timeEstimate: 120,
    };
  }

  private generateDivisionWithDecimal(context: GenerationContext): GeneratedQuestion {
    // Format : YX ÷ Z (dividende à 2 chiffres, diviseur à 1 chiffre)
    // Autoriser l'écriture décimale dans la réponse (en plus du format quotient+reste)
    const divisor = randomInt(2, 9);
    const maxQuotient = 30;
    const hasRemainder = randomChoice([true, false]);
    
    let quotient: number, remainder: number, dividend: number;
    
    if (hasRemainder) {
      quotient = randomInt(0, maxQuotient);
      remainder = randomInt(1, divisor - 1);
      dividend = divisor * quotient + remainder;
    } else {
      quotient = randomInt(0, maxQuotient);
      remainder = 0;
      dividend = divisor * quotient;
    }
    
    const question: GeneratedQuestion = {
      id: hashQuestion(this.level, 'divisiondecimal', [dividend, divisor]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${dividend} ÷ ${divisor} = ?`,
      answer: hasRemainder ? `${quotient} r ${remainder}` : quotient.toString(),
      timeEstimate: 80,
      hasRemainder,
      acceptsDecimalInsteadOfRemainder: true,
    };
    
    // Ajouter la fonction de validation pour supporter décimal au lieu du reste
    question.validate = (userInput: string | string[]) => {
      if (Array.isArray(userInput)) {
        // Format quotient + reste
        const q = parseInt(userInput[0]);
        const r = parseInt(userInput[1]);
        
        // Cas normal : quotient entier + reste
        if (q === quotient && r === remainder) return true;
        
        // Cas décimal accepté : userRemainder === "0" et userQuotient est le décimal exact
        if (userInput[1] === "0") {
          const decimal = quotient + remainder / divisor;
          return parseFloat(userInput[0]) === decimal;
        }
        
        return false;
      } else {
        // Format simple (décimal ou entier)
        const input = userInput.toString();
        
        if (hasRemainder) {
          // Vérifier si c'est le décimal exact
          const decimal = quotient + remainder / divisor;
          return parseFloat(input) === decimal;
        } else {
          // Division exacte, vérifier l'entier
          return parseInt(input) === quotient;
        }
      }
    };
    
    return question;
  }

  private generateDecimalOperations(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM2');
    const a = ops.addition();
    const b = ops.addition();
    
    // Créer des décimaux avec 2 chiffres après la virgule
    const decimalA = a + Math.round(Math.random() * 99) / 100;
    const decimalB = b + Math.round(Math.random() * 99) / 100;
    
    const operations = ['addition', 'subtraction', 'multiplication'];
    const operation = randomChoice(operations);
    
    let question = '';
    let answer = '';
    let result = 0;
    
    switch (operation) {
      case 'addition':
        result = decimalA + decimalB;
        question = `${decimalA.toFixed(2)} + ${decimalB.toFixed(2)} = ?`;
        answer = result.toFixed(2);
        break;
      case 'subtraction':
        result = Math.abs(decimalA - decimalB);
        question = `${Math.max(decimalA, decimalB).toFixed(2)} - ${Math.min(decimalA, decimalB).toFixed(2)} = ?`;
        answer = result.toFixed(2);
        break;
      case 'multiplication':
        result = decimalA * decimalB;
        question = `${decimalA.toFixed(2)} × ${decimalB.toFixed(2)} = ?`;
        answer = result.toFixed(2);
        break;
    }
    
    return {
      id: hashQuestion(this.level, 'decimalops', [decimalA, decimalB, operation]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer,
      timeEstimate: 90,
    };
  }

  private generatePercentageCalculation(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM2');
    const base = ops.addition() * 10; // Nombre plus grand pour les pourcentages
    const percentage = randomChoice([10, 25, 50, 75, 20, 30, 40, 60, 80, 90]);
    const result = (base * percentage) / 100;
    
    const problems = [
      {
        text: `Calculer ${percentage}% de ${base}`,
        answer: result.toString(),
      },
      {
        text: `${base} a augmenté de ${percentage}%. Quel est le nouveau montant ?`,
        answer: (base + result).toString(),
      },
      {
        text: `Un article coûtait ${base}€, il est maintenant en solde à ${percentage}% de son prix. Quel est le prix soldé ?`,
        answer: result.toString(),
      },
    ];
    
    const problem = randomChoice(problems);
    
    return {
      id: hashQuestion(this.level, 'percentage', [base, percentage, problems.indexOf(problem)]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: problem.text,
      answer: problem.answer,
      timeEstimate: 80,
    };
  }

  private generateAdvancedMixedOperations(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM2');
    const a = ops.addition();
    const { a: multA, b: multB } = ops.multiplication();
    const { divisor: div, quotient: quot } = ops.division();
    const b = ops.addition();
    
    // Expression complexe avec parenthèses
    const multResult = multA * multB;
    const divResult = div * quot;
    const finalResult = a + multResult - b + divResult;
    
    return {
      id: hashQuestion(this.level, 'advancedmixed', [a, multA, multB, b, div, quot]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} + ${multA} × ${multB} - ${b} + ${div} × ${quot} = ?`,
      answer: finalResult.toString(),
      timeEstimate: 120,
    };
  }

  // ── Arithmétique ─────────────────────────────────────────────────────────

  private generateArithmetic(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generateAdvancedFractions(context),
      () => this.generateGeometrySolids(context),
      () => this.generateComplexProblems(context),
      () => this.generateProportionality(context),
    ])();
  }

  private generateAdvancedFractions(context: GenerationContext): GeneratedQuestion {
    const denominators = [2, 3, 4, 5, 6, 8, 10, 12, 15];
    const denominator1 = randomChoice(denominators);
    const denominator2 = randomChoice(denominators);
    const numerator1 = randomInt(1, denominator1 - 1);
    const numerator2 = randomInt(1, denominator2 - 1);
    
    // Inclure addition ET soustraction de fractions
    const operation = randomChoice(['addition', 'subtraction']);
    
    // Mettre au même dénominateur
    const commonDenominator = denominator1 * denominator2 / this.gcd(denominator1, denominator2);
    const newNum1 = numerator1 * (commonDenominator / denominator1);
    const newNum2 = numerator2 * (commonDenominator / denominator2);
    
    let resultNum: number;
    let question: string;
    
    if (operation === 'addition') {
      resultNum = newNum1 + newNum2;
      question = `${numerator1}/${denominator1} + ${numerator2}/${denominator2} = ?`;
    } else {
      // Soustraction : s'assurer que le résultat est positif pour simplifier
      if (newNum1 >= newNum2) {
        resultNum = newNum1 - newNum2;
        question = `${numerator1}/${denominator1} - ${numerator2}/${denominator2} = ?`;
      } else {
        resultNum = newNum2 - newNum1;
        question = `${numerator2}/${denominator2} - ${numerator1}/${denominator1} = ?`;
      }
    }
    
    let answer = '';
    if (resultNum === commonDenominator) {
      answer = '1';
    } else if (resultNum > commonDenominator) {
      const wholePart = Math.floor(resultNum / commonDenominator);
      const remainder = resultNum % commonDenominator;
      answer = remainder === 0 ? wholePart.toString() : `${wholePart} ${remainder}/${commonDenominator}`;
    } else {
      answer = `${resultNum}/${commonDenominator}`;
    }
    
    const questionObj: GeneratedQuestion = {
      id: hashQuestion(this.level, 'advancedfractions', [numerator1, denominator1, numerator2, denominator2, operation]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: question + ' Donne ta réponse sous forme de fraction ou d\'entier',
      answer,
      timeEstimate: 120,
    };
    
    // Ajouter la fonction de validation pour les fractions
    questionObj.validate = (userInput: string | string[]) => {
      const input = Array.isArray(userInput) ? userInput[0] : userInput;
      
      // Parser les formats : "3/4", "2", "1 3/4"
      if (typeof input !== 'string') return false;
      
      // Extraire les nombres
      const fractionMatch = input.match(/^(\d+)\s*(\d+)?\/(\d+)$/);
      const integerMatch = input.match(/^(\d+)$/);
      
      let userNum: number, userDen: number;
      
      if (fractionMatch) {
        // Format fraction ou nombre mixte
        const wholePart = parseInt(fractionMatch[1]);
        const optionalNum = fractionMatch[2];
        const den = parseInt(fractionMatch[3]);
        
        if (optionalNum) {
          // Format nombre mixte : "1 3/4"
          userNum = wholePart * den + parseInt(optionalNum);
          userDen = den;
        } else {
          // Format simple fraction : "3/4"
          userNum = parseInt(fractionMatch[1]);
          userDen = den;
        }
      } else if (integerMatch) {
        // Format entier : "2"
        userNum = parseInt(integerMatch[1]);
        userDen = 1;
      } else {
        return false;
      }
      
      // Comparer par produits croisés
      const canonicalNum = resultNum;
      const canonicalDen = commonDenominator;
      
      return userNum * canonicalDen === canonicalNum * userDen;
    };
    
    return questionObj;
  }

  private generateGeometrySolids(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM2');
    const length = ops.addition();
    const width = ops.addition();
    const height = ops.addition();
    
    const solids = [
      {
        text: `Un pavé droit mesure ${length} cm de longueur, ${width} cm de largeur et ${height} cm de hauteur. Quel est son volume ?`,
        answer: (length * width * height).toString() + ' cm³',
      },
      {
        text: `Un cube a un arête de ${length} cm. Quel est son volume ?`,
        answer: (length * length * length).toString() + ' cm³',
      },
      {
        text: `Une boîte a une base de ${length} cm sur ${width} cm et une hauteur de ${height} cm. Quelle est la surface totale de la boîte ?`,
        answer: (2 * (length * width + length * height + width * height)).toString() + ' cm²',
      },
    ];
    
    const solid = randomChoice(solids);
    
    return {
      id: hashQuestion(this.level, 'geometrysolids', [length, width, height, solids.indexOf(solid)]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: solid.text,
      answer: solid.answer,
      timeEstimate: 100,
    };
  }

  private generateComplexProblems(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM2');
    const { a, b } = ops.multiplication();
    const c = ops.addition();
    const percentage = randomChoice([10, 20, 25, 50]);
    
    const scenarios = [
      {
        text: `Une école a ${a} classes avec ${b} élèves chacune. ${percentage}% des élèves vont en sortie. Combien d'élèves partent en sortie ?`,
        answer: Math.round((a * b * percentage) / 100).toString(),
      },
      {
        text: `Un magasin vend ${a} paquets de ${b} articles. Il offre une réduction de ${percentage}% sur le total. Combien d'articles sont vendus après réduction ?`,
        answer: (a * b).toString(), // Le nombre d'articles ne change pas avec la réduction
      },
      {
        text: `Une usine produit ${a} machines par jour pendant ${b} jours. Elle augmente sa production de ${percentage}%. Combien de machines produit-elle maintenant ?`,
        answer: Math.round(a * b * (1 + percentage / 100)).toString(),
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'complexproblems', [a, b, c, percentage, scenarios.indexOf(scenario)]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      timeEstimate: 150,
    };
  }

  private generateProportionality(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM2');
    const baseValue = ops.addition();
    const multiplier = randomInt(2, 6);
    const resultValue = baseValue * multiplier;
    
    const scenarios = [
      {
        text: `Si 3 stylos coûtent ${baseValue}€, combien coûtent ${multiplier} stylos ?`,
        answer: resultValue.toString() + '€',
      },
      {
        text: `Une voiture consomme ${baseValue}L pour 100km. Combien consomme-t-elle pour ${multiplier * 100}km ?`,
        answer: resultValue.toString() + 'L',
      },
      {
        text: `Un employé gagne ${baseValue}€ par jour. Combien gagnera-t-il en ${multiplier} jours ?`,
        answer: resultValue.toString() + '€',
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'proportionality', [baseValue, multiplier, scenarios.indexOf(scenario)]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      timeEstimate: 90,
    };
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
