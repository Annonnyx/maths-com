import { GeneratedQuestion, QuestionGenerator, randomInt, randomFloat, randomChoice, shuffleArray } from './types';

export class GeometryGenerator implements QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion {
    const generators = [
      () => this.generatePythagoras(difficulty),
      () => this.generateThales(difficulty),
      () => this.generateTrigonometry(difficulty),
      () => this.generateArea(difficulty),
      () => this.generatePerimeter(difficulty),
      () => this.generateVolume(difficulty),
    ];

    // Select generators based on difficulty
    const availableGenerators = difficulty <= 3 
      ? generators.slice(3, 5) // Only areas and perimeters
      : difficulty <= 6 
        ? generators.slice(0, 5) // + Pythagoras and Thales
        : difficulty <= 8 
          ? generators.slice(0, 6) // + trigonometry
          : generators; // All generators

    const generator = randomChoice(availableGenerators);
    return generator();
  }

  private generatePythagoras(difficulty: number): GeneratedQuestion {
    let a: number, b: number, c: number;
    
    switch (difficulty) {
      case 4:
        a = randomInt(3, 6);
        b = randomInt(4, 8);
        c = Math.sqrt(a * a + b * b);
        break;
      case 5:
        a = randomInt(5, 9);
        b = randomInt(6, 12);
        c = Math.sqrt(a * a + b * b);
        break;
      case 6:
        a = randomInt(6, 12);
        b = randomInt(8, 15);
        c = Math.sqrt(a * a + b * b);
        break;
      case 7:
        a = randomInt(8, 15);
        b = randomInt(10, 20);
        c = Math.sqrt(a * a + b * b);
        break;
      case 8:
        a = randomInt(10, 20);
        b = randomInt(12, 25);
        c = Math.sqrt(a * a + b * b);
        break;
      case 9:
        a = randomInt(12, 25);
        b = randomInt(15, 30);
        c = Math.sqrt(a * a + b * b);
        break;
      case 10:
        a = randomInt(15, 30);
        b = randomInt(20, 40);
        c = Math.sqrt(a * a + b * b);
        break;
      default:
        a = 3; b = 4; c = 5;
    }

    const wrongAnswers = [
      (c + 1).toFixed(1),
      (c - 1).toFixed(1),
      (a + b).toFixed(1),
      (Math.abs(a - b)).toFixed(1),
    ].filter(ans => ans !== c.toFixed(1));

    const answers = shuffleArray([c.toFixed(1), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `Dans un triangle rectangle, les côtés de l'angle droit mesurent ${a} cm et ${b} cm. Quelle est la longueur de l'hypoténuse ?`,
      answers,
      correct: c.toFixed(1),
      explanation: `Pythagore : c² = a² + b² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}, donc c = √${a * a + b * b} ≈ ${c.toFixed(1)} cm`,
      difficulty
    };
  }

  private generateThales(difficulty: number): GeneratedQuestion {
    let ab: number, ac: number, ad: number;
    
    switch (difficulty) {
      case 6:
        ab = randomInt(4, 8);
        ac = randomInt(8, 16);
        ad = randomInt(2, 6);
        break;
      case 7:
        ab = randomInt(6, 12);
        ac = randomInt(12, 24);
        ad = randomInt(3, 9);
        break;
      case 8:
        ab = randomInt(8, 16);
        ac = randomInt(16, 32);
        ad = randomInt(4, 12);
        break;
      case 9:
        ab = randomInt(10, 20);
        ac = randomInt(20, 40);
        ad = randomInt(5, 15);
        break;
      case 10:
        ab = randomInt(12, 24);
        ac = randomInt(24, 48);
        ad = randomInt(6, 18);
        break;
      default:
        ab = 6; ac = 12; ad = 3;
    }

    const ae = (ad * ac) / ab;

    const wrongAnswers = [
      (ae + 1).toFixed(1),
      (ae - 1).toFixed(1),
      (ad + ab).toFixed(1),
      (ac - ad).toFixed(1),
    ].filter(ans => ans !== ae.toFixed(1));

    const answers = shuffleArray([ae.toFixed(1), ...wrongAnswers.slice(0, 3)]);

    return {
      question: `Dans une configuration de Thalès, si AB = ${ab} cm, AC = ${ac} cm et AD = ${ad} cm, quelle est la longueur AE ?`,
      answers,
      correct: ae.toFixed(1),
      explanation: `Thalès : AD/AB = AE/AC, donc AE = (AD × AC) / AB = (${ad} × ${ac}) / ${ab} = ${ae.toFixed(1)} cm`,
      difficulty
    };
  }

  private generateTrigonometry(difficulty: number): GeneratedQuestion {
    let angle: number, opposite: number, adjacent: number, hypotenuse: number;
    let questionType: 'sin' | 'cos' | 'tan';
    
    switch (difficulty) {
      case 7:
        angle = randomChoice([30, 45, 60]);
        opposite = randomInt(3, 8);
        adjacent = randomInt(3, 8);
        hypotenuse = Math.sqrt(opposite * opposite + adjacent * adjacent);
        questionType = randomChoice(['sin', 'cos', 'tan']);
        break;
      case 8:
        angle = randomInt(15, 75);
        opposite = randomInt(5, 12);
        adjacent = randomInt(5, 12);
        hypotenuse = Math.sqrt(opposite * opposite + adjacent * adjacent);
        questionType = randomChoice(['sin', 'cos', 'tan']);
        break;
      case 9:
        angle = randomInt(10, 80);
        opposite = randomInt(8, 20);
        adjacent = randomInt(8, 20);
        hypotenuse = Math.sqrt(opposite * opposite + adjacent * adjacent);
        questionType = randomChoice(['sin', 'cos', 'tan']);
        break;
      case 10:
        angle = randomInt(5, 85);
        opposite = randomInt(10, 30);
        adjacent = randomInt(10, 30);
        hypotenuse = Math.sqrt(opposite * opposite + adjacent * adjacent);
        questionType = randomChoice(['sin', 'cos', 'tan']);
        break;
      default:
        angle = 45; opposite = 3; adjacent = 3; hypotenuse = Math.sqrt(18);
        questionType = 'sin';
    }

    let result: number;
    let questionText: string;

    switch (questionType) {
      case 'sin':
        result = opposite / hypotenuse;
        questionText = `Dans un triangle rectangle, si l'angle mesure ${angle}° et le côté opposé mesure ${opposite} cm, avec une hypoténuse de ${hypotenuse.toFixed(1)} cm, que vaut sin(${angle}°) ?`;
        break;
      case 'cos':
        result = adjacent / hypotenuse;
        questionText = `Dans un triangle rectangle, si l'angle mesure ${angle}° et le côté adjacent mesure ${adjacent} cm, avec une hypoténuse de ${hypotenuse.toFixed(1)} cm, que vaut cos(${angle}°) ?`;
        break;
      case 'tan':
        result = opposite / adjacent;
        questionText = `Dans un triangle rectangle, si l'angle mesure ${angle}°, le côté opposé mesure ${opposite} cm et le côté adjacent mesure ${adjacent} cm, que vaut tan(${angle}°) ?`;
        break;
    }

    const wrongAnswers = [
      (result + 0.1).toFixed(3),
      (result - 0.1).toFixed(3),
      (1 - result).toFixed(3),
      (result * 2).toFixed(3),
    ].filter(ans => ans !== result.toFixed(3));

    const answers = shuffleArray([result.toFixed(3), ...wrongAnswers.slice(0, 3)]);

    return {
      question: questionText,
      answers,
      correct: result.toFixed(3),
      explanation: `${questionType}(${angle}°) = ${questionType === 'sin' ? 'opposé/hypoténuse' : questionType === 'cos' ? 'adjacent/hypoténuse' : 'opposé/adjacent'} = ${questionType === 'sin' ? opposite : questionType === 'cos' ? adjacent : opposite}/${questionType === 'sin' ? hypotenuse.toFixed(1) : questionType === 'cos' ? hypotenuse.toFixed(1) : adjacent} = ${result.toFixed(3)}`,
      difficulty
    };
  }

  private generateArea(difficulty: number): GeneratedQuestion {
    let shape: 'rectangle' | 'triangle' | 'circle' | 'square';
    let dimensions: { length?: number; width?: number; base?: number; height?: number; radius?: number; side?: number };
    
    switch (difficulty) {
      case 1:
        shape = 'square';
        dimensions = { side: randomInt(2, 6) };
        break;
      case 2:
        shape = randomChoice(['square', 'rectangle']);
        if (shape === 'square') {
          dimensions = { side: randomInt(3, 8) };
        } else {
          dimensions = { length: randomInt(3, 8), width: randomInt(2, 6) };
        }
        break;
      case 3:
        shape = randomChoice(['square', 'rectangle', 'triangle']);
        if (shape === 'square') {
          dimensions = { side: randomInt(4, 10) };
        } else if (shape === 'rectangle') {
          dimensions = { length: randomInt(4, 12), width: randomInt(3, 8) };
        } else {
          dimensions = { base: randomInt(4, 10), height: randomInt(3, 8) };
        }
        break;
      case 4:
        shape = randomChoice(['rectangle', 'triangle', 'circle']);
        if (shape === 'rectangle') {
          dimensions = { length: randomInt(5, 15), width: randomInt(4, 10) };
        } else if (shape === 'triangle') {
          dimensions = { base: randomInt(6, 12), height: randomInt(4, 10) };
        } else {
          dimensions = { radius: randomInt(3, 8) };
        }
        break;
      case 5:
        shape = randomChoice(['rectangle', 'triangle', 'circle']);
        if (shape === 'rectangle') {
          dimensions = { length: randomInt(8, 20), width: randomInt(5, 15) };
        } else if (shape === 'triangle') {
          dimensions = { base: randomInt(8, 16), height: randomInt(6, 12) };
        } else {
          dimensions = { radius: randomInt(5, 12) };
        }
        break;
      default:
        shape = randomChoice(['rectangle', 'triangle', 'circle']);
        if (shape === 'rectangle') {
          dimensions = { length: randomInt(10, 25), width: randomInt(8, 20) };
        } else if (shape === 'triangle') {
          dimensions = { base: randomInt(10, 20), height: randomInt(8, 16) };
        } else {
          dimensions = { radius: randomInt(8, 18) };
        }
    }

    let area: number;
    let questionText: string;
    let explanation: string;

    switch (shape) {
      case 'square':
        area = dimensions.side! * dimensions.side!;
        questionText = `Quelle est l'aire d'un carré de côté ${dimensions.side} cm ?`;
        explanation = `Pense à la formule de l'aire d'un carré`;
        break;
      case 'rectangle':
        area = dimensions.length! * dimensions.width!;
        questionText = `Quelle est l'aire d'un rectangle de longueur ${dimensions.length} cm et de largeur ${dimensions.width} cm ?`;
        explanation = `Pense à la formule de l'aire d'un rectangle`;
        break;
      case 'triangle':
        area = (dimensions.base! * dimensions.height!) / 2;
        questionText = `Quelle est l'aire d'un triangle de base ${dimensions.base} cm et de hauteur ${dimensions.height} cm ?`;
        explanation = `Pense à la formule de l'aire d'un triangle`;
        break;
      case 'circle':
        area = Math.PI * dimensions.radius! * dimensions.radius!;
        questionText = `Quelle est l'aire d'un cercle de rayon ${dimensions.radius} cm ?`;
        explanation = `Pense à la formule de l'aire d'un cercle`;
        break;
    }

    const wrongAnswers = [
      (area + (dimensions.side || dimensions.length || dimensions.base || dimensions.radius || 5)).toFixed(1),
      (area - 5).toFixed(1),
      (area * 2).toFixed(1),
      (area / 2).toFixed(1),
    ].filter(ans => ans !== area.toFixed(1));

    const answers = shuffleArray([area.toFixed(1), ...wrongAnswers.slice(0, 3)]);

    return {
      question: questionText,
      answers,
      correct: area.toFixed(1),
      explanation,
      difficulty
    };
  }

  private generatePerimeter(difficulty: number): GeneratedQuestion {
    let shape: 'rectangle' | 'triangle' | 'square';
    let dimensions: { length?: number; width?: number; base?: number; side1?: number; side2?: number; side3?: number; side?: number };
    
    switch (difficulty) {
      case 1:
        shape = 'square';
        dimensions = { side: randomInt(2, 6) };
        break;
      case 2:
        shape = randomChoice(['square', 'rectangle']);
        if (shape === 'square') {
          dimensions = { side: randomInt(3, 8) };
        } else {
          dimensions = { length: randomInt(3, 8), width: randomInt(2, 6) };
        }
        break;
      case 3:
        shape = randomChoice(['square', 'rectangle', 'triangle']);
        if (shape === 'square') {
          dimensions = { side: randomInt(4, 10) };
        } else if (shape === 'rectangle') {
          dimensions = { length: randomInt(4, 12), width: randomInt(3, 8) };
        } else {
          dimensions = { side1: randomInt(3, 8), side2: randomInt(4, 9), side3: randomInt(5, 10) };
        }
        break;
      default:
        shape = randomChoice(['square', 'rectangle', 'triangle']);
        if (shape === 'square') {
          dimensions = { side: randomInt(5, 15) };
        } else if (shape === 'rectangle') {
          dimensions = { length: randomInt(6, 18), width: randomInt(4, 12) };
        } else {
          dimensions = { side1: randomInt(5, 12), side2: randomInt(6, 14), side3: randomInt(7, 16) };
        }
    }

    let perimeter: number;
    let questionText: string;
    let explanation: string;

    switch (shape) {
      case 'square':
        perimeter = 4 * dimensions.side!;
        questionText = `Quel est le périmètre d'un carré de côté ${dimensions.side} cm ?`;
        explanation = `Pense à la formule du périmètre d'un carré`;
        break;
      case 'rectangle':
        perimeter = 2 * (dimensions.length! + dimensions.width!);
        questionText = `Quel est le périmètre d'un rectangle de longueur ${dimensions.length} cm et de largeur ${dimensions.width} cm ?`;
        explanation = `Pense à la formule du périmètre d'un rectangle`;
        break;
      case 'triangle':
        perimeter = dimensions.side1! + dimensions.side2! + dimensions.side3!;
        questionText = `Quel est le périmètre d'un triangle avec des côtés de ${dimensions.side1} cm, ${dimensions.side2} cm et ${dimensions.side3} cm ?`;
        explanation = `Pense à la formule du périmètre d'un triangle`;
        break;
    }

    const wrongAnswers = [
      (perimeter + 5).toString(),
      (perimeter - 5).toString(),
      (perimeter * 2).toString(),
      (perimeter / 2).toString(),
    ].filter(ans => ans !== perimeter.toString());

    const answers = shuffleArray([perimeter.toString(), ...wrongAnswers.slice(0, 3)]);

    return {
      question: questionText,
      answers,
      correct: perimeter.toString(),
      explanation,
      difficulty
    };
  }

  private generateVolume(difficulty: number): GeneratedQuestion {
    let shape: 'cube' | 'rectangular_prism' | 'cylinder';
    let dimensions: { side?: number; length?: number; width?: number; height?: number; radius?: number };
    
    switch (difficulty) {
      case 8:
        shape = 'cube';
        dimensions = { side: randomInt(3, 8) };
        break;
      case 9:
        shape = randomChoice(['cube', 'rectangular_prism']);
        if (shape === 'cube') {
          dimensions = { side: randomInt(4, 10) };
        } else {
          dimensions = { length: randomInt(4, 10), width: randomInt(3, 8), height: randomInt(3, 8) };
        }
        break;
      case 10:
        shape = randomChoice(['cube', 'rectangular_prism', 'cylinder']);
        if (shape === 'cube') {
          dimensions = { side: randomInt(5, 12) };
        } else if (shape === 'rectangular_prism') {
          dimensions = { length: randomInt(6, 15), width: randomInt(4, 12), height: randomInt(4, 12) };
        } else {
          dimensions = { radius: randomInt(3, 8), height: randomInt(6, 15) };
        }
        break;
      default:
        shape = 'cube';
        dimensions = { side: 5 };
    }

    let volume: number;
    let questionText: string;
    let explanation: string;

    switch (shape) {
      case 'cube':
        volume = dimensions.side! * dimensions.side! * dimensions.side!;
        questionText = `Quel est le volume d'un cube d'arête ${dimensions.side} cm ?`;
        explanation = `Pense à la formule du volume d'un cube`;
        break;
      case 'rectangular_prism':
        volume = dimensions.length! * dimensions.width! * dimensions.height!;
        questionText = `Quel est le volume d'un pavé droit de dimensions ${dimensions.length} cm × ${dimensions.width} cm × ${dimensions.height} cm ?`;
        explanation = `Pense à la formule du volume d'un pavé droit`;
        break;
      case 'cylinder':
        volume = Math.PI * dimensions.radius! * dimensions.radius! * dimensions.height!;
        questionText = `Quel est le volume d'un cylindre de rayon ${dimensions.radius} cm et de hauteur ${dimensions.height} cm ?`;
        explanation = `Pense à la formule du volume d'un cylindre`;
        break;
    }

    const wrongAnswers = [
      (volume + 10).toFixed(1),
      (volume - 10).toFixed(1),
      (volume * 2).toFixed(1),
      (volume / 2).toFixed(1),
    ].filter(ans => ans !== volume.toFixed(1));

    const answers = shuffleArray([volume.toFixed(1), ...wrongAnswers.slice(0, 3)]);

    return {
      question: questionText,
      answers,
      correct: volume.toFixed(1),
      explanation,
      difficulty
    };
  }
}
