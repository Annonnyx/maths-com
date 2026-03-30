// ============================================================================
// CM1.TS — Générateur niveau CM1 (ELO 800-999) — Cours Moyen 1
// ============================================================================
// DOMAINES : Grands nombres, décimaux, fractions, périmètre/aire,
//            problèmes complexes, multiplication à plusieurs chiffres
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice,  hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class CM1Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CM1';
  private readonly eloRange = { min: 800, max: 999 };

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
      () => this.generateLargeMultiplication(context),
      () => this.generateComplexDivision(context),
      () => this.generateMixedOperations(context),
    ])();
  }

  private generateAddition(context: GenerationContext): GeneratedQuestion {
    // Résultat max : 2000 pour le CM1
    const maxResult = 2000;
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
      explanation: `${a} + ${b} = ${result}`,
      timeEstimate: 25,
    };
  }

  private generateSubtraction(context: GenerationContext): GeneratedQuestion {
    // Résultat min : -1000 pour le CM1
    const minValue = -1000;
    const maxValue = 2000;
    const a = randomInt(minValue, maxValue);
    const b = randomInt(minValue, maxValue);
    const result = a - b;
    
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

  private generateLargeMultiplication(context: GenerationContext): GeneratedQuestion {
    // Résultat max : 1000, ajouter format XY × AB (2 chiffres × 2 chiffres)
    const maxResult = 1000;
    const useTwoDigitFormat = randomChoice([true, false]);
    
    let a: number, b: number;
    
    if (useTwoDigitFormat) {
      // Format XY × AB (2 chiffres × 2 chiffres)
      a = randomInt(10, 31); // Limiter pour éviter de dépasser 1000
      b = randomInt(10, 31);
    } else {
      // Anciens formats
      const ops = getScaledOperands(context.userElo, 'CM1');
      const { a: opA, b: opB } = ops.multiplication();
      a = opA;
      b = opB;
    }
    
    const result = a * b;
    
    // Vérifier que le résultat ne dépasse pas 1000
    if (result > maxResult) {
      return this.generateLargeMultiplication(context);
    }
    
    return {
      id: hashQuestion(this.level, 'largemult', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} × ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} × ${b} = ${result}`,
      timeEstimate: 90,
    };
  }

  private generateDecimalAddition(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM1');
    const a = ops.addition();
    const b = ops.addition();
    
    // Créer des décimaux avec 1 chiffre après la virgule
    const decimalA = a + Math.round(Math.random() * 9) / 10;
    const decimalB = b + Math.round(Math.random() * 9) / 10;
    const result = decimalA + decimalB;
    
    return {
      id: hashQuestion(this.level, 'decimaladd', [decimalA, decimalB]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${decimalA.toFixed(1)} + ${decimalB.toFixed(1)} = ?`,
      answer: result.toFixed(1),
      explanation: `${decimalA.toFixed(1)} + ${decimalB.toFixed(1)} = ${result.toFixed(1)}`,
      timeEstimate: 60,
    };
  }

  private generateComplexDivision(context: GenerationContext): GeneratedQuestion {
    // Format : YX ÷ Z (dividende à 2 chiffres, diviseur à 1 chiffre)
    // Résultat (quotient entier) entre 0 et 20 inclus
    // Introduction du reste : choix aléatoire entre division exacte et avec reste
    const divisor = randomInt(2, 9);
    const maxQuotient = 20;
    const hasRemainder = randomChoice([true, false]);
    
    let quotient: number, remainder: number, dividend: number;
    
    if (hasRemainder) {
      quotient = randomInt(0, maxQuotient);
      remainder = randomInt(1, divisor - 1); // 1 ≤ remainder < diviseur
      dividend = divisor * quotient + remainder;
    } else {
      quotient = randomInt(0, maxQuotient);
      remainder = 0;
      dividend = divisor * quotient;
    }
    
    const question: GeneratedQuestion = {
      id: hashQuestion(this.level, 'complexdiv', [dividend, divisor]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${dividend} ÷ ${divisor} = ?`,
      answer: hasRemainder ? `${quotient} r ${remainder}` : quotient.toString(),
      explanation: `${dividend} ÷ ${divisor} = ${quotient}${hasRemainder ? ` reste ${remainder}` : ''}`,
      timeEstimate: 70,
      hasRemainder,
    };
    
    // Ajouter la fonction de validation
    if (hasRemainder) {
      question.validate = (userInput: string | string[]) => {
        if (Array.isArray(userInput)) {
          const q = parseInt(userInput[0]);
          const r = parseInt(userInput[1]);
          return q === quotient && r === remainder;
        }
        return false; // Pour divisions avec reste, on attend deux champs
      };
    }
    
    return question;
  }

  private generateMixedOperations(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM1');
    const a = ops.addition();
    const { a: multA, b: multB } = ops.multiplication();
    const multResult = multA * multB;
    const b = ops.addition();
    const finalResult = a + multResult - b;
    
    return {
      id: hashQuestion(this.level, 'mixedops', [a, multA, multB, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} + ${multA} × ${multB} - ${b} = ?`,
      answer: finalResult.toString(),
      explanation: `Priorité opératoire : ${multA} × ${multB} = ${multResult}, puis ${a} + ${multResult} - ${b} = ${finalResult}`,
      timeEstimate: 90,
    };
  }

  // ── Arithmétique ─────────────────────────────────────────────────────────

  private generateArithmetic(context: GenerationContext): GeneratedQuestion {
    // Réduire la probabilité des suites (~60% de poids réduit par rapport au CE2)
    const useSequence = randomChoice([true, false, false, false]); // 1 chance sur 4
    
    if (useSequence) {
      return randomChoice([
        () => this.generateFractionOperations(context),
        () => this.generateGeometryProblems(context),
        () => this.generateComplexWordProblems(context),
        () => this.generateDecimalProblems(context),
        () => this.generatePercentageCalculation(context),
      ])();
    } else {
      // Éviter les suites et utiliser d'autres types de questions
      return randomChoice([
        () => this.generateFractionOperations(context),
        () => this.generateGeometryProblems(context),
        () => this.generateComplexWordProblems(context),
        () => this.generateDecimalProblems(context),
        () => this.generatePercentageCalculation(context),
      ])();
    }
  }

  private generatePercentageCalculation(context: GenerationContext): GeneratedQuestion {
    // Les valeurs de base et les pourcentages doivent toujours produire un résultat entier
    const base = randomInt(10, 200);
    const percentage = randomChoice([10, 20, 25, 50, 75]);
    const result = (base * percentage) / 100;
    
    const problems = [
      {
        text: `Calculer ${percentage}% de ${base}`,
        answer: result.toString(),
        explanation: `${percentage}% de ${base} = (${percentage}/100) × ${base} = ${result}`
      },
      {
        text: `Un article coûte ${base}€, il est soldé à ${percentage}% de son prix. Quel est le prix soldé ?`,
        answer: result.toString(),
        explanation: `${percentage}% de ${base}€ = ${result}€`
      },
    ];
    
    const problem = randomChoice(problems);
    
    return {
      id: hashQuestion(this.level, 'percentage', [base, percentage]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: problem.text,
      answer: problem.answer,
      explanation: problem.explanation,
      timeEstimate: 60,
    };
  }

  private generateFractionOperations(context: GenerationContext): GeneratedQuestion {
    const denominators = [2, 3, 4, 5, 6, 8, 10, 12];
    const denominator = randomChoice(denominators);
    const numerator1 = randomInt(1, denominator - 1);
    const numerator2 = randomInt(1, denominator - 1);
    
    const operation = randomChoice(['addition', 'subtraction']);
    let question = '';
    let answer = '';
    let resultNum = 0;
    
    if (operation === 'addition') {
      resultNum = numerator1 + numerator2;
      question = `${numerator1}/${denominator} + ${numerator2}/${denominator} = ?`;
    } else {
      // Soustraction : assurer que le résultat est positif
      if (numerator1 >= numerator2) {
        resultNum = numerator1 - numerator2;
        question = `${numerator1}/${denominator} - ${numerator2}/${denominator} = ?`;
      } else {
        resultNum = numerator2 - numerator1;
        question = `${numerator2}/${denominator} - ${numerator1}/${denominator} = ?`;
      }
    }
    
    if (resultNum === denominator) {
      answer = '1';
    } else if (resultNum > denominator) {
      const wholePart = Math.floor(resultNum / denominator);
      const remainder = resultNum % denominator;
      answer = remainder === 0 ? wholePart.toString() : `${wholePart} ${remainder}/${denominator}`;
    } else {
      answer = `${resultNum}/${denominator}`;
    }
    
    return {
      id: hashQuestion(this.level, 'fractionops', [numerator1, numerator2, denominator, operation]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer,
      explanation: `${operation === 'addition' ? '+' : '-'} des fractions de même dénominateur : ${resultNum}/${denominator} = ${answer}`,
      timeEstimate: 70,
    };
  }

  private generateGeometryProblems(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM1');
    const length = ops.addition();
    const width = ops.addition();
    
    const problems = [
      {
        text: `Un rectangle mesure ${length} cm de longueur et ${width} cm de largeur. Quel est son périmètre ?`,
        answer: (2 * (length + width)).toString() + ' cm',
        explanation: `Périmètre = 2 × (longueur + largeur) = 2 × (${length} + ${width}) = ${2 * (length + width)} cm`
      },
      {
        text: `Un carré a un côté de ${length} cm. Quel est son périmètre ?`,
        answer: (4 * length).toString() + ' cm',
        explanation: `Périmètre du carré = 4 × côté = 4 × ${length} = ${4 * length} cm`
      },
      {
        text: `Un rectangle mesure ${length} cm sur ${width} cm. Quelle est son aire ?`,
        answer: (length * width).toString() + ' cm²',
        explanation: `Aire du rectangle = longueur × largeur = ${length} × ${width} = ${length * width} cm²`
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
      explanation: problem.explanation,
      timeEstimate: 80,
    };
  }

  private generateComplexWordProblems(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM1');
    const { a, b } = ops.multiplication();
    const c = ops.addition();
    const d = ops.addition();
    
    const scenarios = [
      {
        text: `Une usine produit ${a} boîtes par jour pendant ${b} jours. Elle vend ${c} boîtes puis en produit ${d} supplémentaires. Combien de boîtes reste-t-il ?`,
        answer: (a * b - c + d).toString(),
        explanation: `${a} × ${b} - ${c} + ${d} = ${a * b - c + d}`
      },
      {
        text: `${a} classes de ${b} élèves partent en voyage. Le bus peut contenir ${c} élèves. Combien d'élèves ne peuvent pas monter dans le bus ?`,
        answer: Math.max(0, a * b - c).toString(),
        explanation: `${a} × ${b} - ${c} = ${Math.max(0, a * b - c)} élèves`
      },
      {
        text: `Un livre a ${a} pages. Chaque jour, je lis ${b} pages pendant ${c} jours, puis ${d} pages le jour suivant. Combien de pages me reste-t-il à lire ?`,
        answer: Math.max(0, a - (b * c + d)).toString(),
        explanation: `${a} - (${b} × ${c} + ${d}) = ${Math.max(0, a - (b * c + d))} pages`
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'complexword', [a, b, c, d]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      explanation: scenario.explanation,
      timeEstimate: 120,
    };
  }

  private generateDecimalProblems(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM1');
    const a = ops.addition();
    const b = ops.addition();
    
    // Créer des décimaux pour les problèmes
    const decimalA = a + Math.round(Math.random() * 9) / 10;
    const decimalB = b + Math.round(Math.random() * 9) / 10;
    
    const problems = [
      {
        text: `Léo achète ${decimalA.toFixed(1)} kg de pommes à 2€ le kg et ${decimalB.toFixed(1)} kg de poires à 3€ le kg. Combien dépense-t-il ?`,
        answer: (decimalA * 2 + decimalB * 3).toFixed(1) + '€',
        explanation: `${decimalA.toFixed(1)} × 2 + ${decimalB.toFixed(1)} × 3 = ${(decimalA * 2 + decimalB * 3).toFixed(1)}€`
      },
      {
        text: `Une bouteille contient ${decimalA.toFixed(1)} L d'eau. On en boit ${decimalB.toFixed(1)} L. Combien en reste-t-il ?`,
        answer: Math.max(0, decimalA - decimalB).toFixed(1) + ' L',
        explanation: `${decimalA.toFixed(1)} - ${decimalB.toFixed(1)} = ${Math.max(0, decimalA - decimalB).toFixed(1)} L`
      },
      {
        text: `Un film dure ${decimalA.toFixed(1)} heures et une pause de ${decimalB.toFixed(1)} heures. Quelle est la durée totale ?`,
        answer: (decimalA + decimalB).toFixed(1) + ' heures',
        explanation: `${decimalA.toFixed(1)} + ${decimalB.toFixed(1)} = ${(decimalA + decimalB).toFixed(1)} heures`
      },
    ];
    
    const problem = randomChoice(problems);
    
    return {
      id: hashQuestion(this.level, 'decimalprob', [decimalA, decimalB, problems.indexOf(problem)]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: problem.text,
      answer: problem.answer,
      explanation: problem.explanation,
      timeEstimate: 90,
    };
  }
}
