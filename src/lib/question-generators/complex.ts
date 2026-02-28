import { GeneratedQuestion, QuestionGenerator, randomInt, randomFloat, randomChoice, shuffleArray } from './types';

export class ComplexGenerator implements QuestionGenerator {
  generate(difficulty: number): GeneratedQuestion {
    const generators = [
      () => this.generateComplexNumber(difficulty),
      () => this.generateMatrix(difficulty),
      () => this.generateGraph(difficulty),
    ];

    // Only available for high difficulty levels
    const availableGenerators = difficulty >= 9 ? generators : [];

    if (availableGenerators.length === 0) {
      // Fallback to arithmetic for lower difficulties
      return this.generateComplexNumber(9);
    }

    const generator = randomChoice(availableGenerators);
    return generator();
  }

  private generateComplexNumber(difficulty: number): GeneratedQuestion {
    let a: number, b: number, c: number, d: number;
    let operation: 'add' | 'multiply' | 'modulus';
    
    switch (difficulty) {
      case 9:
        a = randomInt(-5, 5);
        b = randomInt(-5, 5);
        c = randomInt(-5, 5);
        d = randomInt(-5, 5);
        operation = randomChoice(['add', 'multiply']);
        break;
      case 10:
        a = randomInt(-8, 8);
        b = randomInt(-8, 8);
        c = randomInt(-8, 8);
        d = randomInt(-8, 8);
        operation = randomChoice(['add', 'multiply', 'modulus']);
        break;
      default:
        a = 2; b = 3; c = 1; d = 4; operation = 'add';
    }

    let result: string;
    let questionText: string;
    let explanation: string;

    switch (operation) {
      case 'add':
        const realSum = a + c;
        const imagSum = b + d;
        result = `${realSum} ${imagSum >= 0 ? '+' : ''} ${imagSum}i`;
        questionText = `Calcule : (${a} ${b >= 0 ? '+' : ''} ${b}i) + (${c} ${d >= 0 ? '+' : ''} ${d}i)`;
        explanation = `Addition des parties réelles : ${a} + ${c} = ${realSum}, addition des parties imaginaires : ${b} + ${d} = ${imagSum}. Résultat : ${realSum} ${imagSum >= 0 ? '+' : ''} ${imagSum}i`;
        break;
      case 'multiply':
        const realProduct = a * c - b * d;
        const imagProduct = a * d + b * c;
        result = `${realProduct} ${imagProduct >= 0 ? '+' : ''} ${imagProduct}i`;
        questionText = `Calcule : (${a} ${b >= 0 ? '+' : ''} ${b}i) × (${c} ${d >= 0 ? '+' : ''} ${d}i)`;
        explanation = `(${a} + ${b}i)(${c} + ${d}i) = ${a}×${c} - ${b}×${d} + (${a}×${d} + ${b}×${c})i = ${realProduct} ${imagProduct >= 0 ? '+' : ''} ${imagProduct}i`;
        break;
      case 'modulus':
        const modulus = Math.sqrt(a * a + b * b);
        result = modulus.toFixed(2);
        questionText = `Calcule le module de z = ${a} ${b >= 0 ? '+' : ''} ${b}i`;
        explanation = `|z| = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${a * a + b * b} ≈ ${modulus.toFixed(2)}`;
        break;
    }

    const wrongAnswers = [
      `${a + c} ${b + d >= 0 ? '+' : ''} ${b + d}i`, // Wrong for multiplication
      `${a * c} ${b * d >= 0 ? '+' : ''} ${b * d}i`, // Wrong for addition
      (Math.sqrt(a * a + b * b) + 1).toFixed(2), // Wrong for modulus
      `${a - c} ${b - d >= 0 ? '+' : ''} ${b - d}i`, // Subtraction
    ].filter(ans => ans !== result);

    const answers = shuffleArray([result, ...wrongAnswers.slice(0, 3)]);

    return {
      question: questionText,
      answers,
      correct: result,
      explanation,
      difficulty
    };
  }

