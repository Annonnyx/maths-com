// ============================================================================
// 4E.TS — Générateur niveau 4e (ELO 1600-1799) — Quatrième
// ============================================================================
// DOMAINES : Puissances (X^Y), consolidation générale opérations,
//            nombres positifs et négatifs, une seule décimale max
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class QuatriemeGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '4e';
  private readonly eloRange = { min: 1600, max: 1799 };

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
      () => this.generatePower(context),
      () => this.generateMixedOperations(context),
      () => this.generateDecimalOperations(context),
    ])();
  }

  private generatePower(context: GenerationContext): GeneratedQuestion {
    // Format : X^Y avec X ∈ {2, 3, 4, 5, 10}, Y ∈ {2, 3, 4}
    // Exception : si X = 2, alors Y peut aller jusqu'à 13 inclus
    const bases = [2, 3, 4, 5, 10];
    const base = randomChoice(bases);
    
    let exponent: number;
    if (base === 2) {
      exponent = randomInt(2, 13);
    } else {
      exponent = randomInt(2, 4);
    }
    
    const result = Math.pow(base, exponent);
    
    return {
      id: hashQuestion(this.level, 'power', [base, exponent]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${base}^${exponent} = ?`,
      answer: result.toString(),
      timeEstimate: 60,
    };
  }

  private generateMixedOperations(context: GenerationContext): GeneratedQuestion {
    // Consolidation générale : nombres positifs et négatifs, valeur absolue max 2000
    const maxValue = 2000;
    
    // Générer des opérandes avec décimales possibles
    const useDecimals = randomChoice([true, false]);
    
    let a: number, b: number, c: number;
    
    if (useDecimals) {
      a = this.generateDecimalOperand(maxValue);
      b = this.generateDecimalOperand(maxValue);
      c = this.generateDecimalOperand(maxValue);
    } else {
      a = randomInt(-maxValue, maxValue);
      b = randomInt(-maxValue, maxValue);
      c = randomInt(-maxValue, maxValue);
    }
    
    // Créer une expression complexe avec priorités
    const operations = [
      { text: `${a} + ${b} × ${c}`, result: a + b * c },
      { text: `${a} - ${b} ÷ ${c}`, result: c !== 0 ? a - b / c : a },
      { text: `${a} × ${b} + ${c}`, result: a * b + c },
      { text: `${a} ÷ ${b} - ${c}`, result: b !== 0 ? a / b - c : -c },
    ];
    
    const operation = randomChoice(operations);
    
    // Formatter le résultat avec une seule décimale max
    const formattedResult = this.formatResult(operation.result);
    
    return {
      id: hashQuestion(this.level, 'mixedops', [a, b, c]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${operation.text} = ?`,
      answer: formattedResult,
      timeEstimate: 120,
    };
  }

  private generateDecimalOperations(context: GenerationContext): GeneratedQuestion {
    // Division et soustraction avec décimales (une seule décimale max par opérande)
    const operation = randomChoice(['division', 'subtraction']);
    
    let a: number, b: number, result: number, question: string;
    
    if (operation === 'division') {
      a = this.generateDecimalOperand(1000);
      b = this.generateDecimalOperand(100);
      result = b !== 0 ? a / b : 0;
      question = `${a.toFixed(1)} ÷ ${b.toFixed(1)} = ?`;
    } else {
      a = this.generateDecimalOperand(1000);
      b = this.generateDecimalOperand(1000);
      result = a - b;
      question = `${a.toFixed(1)} - ${b.toFixed(1)} = ?`;
    }
    
    const formattedResult = this.formatResult(result);
    
    return {
      id: hashQuestion(this.level, 'decimalops', [a, b, operation]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer: formattedResult,
      timeEstimate: 80,
    };
  }

  // ── Arithmétique ─────────────────────────────────────────────────────────

  private generateArithmetic(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generatePercentageAdvanced(context),
      () => this.generateProportionalityComplex(context),
      () => this.generateGeometryProblems(context),
    ])();
  }

  private generatePercentageAdvanced(context: GenerationContext): GeneratedQuestion {
    const base = randomInt(100, 2000);
    const percentages = [5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90, 95];
    const percentage = randomChoice(percentages);
    
    const scenarios = [
      {
        text: `Un article coûte ${base}€. Il est en promotion avec ${percentage}% de réduction. Quel est le prix final ?`,
        answer: (base * (100 - percentage) / 100).toString(),
      },
      {
        text: `Le prix d'un produit augmente de ${percentage}%. Il coûtait ${base}€. Quel est le nouveau prix ?`,
        answer: (base * (100 + percentage) / 100).toString(),
      },
      {
        text: `${percentage}% des élèves d'une école de ${base} élèves pratiquent un sport. Combien d'élèves pratiquent un sport ?`,
        answer: Math.round(base * percentage / 100).toString(),
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

  private generateProportionalityComplex(context: GenerationContext): GeneratedQuestion {
    const scenarios = [
      {
        text: `Une voiture consomme 6L pour 100km. Combien consomme-t-elle pour 350km ?`,
        answer: '21',
      },
      {
        text: `Si 3 ouvriers construisent un mur en 8 jours, combien de jours faut-il à 6 ouvriers ?`,
        answer: '4',
      },
      {
        text: `Une recette pour 4 personnes nécessite 200g de farine. Combien faut-il pour 7 personnes ?`,
        answer: '350',
      },
    ];
    
    const scenario = randomChoice(scenarios);
    
    return {
      id: hashQuestion(this.level, 'proportionality', [scenarios.indexOf(scenario)]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question: scenario.text,
      answer: scenario.answer,
      timeEstimate: 120,
    };
  }

  private generateGeometryProblems(context: GenerationContext): GeneratedQuestion {
    const scenarios = [
      {
        text: `Calculer l'aire d'un cercle de rayon 5 cm (π ≈ 3,14)`,
        answer: '78.5',
      },
      {
        text: `Un cylindre a un rayon de 3 cm et une hauteur de 10 cm. Quel est son volume (π ≈ 3,14) ?`,
        answer: '282.6',
      },
      {
        text: `Un triangle rectangle a des côtés de 3 cm et 4 cm. Quelle est la longueur de l'hypoténuse ?`,
        answer: '5',
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
      timeEstimate: 150,
    };
  }

  // ── Algèbre ─────────────────────────────────────────────────────────────

  private generateAlgebra(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generateLinearEquation(context),
      () => this.generatePowerEquation(context),
    ])();
  }

  private generateLinearEquation(context: GenerationContext): GeneratedQuestion {
    // Équations plus complexes
    const x = randomInt(-20, 20);
    const a = randomInt(2, 10);
    const b = randomInt(-30, 30);
    const c = randomInt(2, 8);
    const d = randomInt(-20, 20);
    
    const leftSide = a * x + b;
    const rightSide = c * x + d;
    
    const equation = `${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}x ${d >= 0 ? '+' : ''} ${d}`;
    
    return {
      id: hashQuestion(this.level, 'linearequation', [a, b, c, d]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: context.userElo,
      question: `Résoudre : ${equation}`,
      answer: x.toString(),
      timeEstimate: 120,
    };
  }

  private generatePowerEquation(context: GenerationContext): GeneratedQuestion {
    // Équations avec puissances simples
    const base = randomChoice([2, 3, 4, 5]);
    const exponent = randomInt(2, 4);
    const x = randomInt(1, 5);
    const result = Math.pow(base, exponent * x);
    
    const equation = `${base}^${exponent}x = ${result}`;
    
    return {
      id: hashQuestion(this.level, 'powerequation', [base, exponent, result]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: context.userElo,
      question: `Résoudre : ${equation}`,
      answer: x.toString(),
      timeEstimate: 150,
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private generateDecimalOperand(maxValue: number): number {
    const integer = randomInt(-maxValue, maxValue);
    const decimal = randomInt(0, 9);
    const sign = integer >= 0 ? 1 : -1;
    return Math.abs(integer) + decimal / 10 * sign;
  }

  private formatResult(result: number): string {
    // Formatter avec une seule décimale max
    if (Number.isInteger(result)) {
      return result.toString();
    } else {
      return result.toFixed(1);
    }
  }
}
