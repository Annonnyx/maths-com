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
    // Limité à max 5 chiffres totaux pour CM1 et inférieurs
    // Formats: XY+Z (3 chiffres), XYZ+AB (5 chiffres max), parfois X+Y (2 chiffres)
    const formats = [
      () => {
        // Format X+Y (2 chiffres)
        const a = randomInt(1, 9);
        const b = randomInt(1, 9);
        return { a, b, question: `${a} + ${b} = ?` };
      },
      () => {
        // Format XY+Z (3-4 chiffres)
        const a = randomInt(10, 99);
        const b = randomInt(1, 9);
        return { a, b, question: `${a} + ${b} = ?` };
      },
      () => {
        // Format XYZ+AB (max 5 chiffres)
        const a = randomInt(100, 499); // Limiter pour ne pas dépasser 5 chiffres
        const b = randomInt(10, 99);
        return { a, b, question: `${a} + ${b} = ?` };
      },
      () => {
        // Format X+YZ (3-4 chiffres)
        const a = randomInt(1, 9);
        const b = randomInt(10, 99);
        return { a, b, question: `${a} + ${b} = ?` };
      }
    ];
    
    const { a, b, question } = randomChoice(formats)();
    const result = a + b;
    
    return {
      id: hashQuestion(this.level, 'addition', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer: result.toString(),
      explanation: `${a} + ${b} = ${result}`,
      timeEstimate: 25,
    };
  }

  private generateSubtraction(context: GenerationContext): GeneratedQuestion {
    // Limité à max 5 chiffres totaux et résultat entre -500 et 500
    const formats = [
      () => {
        // Format XY-Z (résultat entre -90 et 90)
        const a = randomInt(10, 99);
        const b = randomInt(10, 99);
        return { a, b, question: `${a} - ${b} = ?` };
      },
      () => {
        // Format XYZ-AB (résultat entre -500 et 500)
        const a = randomInt(100, 500);
        const b = randomInt(10, 99);
        return { a, b, question: `${a} - ${b} = ?` };
      },
      () => {
        // Format X-Y (résultat entre -8 et 8)
        const a = randomInt(1, 9);
        const b = randomInt(1, 9);
        return { a, b, question: `${a} - ${b} = ?` };
      },
      () => {
        // Format XY-Z (assurer résultat positif pour CM1)
        const a = randomInt(20, 99);
        const b = randomInt(1, Math.min(a - 1, 50));
        return { a, b, question: `${a} - ${b} = ?` };
      }
    ];
    
    const { a, b, question } = randomChoice(formats)();
    const result = a - b;
    
    // Vérifier que le résultat est dans la plage acceptable
    if (result < -500 || result > 500) {
      return this.generateSubtraction(context);
    }
    
    return {
      id: hashQuestion(this.level, 'subtraction', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question,
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
    // Simplifié pour CM1 - max 3 nombres, max 5 chiffres totaux
    const formats = [
      () => {
        // Format simple: A + B × C (petits nombres)
        const a = randomInt(10, 50);
        const b = randomInt(2, 9);
        const c = randomInt(2, 9);
        const multResult = b * c;
        const finalResult = a + multResult;
        
        return {
          question: `${a} + ${b} × ${c} = ?`,
          answer: finalResult.toString(),
          explanation: `Priorité opératoire : ${b} × ${c} = ${multResult}, puis ${a} + ${multResult} = ${finalResult}`,
        };
      },
      () => {
        // Format: A × B + C
        const a = randomInt(2, 9);
        const b = randomInt(2, 9);
        const c = randomInt(1, 20);
        const multResult = a * b;
        const finalResult = multResult + c;
        
        return {
          question: `${a} × ${b} + ${c} = ?`,
          answer: finalResult.toString(),
          explanation: `Priorité opératoire : ${a} × ${b} = ${multResult}, puis ${multResult} + ${c} = ${finalResult}`,
        };
      },
      () => {
        // Format simple: A + B - C
        const a = randomInt(20, 99);
        const b = randomInt(1, 50);
        const c = randomInt(1, 30);
        const finalResult = a + b - c;
        
        return {
          question: `${a} + ${b} - ${c} = ?`,
          answer: finalResult.toString(),
          explanation: `${a} + ${b} = ${a + b}, puis ${a + b} - ${c} = ${finalResult}`,
        };
      },
      () => {
        // Format: A × B - C (assurer résultat positif)
        const a = randomInt(2, 9);
        const b = randomInt(2, 9);
        const c = randomInt(1, Math.min(20, a * b - 1));
        const multResult = a * b;
        const finalResult = multResult - c;
        
        return {
          question: `${a} × ${b} - ${c} = ?`,
          answer: finalResult.toString(),
          explanation: `Priorité opératoire : ${a} × ${b} = ${multResult}, puis ${multResult} - ${c} = ${finalResult}`,
        };
      }
    ];
    
    const { question, answer, explanation } = randomChoice(formats)();
    
    return {
      id: hashQuestion(this.level, 'mixedops', [question]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer,
      explanation,
      timeEstimate: 60,
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
    // Simplifié pour CM1 - nombres plus petits, résultats raisonnables
    const length = randomInt(5, 20); // Limité à 20 max
    const width = randomInt(3, 15);  // Limité à 15 max
    
    const problems = [
      {
        text: `Rectangle : ${length} cm × ${width} cm. Périmètre ?`,
        answer: (2 * (length + width)).toString() + ' cm',
        explanation: `P = 2 × (${length} + ${width}) = ${2 * (length + width)} cm`
      },
      {
        text: `Carré : côté ${length} cm. Périmètre ?`,
        answer: (4 * length).toString() + ' cm',
        explanation: `P = 4 × ${length} = ${4 * length} cm`
      },
      {
        text: `Rectangle : ${length} cm × ${width} cm. Aire ?`,
        answer: (length * width).toString() + ' cm²',
        explanation: `A = ${length} × ${width} = ${length * width} cm²`
      },
      {
        text: `Carré : côté ${length} cm. Aire ?`,
        answer: (length * length).toString() + ' cm²',
        explanation: `A = ${length} × ${length} = ${length * length} cm²`
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
      timeEstimate: 60,
    };
  }

  private generateComplexWordProblems(context: GenerationContext): GeneratedQuestion {
    // Simplifié pour CM1 - nombres plus petits, scénarios plus simples
    const scenarios = [
      {
        text: `${randomInt(2, 9)} boîtes de ${randomInt(2, 9)} crayons. Total crayons ?`,
        answer: (randomInt(2, 9) * randomInt(2, 9)).toString(),
        explanation: `${randomInt(2, 9)} × ${randomInt(2, 9)} = ${randomInt(2, 9) * randomInt(2, 9)} crayons`
      },
      {
        text: `${randomInt(10, 50)} bonbons partagés entre ${randomInt(2, 8)} enfants. Bonbons par enfant ?`,
        answer: Math.floor(randomInt(10, 50) / randomInt(2, 8)).toString(),
        explanation: `${randomInt(10, 50)} ÷ ${randomInt(2, 8)} = ${Math.floor(randomInt(10, 50) / randomInt(2, 8))} bonbons par enfant`
      },
      {
        text: `${randomInt(5, 15)} € par livre. ${randomInt(2, 5)} livres. Coût total ?`,
        answer: (randomInt(5, 15) * randomInt(2, 5)).toString() + '€',
        explanation: `${randomInt(5, 15)} × ${randomInt(2, 5)} = ${randomInt(5, 15) * randomInt(2, 5)} €`
      },
      {
        text: `${randomInt(20, 99)} pages. Lecture de ${randomInt(5, 20)} pages. Pages restantes ?`,
        answer: Math.max(0, randomInt(20, 99) - randomInt(5, 20)).toString(),
        explanation: `${randomInt(20, 99)} - ${randomInt(5, 20)} = ${Math.max(0, randomInt(20, 99) - randomInt(5, 20))} pages`
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'simpleword', [scenario.text]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      explanation: scenario.explanation,
      timeEstimate: 80,
    };
  }

  private generateDecimalProblems(context: GenerationContext): GeneratedQuestion {
    // Simplifié pour CM1 - nombres plus petits, calculs plus simples
    const decimalA = randomInt(1, 9) + Math.round(Math.random() * 9) / 10; // 1.0 à 9.9
    const decimalB = randomInt(1, 9) + Math.round(Math.random() * 9) / 10; // 1.0 à 9.9
    
    const problems = [
      {
        text: `${decimalA.toFixed(1)} kg + ${decimalB.toFixed(1)} kg. Poids total ?`,
        answer: (decimalA + decimalB).toFixed(1) + ' kg',
        explanation: `${decimalA.toFixed(1)} + ${decimalB.toFixed(1)} = ${(decimalA + decimalB).toFixed(1)} kg`
      },
      {
        text: `${decimalA.toFixed(1)} m - ${decimalB.toFixed(1)} m. Longueur restante ?`,
        answer: Math.max(0, decimalA - decimalB).toFixed(1) + ' m',
        explanation: `${decimalA.toFixed(1)} - ${decimalB.toFixed(1)} = ${Math.max(0, decimalA - decimalB).toFixed(1)} m`
      },
      {
        text: `Bouteille : ${decimalA.toFixed(1)} L. On boit ${decimalB.toFixed(1)} L. Reste ?`,
        answer: Math.max(0, decimalA - decimalB).toFixed(1) + ' L',
        explanation: `${decimalA.toFixed(1)} - ${decimalB.toFixed(1)} = ${Math.max(0, decimalA - decimalB).toFixed(1)} L`
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
      timeEstimate: 60,
    };
  }
}