  private generateMatrix(difficulty: number): GeneratedQuestion {
    let matrixA: number[][], matrixB: number[][];
    let operation: 'add' | 'multiply';
    
    switch (difficulty) {
      case 9:
        // 2x2 matrices
        matrixA = [
          [randomInt(-3, 3), randomInt(-3, 3)],
          [randomInt(-3, 3), randomInt(-3, 3)]
        ];
        matrixB = [
          [randomInt(-3, 3), randomInt(-3, 3)],
          [randomInt(-3, 3), randomInt(-3, 3)]
        ];
        operation = 'add';
        break;
      case 10:
        // 2x2 matrices with multiplication
        matrixA = [
          [randomInt(-2, 2), randomInt(-2, 2)],
          [randomInt(-2, 2), randomInt(-2, 2)]
        ];
        matrixB = [
          [randomInt(-2, 2), randomInt(-2, 2)],
          [randomInt(-2, 2), randomInt(-2, 2)]
        ];
        operation = randomChoice(['add', 'multiply']);
        break;
      default:
        matrixA = [[1, 2], [3, 4]];
        matrixB = [[5, 6], [7, 8]];
        operation = 'add';
    }

    let result: number[][];
    let questionText: string;
    let explanation: string;

    if (operation === 'add') {
      result = [
        [matrixA[0][0] + matrixB[0][0], matrixA[0][1] + matrixB[0][1]],
        [matrixA[1][0] + matrixB[1][0], matrixA[1][1] + matrixB[1][1]]
      ];
      questionText = `Calcule A + B où A = [[${matrixA[0][0]}, ${matrixA[0][1]}], [${matrixA[1][0]}, ${matrixA[1][1]}]] et B = [[${matrixB[0][0]}, ${matrixB[0][1]}], [${matrixB[1][0]}, ${matrixB[1][1]}]]`;
      explanation = `A + B = [[${matrixA[0][0]} + ${matrixB[0][0]}, ${matrixA[0][1]} + ${matrixB[0][1]}], [${matrixA[1][0]} + ${matrixB[1][0]}, ${matrixA[1][1]} + ${matrixB[1][1]}]] = [[${result[0][0]}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`;
    } else {
      // Matrix multiplication
      result = [
        [
          matrixA[0][0] * matrixB[0][0] + matrixA[0][1] * matrixB[1][0],
          matrixA[0][0] * matrixB[0][1] + matrixA[0][1] * matrixB[1][1]
        ],
        [
          matrixA[1][0] * matrixB[0][0] + matrixA[1][1] * matrixB[1][0],
          matrixA[1][0] * matrixB[0][1] + matrixA[1][1] * matrixB[1][1]
        ]
      ];
      questionText = `Calcule A × B où A = [[${matrixA[0][0]}, ${matrixA[0][1]}], [${matrixA[1][0]}, ${matrixA[1][1]}]] et B = [[${matrixB[0][0]}, ${matrixB[0][1]}], [${matrixB[1][0]}, ${matrixB[1][1]}]]`;
      explanation = `A × B = [[${matrixA[0][0]}×${matrixB[0][0]} + ${matrixA[0][1]}×${matrixB[1][0]}, ${matrixA[0][0]}×${matrixB[0][1]} + ${matrixA[0][1]}×${matrixB[1][1]}], [${matrixA[1][0]}×${matrixB[0][0]} + ${matrixA[1][1]}×${matrixB[1][0]}, ${matrixA[1][0]}×${matrixB[0][1]} + ${matrixA[1][1]}×${matrixB[1][1]}]] = [[${result[0][0]}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`;
    }

    const resultString = `[[${result[0][0]}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`;
    
    const wrongAnswers = [
      `[[${result[0][0] + 1}, ${result[0][1]}], [${result[1][0]}, ${result[1][1]}]]`,
      `[[${result[0][0]}, ${result[0][1] + 1}], [${result[1][0]}, ${result[1][1]}]]`,
      `[[${matrixA[0][0] + matrixB[0][0]}, ${matrixA[0][1] + matrixB[0][1]}], [${matrixA[1][0] + matrixB[1][0]}, ${matrixA[1][1] + matrixB[1][1]}]]`, // Element-wise multiplication
    ].filter(ans => ans !== resultString);

    const answers = shuffleArray([resultString, ...wrongAnswers.slice(0, 3)]);

    return {
      question: questionText,
      answers,
      correct: resultString,
      explanation,
      difficulty
    };
  }

  private generateGraph(difficulty: number): GeneratedQuestion {
    let vertices: number, edges: number;
    let questionType: 'vertices' | 'edges' | 'degree';
    
    switch (difficulty) {
      case 9:
        vertices = randomInt(3, 6);
        edges = randomInt(2, vertices * (vertices - 1) / 2);
        questionType = randomChoice(['vertices', 'edges']);
        break;
      case 10:
        vertices = randomInt(4, 8);
        edges = randomInt(3, vertices * (vertices - 1) / 2);
        questionType = randomChoice(['vertices', 'edges', 'degree']);
        break;
      default:
        vertices = 4; edges = 3; questionType = 'vertices';
    }

    let result: string;
    let questionText: string;
    let explanation: string;

    switch (questionType) {
      case 'vertices':
        result = vertices.toString();
        questionText = `Un graphe simple a ${edges} arêtes. Quel est le nombre maximum de sommets possibles ?`;
        explanation = `Dans un graphe simple, le nombre maximum de sommets pour ${edges} arêtes est ${vertices} (graphe complet)`;
        break;
      case 'edges':
        result = edges.toString();
        questionText = `Un graphe complet a ${vertices} sommets. Combien d'arêtes possède-t-il ?`;
        explanation = `Un graphe complet à n sommets a n(n-1)/2 arêtes. Pour ${vertices} sommets : ${vertices}×${vertices-1}/2 = ${edges} arêtes`;
        break;
      case 'degree':
        const degree = randomInt(1, vertices - 1);
        result = degree.toString();
        questionText = `Dans un graphe à ${vertices} sommets, un sommet a un degré de ${degree}. Que signifie le degré d'un sommet ?`;
        explanation = `Le degré d'un sommet est le nombre d'arêtes incidentes à ce sommet. Un degré de ${degree} signifie que le sommet est connecté à ${degree} autres sommets`;
        break;
    }

    const wrongAnswers = [
      (parseInt(result) + 1).toString(),
      (parseInt(result) - 1).toString(),
      (vertices * 2).toString(),
      (edges * 2).toString(),
    ].filter(ans => ans !== result);

    const answers = shuffleArray([result, ...wrongAnswers.slice(0, 3)]);

    return {
      question: questionText,
      answers,
      correct: result,
      explanation,
      difficulty
    };
  }
}
