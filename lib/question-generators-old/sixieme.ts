// ============================================================================
// 6ème Level Question Generator (ELO 1256-1597)
// ============================================================================
// TYPES: numeric, mcq, equation, geometry, expression
// DOMAINE: Nombres relatifs, Fractions (PGCD, simplification), Repère cartésien,
//          Cercle (périmètre, aire)
// IMPORTANT: Respecte excludeGeometry - pas de repère/cercle si exclu
// ============================================================================

import {
  GeneratedQuestion, GenerationContext, LevelGenerator,
  QuestionType, DomainType, SchoolLevel,
  randomInt, randomChoice, shuffleArray, hashQuestion
} from './types';

export class SixiemeGenerator implements LevelGenerator {
  private readonly level: SchoolLevel = '6eme';
  private readonly eloRange = { min: 1256, max: 1597 };

  getEloRange(): { min: number; max: number } {
    return this.eloRange;
  }

  getAvailableDomains(excludeGeometry: boolean): DomainType[] {
    const domains: DomainType[] = ['numbers', 'fractions', 'calculation'];
    if (!excludeGeometry) {
      domains.push('geometry');
    }
    return domains;
  }

  generate(context: GenerationContext): GeneratedQuestion {
    const domains = this.getAvailableDomains(context.excludeGeometry);
    const domain = randomChoice(domains);

    switch (domain) {
      case 'numbers':
        return this.generateNumbersQuestion();
      case 'fractions':
        return this.generateFractionsQuestion();
      case 'calculation':
        return this.generateCalculationQuestion();
      case 'geometry':
        return this.generateGeometryQuestion();
      default:
        return this.generateNumbersQuestion();
    }
  }

  // --------------------------------------------------------------------------
  // Numbers Domain (Relatifs)
  // --------------------------------------------------------------------------

