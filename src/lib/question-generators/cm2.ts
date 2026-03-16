// ============================================================================
// CM2.TS — Générateur niveau CM2 (ELO 1000-1199) — Cours Moyen 2
// ============================================================================
// DOMAINES : Toutes opérations, pourcentages, solides, symétrie,
//            problèmes complexes, nombres décimaux avancés
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class CM2Generator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CM2';
  private readonly eloRange = { min: 1000, max: 1199 };

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
      () => this.generateComplexMultiplication(context),
      () => this.generateDecimalOperations(context),
      () => this.generatePercentageCalculation(context),
      () => this.generateAdvancedMixedOperations(context),
    ])();
  }

  private generateComplexMultiplication(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CM2');
    const { a, b } = ops.multiplication();
    const result = a * b;
    
    return {
      id: hashQuestion(this.level, 'complexmult', [a, b]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} × ${b} = ?`,
      answer: result.toString(),
      explanation: `${a} × ${b} = ${result}`,
      timeEstimate: 120,
    };
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
      explanation: `${question.replace(' = ?', '')} = ${answer}`,
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
        explanation: `${percentage}% de ${base} = (${percentage}/100) × ${base} = ${result}`
      },
      {
        text: `${base} a augmenté de ${percentage}%. Quel est le nouveau montant ?`,
        answer: (base + result).toString(),
        explanation: `${base} + ${percentage}% de ${base} = ${base} + ${result} = ${base + result}`
      },
      {
        text: `Un article coûtait ${base}€, il est maintenant en solde à ${percentage}% de son prix. Quel est le prix soldé ?`,
        answer: result.toString(),
        explanation: `${percentage}% de ${base}€ = ${result}€`
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
      explanation: problem.explanation,
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
      explanation: `Priorités opératoires : ${multA}×${multB}=${multResult}, ${div}×${quot}=${divResult}, puis ${a}+${multResult}-${b}+${divResult}=${finalResult}`,
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
    
    // Mettre au même dénominateur
    const commonDenominator = denominator1 * denominator2 / this.gcd(denominator1, denominator2);
    const newNum1 = numerator1 * (commonDenominator / denominator1);
    const newNum2 = numerator2 * (commonDenominator / denominator2);
    const resultNum = newNum1 + newNum2;
    
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
    
    return {
      id: hashQuestion(this.level, 'advancedfractions', [numerator1, denominator1, numerator2, denominator2]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${numerator1}/${denominator1} + ${numerator2}/${denominator2} = ?`,
      answer,
      explanation: `Mise au même dénominateur : ${newNum1}/${commonDenominator} + ${newNum2}/${commonDenominator} = ${resultNum}/${commonDenominator} = ${answer}`,
      timeEstimate: 120,
    };
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
        explanation: `Volume = longueur × largeur × hauteur = ${length} × ${width} × ${height} = ${length * width * height} cm³`
      },
      {
        text: `Un cube a un arête de ${length} cm. Quel est son volume ?`,
        answer: (length * length * length).toString() + ' cm³',
        explanation: `Volume du cube = arête³ = ${length}³ = ${length * length * length} cm³`
      },
      {
        text: `Une boîte a une base de ${length} cm sur ${width} cm et une hauteur de ${height} cm. Quelle est la surface totale de la boîte ?`,
        answer: (2 * (length * width + length * height + width * height)).toString() + ' cm²',
        explanation: `Surface = 2 × (L×l + L×h + l×h) = 2 × (${length}×${width} + ${length}×${height} + ${width}×${height}) = ${2 * (length * width + length * height + width * height)} cm²`
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
      explanation: solid.explanation,
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
        explanation: `Nombre total d'élèves = ${a} × ${b} = ${a * b}. ${percentage}% de ${a * b} = (${percentage}/100) × ${a * b} = ${Math.round((a * b * percentage) / 100)}`
      },
      {
        text: `Un magasin vend ${a} paquets de ${b} articles. Il offre une réduction de ${percentage}% sur le total. Combien d'articles sont vendus après réduction ?`,
        answer: (a * b).toString(), // Le nombre d'articles ne change pas avec la réduction
        explanation: `Le nombre d'articles reste ${a} × ${b} = ${a * b}. La réduction s'applique au prix, pas à la quantité.`
      },
      {
        text: `Une usine produit ${a} machines par jour pendant ${b} jours. Elle augmente sa production de ${percentage}%. Combien de machines produit-elle maintenant ?`,
        answer: Math.round(a * b * (1 + percentage / 100)).toString(),
        explanation: `Production initiale = ${a} × ${b} = ${a * b}. Augmentation de ${percentage}% : ${a * b} × (1 + ${percentage}/100) = ${Math.round(a * b * (1 + percentage / 100))}`
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
      explanation: scenario.explanation,
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
        explanation: `Proportionnalité : ${baseValue}€/3 × ${multiplier} = ${resultValue}€`
      },
      {
        text: `Une voiture consomme ${baseValue}L pour 100km. Combien consomme-t-elle pour ${multiplier * 100}km ?`,
        answer: resultValue.toString() + 'L',
        explanation: `Proportionnalité : ${baseValue}L/100km × ${multiplier * 100}km = ${resultValue}L`
      },
      {
        text: `Un employé gagne ${baseValue}€ par jour. Combien gagnera-t-il en ${multiplier} jours ?`,
        answer: resultValue.toString() + '€',
        explanation: `Proportionnalité : ${baseValue}€/jour × ${multiplier} jours = ${resultValue}€`
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
      explanation: scenario.explanation,
      timeEstimate: 90,
    };
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
