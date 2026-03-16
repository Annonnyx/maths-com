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

    return randomChoice(generators)();
  }

  private generatePythagoras(difficulty: number): GeneratedQuestion {
    let a: number, b: number;
    
    switch (difficulty) {
      case 1:
        a = randomInt(3, 6);
        b = randomInt(4, 8);
        break;
      case 2:
        a = randomInt(5, 12);
        b = randomInt(8, 15);
        break;
      default:
        a = randomInt(8, 20);
        b = randomInt(10, 25);
    }

    const c = Math.sqrt(a * a + b * b);
    
    const wrongAnswers = [
      (c + 1).toFixed(1),
      (c - 1).toFixed(1),
      (a + b).toFixed(1),
      Math.abs(a - b).toFixed(1),
    ].filter(ans => Math.abs(parseFloat(ans) - c) > 0.1);

    const answers = shuffleArray([c.toFixed(1), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `pythagoras-${Date.now()}`,
      type: 'mcq',
      domain: 'geometry',
      level: 'CM2',
      difficultyElo: 1300,
      question: `Dans un triangle rectangle, les côtés de l'angle droit mesurent ${a} cm et ${b} cm. Quelle est la longueur de l'hypoténuse ?`,
      answer: c.toFixed(1),
      explanation: `Pythagore : c² = a² + b² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}, donc c = √${a * a + b * b} ≈ ${c.toFixed(1)} cm`,
      options: answers,
      timeEstimate: 90
    };
  }

  private generateThales(difficulty: number): GeneratedQuestion {
    let ab: number, ac: number, ad: number;
    
    switch (difficulty) {
      case 3:
        ab = randomInt(4, 8);
        ac = randomInt(6, 10);
        ad = randomInt(2, 6);
        break;
      default:
        ab = randomInt(8, 15);
        ac = randomInt(10, 20);
        ad = randomInt(4, 12);
    }

    const ae = (ad * ac) / ab;
    
    const wrongAnswers = [
      (ae + 1).toFixed(1),
      (ae - 1).toFixed(1),
      ((ad + ac) / 2).toFixed(1),
      (ab * ac / ad).toFixed(1),
    ].filter(ans => Math.abs(parseFloat(ans) - ae) > 0.1);

    const answers = shuffleArray([ae.toFixed(1), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `thales-${Date.now()}`,
      type: 'mcq',
      domain: 'geometry',
      level: 'CM2',
      difficultyElo: 1400,
      question: `Dans une configuration de Thalès, si AB = ${ab} cm, AC = ${ac} cm et AD = ${ad} cm, quelle est la longueur AE ?`,
      answer: ae.toFixed(1),
      explanation: `Thalès : AD/AB = AE/AC, donc AE = (AD × AC) / AB = (${ad} × ${ac}) / ${ab} = ${ae.toFixed(1)} cm`,
      options: answers,
      timeEstimate: 120
    };
  }

  private generateTrigonometry(difficulty: number): GeneratedQuestion {
    let angle: number, opposite: number = 0, adjacent: number = 0, hypotenuse: number;
    let questionType: 'sin' | 'cos' | 'tan';
    let questionText: string;
    let result: number;
    
    switch (difficulty) {
      case 4:
        angle = randomInt(30, 60);
        hypotenuse = randomInt(5, 15);
        questionType = randomChoice(['sin', 'cos']);
        if (questionType === 'sin') {
          opposite = Math.round(hypotenuse * Math.sin(angle * Math.PI / 180));
          questionText = `Dans un triangle rectangle, si l'angle mesure ${angle}° et l'hypoténuse mesure ${hypotenuse} cm, quel est le côté opposé ?`;
          result = opposite;
        } else {
          adjacent = Math.round(hypotenuse * Math.cos(angle * Math.PI / 180));
          questionText = `Dans un triangle rectangle, si l'angle mesure ${angle}° et l'hypoténuse mesure ${hypotenuse} cm, quel est le côté adjacent ?`;
          result = adjacent;
        }
        break;
      default:
        angle = randomInt(15, 75);
        opposite = randomInt(3, 12);
        adjacent = randomInt(3, 12);
        hypotenuse = Math.sqrt(opposite * opposite + adjacent * adjacent);
        questionType = randomChoice(['sin', 'cos', 'tan']);
        if (questionType === 'sin') {
          questionText = `Dans un triangle rectangle, si l'angle mesure ${angle}° et le côté opposé mesure ${opposite} cm, quel est le sinus ?`;
          result = opposite / hypotenuse;
        } else if (questionType === 'cos') {
          questionText = `Dans un triangle rectangle, si l'angle mesure ${angle}° et le côté adjacent mesure ${adjacent} cm, quel est le cosinus ?`;
          result = adjacent / hypotenuse;
        } else {
          questionText = `Dans un triangle rectangle, si l'angle mesure ${angle}° et le côté opposé mesure ${opposite} cm, quel est la tangente ?`;
          result = opposite / adjacent;
        }
    }

    const wrongAnswers = [
      (result + 0.1).toFixed(3),
      (result - 0.1).toFixed(3),
      (result * 2).toFixed(3),
      (result / 2).toFixed(3),
    ].filter(ans => Math.abs(parseFloat(ans) - result) > 0.01);

    const answers = shuffleArray([result.toFixed(3), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `trigonometry-${Date.now()}`,
      type: 'mcq',
      domain: 'geometry',
      level: 'Sup1',
      difficultyElo: 2700,
      question: questionText,
      answer: result.toFixed(3),
      explanation: `${questionType}(${angle}°) = ${questionType === 'sin' ? 'opposé/hypoténuse' : questionType === 'cos' ? 'adjacent/hypoténuse' : 'opposé/adjacent'} = ${questionType === 'sin' ? opposite : questionType === 'cos' ? adjacent : opposite}/${questionType === 'sin' ? hypotenuse.toFixed(1) : questionType === 'cos' ? hypotenuse.toFixed(1) : adjacent} = ${result.toFixed(3)}`,
      options: answers,
      timeEstimate: 120
    };
  }

  private generateArea(difficulty: number): GeneratedQuestion {
    let questionText: string;
    let area: number;
    let explanation: string;
    
    switch (difficulty) {
      case 2:
        const length = randomInt(3, 10);
        const width = randomInt(3, 10);
        area = length * width;
        questionText = `Quelle est l'aire d'un rectangle de longueur ${length} cm et de largeur ${width} cm ?`;
        explanation = `Aire = longueur × largeur = ${length} × ${width} = ${area} cm²`;
        break;
      case 3:
        const base = randomInt(4, 12);
        const height = randomInt(3, 10);
        area = (base * height) / 2;
        questionText = `Quelle est l'aire d'un triangle de base ${base} cm et de hauteur ${height} cm ?`;
        explanation = `Aire = (base × hauteur) / 2 = (${base} × ${height}) / 2 = ${area} cm²`;
        break;
      default:
        const radius = randomInt(3, 10);
        area = Math.PI * radius * radius;
        questionText = `Quelle est l'aire d'un cercle de rayon ${radius} cm ?`;
        explanation = `Aire = π × r² = π × ${radius}² = ${area.toFixed(1)} cm²`;
    }

    const wrongAnswers = [
      (area + 10).toFixed(1),
      (area - 10).toFixed(1),
      (area * 2).toFixed(1),
      (area / 2).toFixed(1),
    ].filter(ans => Math.abs(parseFloat(ans) - area) > 0.1);

    const answers = shuffleArray([area.toFixed(1), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `area-${Date.now()}`,
      type: 'mcq',
      domain: 'geometry',
      level: 'CM2',
      difficultyElo: 1200,
      question: questionText,
      answer: area.toFixed(1),
      explanation,
      options: answers,
      timeEstimate: 90
    };
  }

  private generatePerimeter(difficulty: number): GeneratedQuestion {
    let questionText: string;
    let perimeter: number;
    let explanation: string;
    
    switch (difficulty) {
      case 2:
        const length = randomInt(3, 10);
        const width = randomInt(3, 10);
        perimeter = 2 * (length + width);
        questionText = `Quel est le périmètre d'un rectangle de longueur ${length} cm et de largeur ${width} cm ?`;
        explanation = `Périmètre = 2 × (longueur + largeur) = 2 × (${length} + ${width}) = ${perimeter} cm`;
        break;
      case 3:
        const side = randomInt(3, 10);
        perimeter = 4 * side;
        questionText = `Quel est le périmètre d'un carré de côté ${side} cm ?`;
        explanation = `Périmètre = 4 × côté = 4 × ${side} = ${perimeter} cm`;
        break;
      default:
        const radius = randomInt(3, 10);
        perimeter = 2 * Math.PI * radius;
        questionText = `Quel est le périmètre d'un cercle de rayon ${radius} cm ?`;
        explanation = `Périmètre = 2 × π × r = 2 × π × ${radius} = ${perimeter.toFixed(1)} cm`;
    }

    const wrongAnswers = [
      (perimeter + 5).toFixed(1),
      (perimeter - 5).toFixed(1),
      (perimeter * 2).toFixed(1),
      (perimeter / 2).toFixed(1),
    ].filter(ans => Math.abs(parseFloat(ans) - perimeter) > 0.1);

    const answers = shuffleArray([perimeter.toFixed(1), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `perimeter-${Date.now()}`,
      type: 'mcq',
      domain: 'geometry',
      level: 'CM2',
      difficultyElo: 1100,
      question: questionText,
      answer: perimeter.toFixed(1),
      explanation,
      options: answers,
      timeEstimate: 60
    };
  }

  private generateVolume(difficulty: number): GeneratedQuestion {
    let questionText: string;
    let volume: number;
    let explanation: string;
    
    switch (difficulty) {
      case 3:
        const length = randomInt(2, 8);
        const width = randomInt(2, 8);
        const height = randomInt(2, 8);
        volume = length * width * height;
        questionText = `Quel est le volume d'un parallélépipède rectangle de dimensions ${length} × ${width} × ${height} cm ?`;
        explanation = `Volume = longueur × largeur × hauteur = ${length} × ${width} × ${height} = ${volume} cm³`;
        break;
      case 4:
        const side = randomInt(2, 6);
        volume = side * side * side;
        questionText = `Quel est le volume d'un cube d'arête ${side} cm ?`;
        explanation = `Volume = arête³ = ${side}³ = ${volume} cm³`;
        break;
      default:
        const radius = randomInt(2, 6);
        volume = (4/3) * Math.PI * radius * radius * radius;
        questionText = `Quel est le volume d'une sphère de rayon ${radius} cm ?`;
        explanation = `Volume = (4/3) × π × r³ = (4/3) × π × ${radius}³ = ${volume.toFixed(1)} cm³`;
    }

    const wrongAnswers = [
      (volume + 10).toFixed(1),
      (volume - 10).toFixed(1),
      (volume * 2).toFixed(1),
      (volume / 2).toFixed(1),
    ].filter(ans => Math.abs(parseFloat(ans) - volume) > 0.1);

    const answers = shuffleArray([volume.toFixed(1), ...wrongAnswers.slice(0, 3)]);

    return {
      id: `volume-${Date.now()}`,
      type: 'mcq',
      domain: 'geometry',
      level: 'Sup1',
      difficultyElo: 2600,
      question: questionText,
      answer: volume.toFixed(1),
      explanation,
      options: answers,
      timeEstimate: 120
    };
  }
}
