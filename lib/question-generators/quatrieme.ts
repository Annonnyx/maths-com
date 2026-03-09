// ============================================================================
// 4ème Level Question Generator (ELO 1940-2281)
// ============================================================================
// TYPES: equation, expression, geometry, mcq
// DOMAINE: Équations 1er degré (ax+b=c), Identités remarquables,
//          Trigonométrie (sin/cos/tan), Développement/factorisation
// IMPORTANT: Respecte excludeGeometry - pas de trigo si exclu
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class QuatriemeGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '4eme';
  private readonly eloRange = { min: 1940, max: 2281 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    const domains: DomainType[] = ['algebra', 'calculation'];
    if (!excludeGeometry) {
      domains.push('geometry');
    }
    return domains;
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domains = this.getAvailableDomains(context.excludeGeometry);
    const domain = randomChoice(domains);

    switch (domain) {
      case 'algebra':
        return this.generateAlgebraQuestion();
      case 'calculation':
        return this.generateCalculationQuestion();
      case 'geometry':
        return this.generateGeometryQuestion();
      default:
        return this.generateAlgebraQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Algebra Domain (Équations, Identités)
  // --------------------------------------------------------------------------

  private generateAlgebraQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateLinearEquation(),
      () => this.generateExpand(),
      () => this.generateFactorize(),
    ];
    return randomChoice(generators)();
  }

  private generateLinearEquation(): GeneratedQuestion {
    const a = randomInt(2, 6);
    const b = randomInt(1, 20);
    const x = randomInt(1, 15);
    const c = a * x + b;
    
    const format = randomChoice([
      `${a}x + ${b} = ${c}`,
      `${a}x - ${b} = ${c - 2*b}`,
      `${a}(x + ${b}) = ${a * (x + b)}`,
    ]);
    
    return {
      id: hashQuestion(this.level, 'algebra', [a, b, x]),
      type: 'numeric',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 2000,
      question: `Résous : ${format}`,
      answer: x.toString(),
      explanation: `${format} → ${a}x = ${c - b} → x = ${(c - b) / a} = ${x}`,
      timeEstimate: 60
    };
  }

  private generateExpand(): GeneratedQuestion {
    const a = randomInt(2, 6);
    const b = randomInt(1, 5);
    const type = randomChoice(['square', 'product']);
    
    if (type === 'square') {
      // (a+b)² = a² + 2ab + b²
      const result = (a + b) ** 2;
      
      return {
        id: hashQuestion(this.level, 'algebra', [a, b]),
        type: 'expression',
        domain: 'algebra',
        level: this.level,
        difficultyElo: 2100,
        question: `Développe : (${a} + ${b})²`,
        answer: `${a*a} + ${2*a*b}x + ${b*b}`,
        acceptableAnswers: [
          `${a*a}+${2*a*b}x+${b*b}`,
          `${result}`,
          `x²+${2*a*b}x+${b*b}`,
        ],
        explanation: `(${a} + ${b})² = ${a}² + 2×${a}×${b} + ${b}² = ${a*a} + ${2*a*b} + ${b*b} = ${result}`,
        timeEstimate: 50
      };
    } else {
      // (a+b)(a-b) = a² - b²
      const a2 = randomInt(3, 8);
      const b2 = randomInt(1, 5);
      
      return {
        id: hashQuestion(this.level, 'algebra', [a2, b2]),
        type: 'numeric',
        domain: 'algebra',
        level: this.level,
        difficultyElo: 2150,
        question: `Développe : (${a2} + ${b2})(${a2} - ${b2})`,
        answer: (a2 * a2 - b2 * b2).toString(),
        explanation: `(${a2} + ${b2})(${a2} - ${b2}) = ${a2}² - ${b2}² = ${a2*a2} - ${b2*b2} = ${a2*a2 - b2*b2}`,
        timeEstimate: 45
      };
    }
  }

  private generateFactorize(): GeneratedQuestion {
    const a = randomInt(2, 8);
    const b = randomInt(2, 6);
    const common = randomInt(2, 5);
    
    const term1 = common * a;
    const term2 = common * b;
    const result = `${common}(${a} + ${b})`;
    
    return {
      id: hashQuestion(this.level, 'algebra', [a, b, common]),
      type: 'expression',
      domain: 'algebra',
      level: this.level,
      difficultyElo: 2200,
      question: `Factorise : ${term1}x + ${term2}`,
      answer: result,
      acceptableAnswers: [result, `${common}(${a}+${b})`, `${common}*(${a}+${b})`],
      explanation: `${term1}x + ${term2} = ${common}×${a}x + ${common}×${b} = ${common}(${a}x + ${b})`,
      timeEstimate: 55
    };
  }

  // --------------------------------------------------------------------------
  // Calculation Domain
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    return this.generateSquareRootSimplification();
  }

  private generateSquareRootSimplification(): GeneratedQuestion {
    const a = randomInt(2, 10);
    const b2 = randomInt(2, 8);
    const underRoot = a * b2 * b2;
    
    return {
      id: hashQuestion(this.level, 'calculation', [a, b2]),
      type: 'expression',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 2180,
      question: `Simplifie : √${underRoot}`,
      answer: `${b2}√${a}`,
      acceptableAnswers: [`${b2}√${a}`, `${b2}*sqrt(${a})`, `${b2}sqrt(${a})`],
      explanation: `√${underRoot} = √(${b2}² × ${a}) = √${b2*b2} × √${a} = ${b2}√${a}`,
      timeEstimate: 50
    };
  }

  // --------------------------------------------------------------------------
  // Geometry Domain (Trigonométrie)
  // --------------------------------------------------------------------------

  private generateGeometryQuestion(): GeneratedQuestion {
    return this.generateTrigonometry();
  }

  private generateTrigonometry(): GeneratedQuestion {
    // Triangle rectangle avec angle 30°, 45° ou 60°
    const angles = [
      { angle: 30, sin: '1/2', cos: '√3/2', tan: '√3/3' },
      { angle: 45, sin: '√2/2', cos: '√2/2', tan: '1' },
      { angle: 60, sin: '√3/2', cos: '1/2', tan: '√3' },
    ];
    
    const { angle, sin, cos, tan } = randomChoice(angles);
    const func = randomChoice(['sin', 'cos', 'tan']);
    const value = func === 'sin' ? sin : func === 'cos' ? cos : tan;
    
    return {
      id: hashQuestion(this.level, 'geometry', [angle]),
      type: 'mcq',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 2250,
      question: `Dans un triangle rectangle, quel est ${func}(${angle}°) ?`,
      answer: value,
      options: shuffleArray(['0', '1/2', '√2/2', '√3/2', '1', '√3', '2']),
      explanation: `Valeurs exactes : sin(30°)=1/2, cos(30°)=√3/2, sin(45°)=√2/2, cos(45°)=√2/2, sin(60°)=√3/2, cos(60°)=1/2`,
      timeEstimate: 45
    };
  }
}
