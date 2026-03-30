// ============================================================================
// CP.TS — Générateur niveau CP (ELO 400-549) — Cours Préparatoire
// ============================================================================
// DOMAINES : Additions/soustractions simples (jusqu'à 20), comptage,
//            reconnaissance des formes, comparaisons de nombres
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';
import { getScaledOperands } from './elo-scaler';

export class CPGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = 'CP';
  private readonly eloRange = { min: 400, max: 549 };

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
      () => this.generateCounting(context),
      () => this.generateComparison(context),
    ])();
  }

  private generateAddition(context: GenerationContext): GeneratedQuestion {
    // Résultat max : 100 pour le CP
    const maxResult = 100;
    const a = randomInt(0, maxResult);
    const b = randomInt(0, maxResult - a); // Garantir que le résultat ne dépasse pas 100
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
      timeEstimate: 20,
    };
  }

  private generateSubtraction(context: GenerationContext): GeneratedQuestion {
    // Résultat toujours strictement positif : premier opérande > second
    const maxValue = 100;
    const b = randomInt(1, maxValue - 1);
    const a = randomInt(b + 1, maxValue); // a > b garanti
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
      timeEstimate: 25,
    };
  }

  private generateCounting(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CP');
    // Limiter à des valeurs raisonnables pour le CP
    const maxObjects = Math.min(ops.addition(), 30);
    const objectCount = randomInt(5, maxObjects);
    const objects = ['🍎', '🔵', '⭐', '🌟', '🎈'];
    const object = randomChoice(objects);
    
    return {
      id: hashQuestion(this.level, 'counting', [objectCount, object]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `Combien y a-t-il d'objets : ${object.repeat(objectCount)} ?`,
      answer: objectCount.toString(),
      explanation: `Il y a ${objectCount} ${object.includes('🍎') ? 'pommes' : 'objets'}`,
      timeEstimate: 15,
    };
  }

  private generateComparison(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CP');
    const a = ops.addition();
    const b = ops.addition();
    const symbols = ['>', '<', '='];
    const correctSymbol = a > b ? '>' : a < b ? '<' : '=';
    const wrongSymbols = symbols.filter(s => s !== correctSymbol);
    const options = shuffleArray([correctSymbol, ...wrongSymbols.slice(0, 2)]);
    
    return {
      id: hashQuestion(this.level, 'comparison', [a, b]),
      type: 'mcq',
      domain: 'calculation',
      level: this.level,
      difficultyElo: context.userElo,
      question: `${a} ? ${b}`,
      answer: correctSymbol,
      options,
      explanation: `${a} est ${a > b ? 'plus grand que' : a < b ? 'plus petit que' : 'égal à'} ${b}`,
      timeEstimate: 20,
    };
  }

  // ── Arithmétique ─────────────────────────────────────────────────────────

  private generateArithmetic(context: GenerationContext): GeneratedQuestion {
    return randomChoice([
      () => this.generateMissingNumber(context),
      () => this.generateNumberSequence(context),
      () => this.generateSimpleWordProblem(context),
    ])();
  }

  private generateMissingNumber(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CP');
    const a = ops.addition();
    const b = ops.addition();
    const result = a + b;
    const missingPosition = randomInt(0, 2); // 0: a, 1: b, 2: result
    
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
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer,
      explanation: `${a} + ${b} = ${result}, donc le nombre manquant est ${answer}`,
      timeEstimate: 30,
    };
  }

  private generateNumberSequence(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CP');
    const step = randomInt(1, Math.min(5, ops.addition()));
    const start = randomInt(0, 10);
    const sequence = [start, start + step, start + 2 * step, start + 3 * step];
    const missingIndex = randomInt(1, 3);
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
      id: hashQuestion(this.level, 'sequence', [start, step, missingIndex]),
      type: 'numeric',
      domain: 'arithmetic',
      level: this.level,
      difficultyElo: context.userElo,
      question,
      answer: correctAnswer,
      explanation: `La suite augmente de ${step} à chaque fois : ${sequence.join(', ')}`,
      timeEstimate: 25,
    };
  }

  private generateSimpleWordProblem(context: GenerationContext): GeneratedQuestion {
    const ops = getScaledOperands(context.userElo, 'CP');
    // Limiter à des valeurs raisonnables pour les problèmes CP
    const maxItems = Math.min(ops.addition(), 20);
    const a = randomInt(2, maxItems);
    const b = randomInt(2, maxItems);
    const result = a + b;
    const scenarios = [
      { text: `Léo a ${a} bonbons et sa sœur lui donne ${b} bonbons. Combien en a-t-il au total ?`, answer: result.toString() },
      { text: `Dans une boîte, il y a ${a} billes rouges et ${b} billes bleues. Combien y a-t-il de billes en tout ?`, answer: result.toString() },
      { text: `Clara a ${a} stickers et elle en achète ${b} autres. Combien a-t-elle de stickers maintenant ?`, answer: result.toString() },
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
      explanation: `${a} + ${b} = ${result}`,
      timeEstimate: 45,
    };
  }
}