  private generateNumbersQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateRelativeAddition(),
      () => this.generateRelativeSubtraction(),
      () => this.generateNumberLinePlacement(),
    ];
    return randomChoice(generators)();
  }

  private generateRelativeAddition(): GeneratedQuestion {
    const a = randomInt(-10, 10);
    const b = randomInt(-10, 10);
    const result = a + b;
    
    return {
      id: hashQuestion(this.level, 'numbers', [a, b]),
      type: 'numeric',
      domain: 'numbers',
      level: this.level,
      difficultyElo: 1280,
      question: `(${a}) + (${b}) = ?`,
      answer: result.toString(),
      explanation: `(${a}) + (${b}) = ${result}. ${a > 0 && b > 0 ? 'Deux positifs : on additionne' : a < 0 && b < 0 ? 'Deux négatifs : on additionne et on garde le signe -' : 'Signes contraires : on soustrait et on garde le signe du plus grand'}`,
      timeEstimate: 30
    };
  }

  private generateRelativeSubtraction(): GeneratedQuestion {
    const a = randomInt(-8, 8);
    const b = randomInt(-8, 8);
    const result = a - b;
    
    return {
      id: hashQuestion(this.level, 'numbers', [a, b]),
      type: 'numeric',
      domain: 'numbers',
      level: this.level,
      difficultyElo: 1350,
      question: `(${a}) - (${b}) = ?`,
      answer: result.toString(),
      explanation: `(${a}) - (${b}) = (${a}) + (${-b}) = ${result}. Soustraire un nombre revient à additionner son opposé.`,
      timeEstimate: 35
    };
  }

  private generateNumberLinePlacement(): GeneratedQuestion {
    const number = randomInt(-15, 15);
    const positions = [-15, -10, -5, 0, 5, 10, 15];
    const nearbyPositions = positions.filter(p => Math.abs(p - number) <= 10);
    
    return {
      id: hashQuestion(this.level, 'numbers', [number]),
      type: 'mcq',
      domain: 'numbers',
      level: this.level,
      difficultyElo: 1300,
      question: `Où se trouve le nombre ${number} sur la droite numérique ?`,
      answer: `${number}`,
      options: shuffleArray(nearbyPositions.slice(0, 4).map(String)),
      explanation: `${number} se trouve à la position ${number} sur la droite. Les négatifs sont à gauche de 0, les positifs à droite.`,
      timeEstimate: 25
    };
  }

  // --------------------------------------------------------------------------
  // Fractions Domain (PGCD, simplification)
  // --------------------------------------------------------------------------

  private generateFractionsQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generatePGCD(),
      () => this.generateFractionSimplification(),
      () => this.generateFractionMultiplication(),
    ];
    return randomChoice(generators)();
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private generatePGCD(): GeneratedQuestion {
    const a = randomInt(12, 80);
    const b = randomInt(12, 80);
    const result = this.gcd(a, b);
    
    return {
      id: hashQuestion(this.level, 'fractions', [a, b]),
      type: 'numeric',
      domain: 'fractions',
      level: this.level,
      difficultyElo: 1400,
      question: `PGCD(${a}, ${b}) = ?`,
      answer: result.toString(),
      explanation: `Le PGCD de ${a} et ${b} est ${result}. C'est le plus grand nombre qui divise à la fois ${a} et ${b}.`,
      timeEstimate: 40
    };
  }

  private generateFractionSimplification(): GeneratedQuestion {
    const denominators = [4, 6, 8, 9, 10, 12, 15, 16, 18, 20];
    const den = randomChoice(denominators);
    const num = den * randomInt(1, 3) + randomInt(1, den - 1);
    const g = this.gcd(num, den);
    const simplifiedNum = num / g;
    const simplifiedDen = den / g;
    
    return {
      id: hashQuestion(this.level, 'fractions', [num, den]),
      type: 'numeric',
      domain: 'fractions',
      level: this.level,
      difficultyElo: 1450,
      question: `Simplifie ${num}/${den} au maximum (format: a/b)`,
      answer: `${simplifiedNum}/${simplifiedDen}`,
      explanation: `PGCD(${num}, ${den}) = ${g}. Donc ${num}/${den} = (${num}÷${g})/(${den}÷${g}) = ${simplifiedNum}/${simplifiedDen}`,
      timeEstimate: 45
    };
  }

  private generateFractionMultiplication(): GeneratedQuestion {
    const a = randomInt(2, 6);
    const b = randomInt(2, 6);
    const c = randomInt(2, 6);
    const d = randomInt(2, 6);
    const num = a * c;
    const den = b * d;
    const g = this.gcd(num, den);
    
    return {
      id: hashQuestion(this.level, 'fractions', [a, b, c, d]),
      type: 'numeric',
      domain: 'fractions',
      level: this.level,
      difficultyElo: 1520,
      question: `${a}/${b} × ${c}/${d} = ? (format: a/b simplifiée)`,
      answer: `${num/g}/${den/g}`,
      explanation: `${a}/${b} × ${c}/${d} = (${a}×${c})/(${b}×${d}) = ${num}/${den} = ${num/g}/${den/g} après simplification`,
      timeEstimate: 50
    };
  }

  // --------------------------------------------------------------------------
  // Calculation Domain
  // --------------------------------------------------------------------------

  private generateCalculationQuestion(): GeneratedQuestion {
    return this.generatePowersOfTen();
  }

  private generatePowersOfTen(): GeneratedQuestion {
    const n = randomInt(1, 4);
    const operation = randomChoice(['positive', 'negative', 'multiplication']);
    
    let question: string;
    let answer: string;
    let explanation: string;
    
    if (operation === 'positive') {
      question = `10^${n} = ?`;
      answer = Math.pow(10, n).toString();
      explanation = `10^${n} = 1${'0'.repeat(n)} = ${answer}`;
    } else if (operation === 'negative') {
      question = `10^(-${n}) = ? (format: 0,...)`;
      answer = '0,' + '0'.repeat(n - 1) + '1';
      explanation = `10^(-${n}) = 1/${Math.pow(10, n)} = ${answer}`;
    } else {
      const a = randomInt(1, 5);
      const b = randomInt(1, 5);
      question = `10^${a} × 10^${b} = ? (format: 10^n)`;
      answer = `10^${a + b}`;
      explanation = `10^${a} × 10^${b} = 10^(${a}+${b}) = 10^${a + b}`;
    }
    
    return {
      id: hashQuestion(this.level, 'calculation', [n]),
      type: 'numeric',
      domain: 'calculation',
      level: this.level,
      difficultyElo: 1380,
      question,
      answer,
      explanation,
      timeEstimate: 30
    };
  }

  // --------------------------------------------------------------------------
  // Geometry Domain (Cercle - si non exclu)
  // --------------------------------------------------------------------------

  private generateGeometryQuestion(): GeneratedQuestion {
    const generators = [
      () => this.generateCirclePerimeter(),
      () => this.generateCircleArea(),
      () => this.generateCoordinatePoint(),
    ];
    return randomChoice(generators)();
  }

  private generateCirclePerimeter(): GeneratedQuestion {
    const r = randomInt(2, 10);
    const perimeter = Math.round(2 * Math.PI * r * 100) / 100;
    
    return {
      id: hashQuestion(this.level, 'geometry', [r]),
      type: 'numeric',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 1500,
      question: `Périmètre d'un cercle de rayon ${r} cm (π ≈ 3,14)`,
      answer: perimeter.toFixed(2).replace('.', ','),
      acceptableAnswers: [perimeter.toFixed(2), perimeter.toFixed(2).replace('.', ',')],
      explanation: `P = 2 × π × r = 2 × 3,14 × ${r} = ${perimeter.toFixed(2).replace('.', ',')} cm`,
      timeEstimate: 40
    };
  }

  private generateCircleArea(): GeneratedQuestion {
    const r = randomInt(2, 8);
    const area = Math.round(Math.PI * r * r * 100) / 100;
    
    return {
      id: hashQuestion(this.level, 'geometry', [r]),
      type: 'numeric',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 1550,
      question: `Aire d'un cercle de rayon ${r} cm (π ≈ 3,14)`,
      answer: area.toFixed(2).replace('.', ','),
      acceptableAnswers: [area.toFixed(2), area.toFixed(2).replace('.', ',')],
      explanation: `A = π × r² = 3,14 × ${r}² = 3,14 × ${r * r} = ${area.toFixed(2).replace('.', ',')} cm²`,
      timeEstimate: 40
    };
  }

  private generateCoordinatePoint(): GeneratedQuestion {
    const x = randomInt(-5, 5);
    const y = randomInt(-5, 5);
    
    return {
      id: hashQuestion(this.level, 'geometry', [x, y]),
      type: 'numeric',
      domain: 'geometry',
      level: this.level,
      difficultyElo: 1480,
      question: `Quelles sont les coordonnées du point A ?\n(Le point A est placé sur le repère)`,
      answer: `(${x}; ${y})`,
      acceptableAnswers: [`(${x}, ${y})`, `${x}; ${y}`, `${x}, ${y}`],
      explanation: `Le point A a pour abscisse (x) ${x} et pour ordonnée (y) ${y}. On note A(${x}; ${y}).`,
      timeEstimate: 30
    };
  }
}
