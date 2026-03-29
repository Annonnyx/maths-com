// Import types from french-classes to avoid duplicates
import { 
  FRENCH_CLASSES, 
  FrenchClass, 
  OperationType, 
  Exercise, 
  getClassFromElo 
} from './french-classes';

// Import the unified question-generators system
import { AdaptiveQuestionGenerator, DomainType } from './question-generators';

// Random number generator with constraints
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate addition exercise
export function generateAddition(className: FrenchClass): Exercise {
  let a: number, b: number;
  
  switch (className) {
    case 'CP': // CP - very basic automatisms
      a = randomInt(1, 5);
      b = randomInt(1, 5);
      break;
    case 'CE1': // CE1 - small numbers
      a = randomInt(1, 10);
      b = randomInt(1, 10);
      break;
    case 'CE2': // CE2 - complement to 10 focus
      a = randomInt(1, 10);
      b = randomInt(1, 10);
      break;
    case 'CM1': // CM1 - double digits
      a = randomInt(10, 20);
      b = randomInt(10, 20);
      break;
    case 'CM2': // CM2 - larger numbers but still manageable
      a = randomInt(20, 50);
      b = randomInt(10, 30);
      break;
    case '6e':
      a = randomInt(50, 200);
      b = randomInt(50, 200);
      break;
    case '5e':
      a = randomInt(100, 500);
      b = randomInt(100, 500);
      break;
    case '4e':
      a = randomInt(200, 999);
      b = randomInt(200, 999);
      break;
    case '3e':
      a = randomInt(100, 999);
      b = randomInt(100, 999);
      break;
    case '2de':
      a = randomInt(100, 999);
      b = randomInt(100, 999);
      break;
    default:
      a = randomInt(1, 20);
      b = randomInt(1, 20);
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'addition',
    className,
    question: `${a} + ${b} = ?`,
    answer: (a + b).toString()
  };
}

// Generate subtraction exercise
export function generateSubtraction(className: FrenchClass): Exercise {
  let a: number, b: number;
  
  switch (className) {
    case 'CP': // CP - very basic
      a = randomInt(2, 10);
      b = randomInt(1, a);
      break;
    case 'CE1': // CE1 - small numbers
      a = randomInt(5, 15);
      b = randomInt(1, a);
      break;
    case 'CE2': // CE2 - complement to 10
      a = randomInt(10, 20);
      b = randomInt(1, a);
      break;
    case 'CM1': // CM1 - double digits
      a = randomInt(20, 50);
      b = randomInt(10, a);
      break;
    case 'CM2': // CM2 - manageable numbers
      a = randomInt(50, 100);
      b = randomInt(20, a);
      break;
    case '6e':
      a = randomInt(100, 500);
      b = randomInt(50, a);
      break;
    case '5e':
      a = randomInt(200, 1000);
      b = randomInt(100, a);
      break;
    case '4e':
      a = randomInt(500, 2000);
      b = randomInt(200, a);
      break;
    case '3e':
      a = randomInt(100, 500);
      b = randomInt(100, a);
      break;
    case '2de':
      a = randomInt(100, 500);
      b = randomInt(100, a);
      break;
    default:
      a = randomInt(10, 50);
      b = randomInt(1, a);
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'subtraction',
    className,
    question: `${a} - ${b} = ?`,
    answer: (a - b).toString()
  };
}

// Generate multiplication exercise
function generateMultiplication(className: FrenchClass): Exercise {
  let a: number, b: number;
  
  switch (className) {
    case 'CP': // CP - basic tables 2-5
      a = randomInt(2, 5);
      b = randomInt(1, 5);
      break;
    case 'CE1': // CE1 - tables up to 10
      a = randomInt(2, 10);
      b = randomInt(1, 10);
      break;
    case 'CE2': // CE2 - more complex
      a = randomInt(3, 10);
      b = randomInt(2, 10);
      break;
    case 'CM1': // CM1 - larger numbers
      a = randomInt(5, 15);
      b = randomInt(3, 15);
      break;
    case 'CM2': // CM2 - two-digit numbers
      a = randomInt(10, 20);
      b = randomInt(5, 20);
      break;
    case '6e': // 6e - more variety
      a = randomInt(10, 30);
      b = randomInt(10, 30);
      break;
    case '5e': // 5e - larger numbers
      a = randomInt(15, 50);
      b = randomInt(15, 50);
      break;
    case '4e': // 4e - complex multiplication
      a = randomInt(20, 100);
      b = randomInt(20, 100);
      break;
    case '3e': // 3e - advanced
      a = randomInt(30, 200);
      b = randomInt(30, 200);
      break;
    default: // 2de and above
      a = randomInt(50, 500);
      b = randomInt(50, 500);
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'multiplication',
    className,
    question: `${a} × ${b} = ?`,
    answer: (a * b).toString()
  };
}

// Generate division exercise
function generateDivision(className: FrenchClass): Exercise {
  let a: number, b: number, result: number;  
  switch (className) {
    case 'CP': // CP - very basic division
      result = randomInt(1, 5);
      b = randomInt(2, 5);
      a = result * b;
      break;
    case 'CE1': // CE1 - small numbers
      result = randomInt(1, 10);
      b = randomInt(2, 10);
      a = result * b;
      break;
    case 'CE2': // CE2 - basic division
      result = randomInt(2, 15);
      b = randomInt(2, 15);
      a = result * b;
      break;
    case 'CM1': // CM1 - medium numbers
      result = randomInt(5, 20);
      b = randomInt(3, 20);
      a = result * b;
      break;
    case 'CM2': // CM2 - larger numbers
      result = randomInt(10, 30);
      b = randomInt(5, 30);
      a = result * b;
      break;
    case '6e': // 6e - more complex
      result = randomInt(15, 50);
      b = randomInt(10, 50);
      a = result * b;
      break;
    case '5e': // 5e - advanced
      result = randomInt(20, 100);
      b = randomInt(15, 100);
      a = result * b;
      break;
    case '4e': // 4e - very advanced
      result = randomInt(30, 200);
      b = randomInt(20, 200);
      a = result * b;
      break;
    case '3e': // 3e - expert
      result = randomInt(50, 500);
      b = randomInt(30, 500);
      a = result * b;
      break;
    default: // 2de and above
      result = randomInt(100, 1000);
      b = randomInt(50, 1000);
      a = result * b;
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'division',
    className,
    question: `${a} ÷ ${b} = ?`,
    answer: result.toString()
  };
}

// Generate power exercise
function generatePower(className: FrenchClass): Exercise {
  let a: number, b: number;
  
  switch (className) {
    case 'CP':
    case 'CE1':
      a = randomInt(2, 5);
      b = 2;
      break;
    case 'CE2':
      a = randomInt(2, 10);
      b = 2;
      break;
    case 'CM1':
      a = randomInt(2, 12);
      b = randomInt(2, 3);
      break;
    case 'CM2':
      a = randomInt(2, 15);
      b = randomInt(2, 3);
      break;
    case '6e':
      a = randomInt(2, 20);
      b = randomInt(2, 4);
      break;
    case '5e':
      a = randomInt(5, 25);
      b = randomInt(2, 4);
      break;
    case '4e':
      a = randomInt(2, 10);
      b = randomInt(3, 5);
      break;
    case '3e':
      a = randomInt(2, 15);
      b = randomInt(3, 5);
      break;
    default:
      a = randomInt(2, 20);
      b = randomInt(3, 5);
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'power',
    className,
    question: `${a}^${b} = ?`,
    answer: Math.pow(a, b).toString()
  };
}

// Generate square root exercise
function generateRoot(className: FrenchClass): Exercise {
  let a: number, result: number;
  
  switch (className) {
    case 'CP':
    case 'CE1':
      result = randomInt(2, 5);
      a = result * result;
      break;
    case 'CE2':
      result = randomInt(2, 10);
      a = result * result;
      break;
    case 'CM1':
      result = randomInt(5, 15);
      a = result * result;
      break;
    case 'CM2':
      result = randomInt(10, 20);
      a = result * result;
      break;
    case '6e':
      result = randomInt(10, 30);
      a = result * result;
      break;
    case '5e':
      result = randomInt(20, 50);
      a = result * result;
      break;
    case '4e':
      result = randomInt(30, 70);
      a = result * result;
      break;
    case '3e':
      result = randomInt(50, 100);
      a = result * result;
      break;
    default:
      result = randomInt(100, 200);
      a = result * result;
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'root',
    className,
    question: `√${a} = ?`,
    answer: result.toString()
  };
}

// Generate factorization exercise
function generateFactorization(className: FrenchClass): Exercise {
  let a: number, b: number, c: number;
  
  switch (className) {
    case 'CP':
    case 'CE1':
      a = randomInt(2, 5);
      b = randomInt(2, 5);
      c = randomInt(2, 10);
      break;
    case 'CE2':
      a = randomInt(2, 10);
      b = randomInt(2, 10);
      c = randomInt(5, 15);
      break;
    case 'CM1':
      a = randomInt(3, 15);
      b = randomInt(3, 15);
      c = randomInt(10, 30);
      break;
    case 'CM2':
      a = randomInt(5, 20);
      b = randomInt(5, 20);
      c = randomInt(20, 50);
      break;
    case '6e':
      a = randomInt(10, 30);
      b = randomInt(10, 30);
      c = randomInt(30, 100);
      break;
    case '5e':
      a = randomInt(10, 50);
      b = randomInt(10, 50);
      c = randomInt(50, 150);
      break;
    case '4e':
      a = randomInt(20, 100);
      b = randomInt(20, 100);
      c = randomInt(100, 300);
      break;
    case '3e':
      a = randomInt(50, 200);
      b = randomInt(50, 200);
      c = randomInt(200, 500);
      break;
    default:
      a = randomInt(100, 500);
      b = randomInt(100, 500);
      c = randomInt(500, 2000);
  }
  
  const result = a * c + b * c;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'factorization',
    className,
    question: `${a}×${c} + ${b}×${c} = ?`,
    answer: result.toString()
  };
}

// Main exercise generator function
export function generateExercise(type: OperationType, className: FrenchClass): Exercise {
  switch (type) {
    case 'addition':
      return generateAddition(className);
    case 'subtraction':
      return generateSubtraction(className);
    case 'multiplication':
      return generateMultiplication(className);
    case 'division':
      return generateDivision(className);
    case 'power':
      return generatePower(className);
    case 'root':
      return generateRoot(className);
    case 'factorization':
      return generateFactorization(className);
    case 'percentage':
      return generatePercentage(className);
    case 'fraction':
      return generateFraction(className);
    case 'equation':
      return generateEquation(className);
    case 'mental_math':
      return generateMentalMath(className);
    case 'logic':
      return generateLogic(className);
    case 'geometry':
      return generateGeometry(className);
    case 'delta':
      return generateAddition(className); // Temporarily use addition
    case 'quadratic':
      return generateAddition(className); // Temporarily use addition
    default:
      return generateAddition(className);
  }
}

// Validate answer for exercise
export function validateAnswer(exercise: Exercise, userAnswer: string): boolean {
  // Remove whitespace and convert to lowercase for comparison
  const cleanUserAnswer = userAnswer.trim().toLowerCase();
  const cleanCorrectAnswer = exercise.answer.trim().toLowerCase();
  
  // Handle numeric answers with various formats
  if (!isNaN(Number(cleanUserAnswer)) && !isNaN(Number(cleanCorrectAnswer))) {
    return Math.abs(Number(cleanUserAnswer) - Number(cleanCorrectAnswer)) < 0.01;
  }
  
  // Handle exact string matches
  return cleanUserAnswer === cleanCorrectAnswer;
}

// Generate a test with mixed questions using unified question-generators system
export function generateTest(elo: number, count: number = 20): Exercise[] {
  // Use question-generators system for competitive tests too
  const generator = new AdaptiveQuestionGenerator(elo);
  const questions = generator.generateMixed(count);
  
  // Convert GeneratedQuestion to Exercise format
  return questions.map(q => ({
    id: q.id,
    type: mapDomainToOperationType(q.domain),
    className: q.level as FrenchClass,
    question: q.question,
    answer: q.answer,
    explanation: q.explanation
  }));
}

// Helper function to map domain types to operation types
function mapDomainToOperationType(domain: DomainType): OperationType {
  const mapping: Record<DomainType, OperationType> = {
    'arithmetic': 'addition', // Default to addition, can be refined
    'algebra': 'equation',
    'geometry': 'geometry',
    'functions': 'equation',
    'statistics': 'logic',
    'complex': 'equation',
    'calculation': 'addition'
  };
  return mapping[domain] || 'addition';
}

// Get available operations for a French class (following school curriculum)
function getFrenchClassOperations(className: FrenchClass): OperationType[] {
  const baseOps: OperationType[] = ['addition', 'mental_math'];
  
  switch (className) {
    case 'CP':
      return ['addition', 'mental_math', 'logic'];
    case 'CE1':
      return ['addition', 'subtraction', 'multiplication', 'mental_math', 'logic'];
    case 'CE2':
      return ['addition', 'subtraction', 'multiplication', 'division', 'mental_math', 'logic'];
    case 'CM1':
      return ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'mental_math', 'logic'];
    case 'CM2':
      return ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'mental_math', 'logic'];
    case '6e':
      return ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'geometry', 'mental_math', 'logic'];
    case '5e':
      return ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'geometry', 'mental_math', 'logic'];
    case '4e':
      return ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'geometry', 'mental_math', 'logic'];
    case '3e':
      return ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'geometry', 'mental_math', 'logic'];
    default: // 2de and above
      return ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'geometry', 'delta', 'quadratic', 'mental_math', 'logic'];
  }
}

// Generate evaluation test using adaptive algorithm
export function generateEvaluationTest(count: number = 20, excludeGeometry: boolean = false): Exercise[] {
  // Use question-generators system for evaluation tests
  const generator = new AdaptiveQuestionGenerator(1200); // Medium ELO for evaluation
  const questions = generator.generateMixed(count, { excludeGeometry });
  
  // Convert GeneratedQuestion to Exercise format
  return questions.map(q => ({
    id: q.id,
    type: mapDomainToOperationType(q.domain),
    className: q.level as FrenchClass,
    question: q.question,
    answer: q.answer,
    explanation: q.explanation
  }));
}

// Generate multiplayer questions using adaptive algorithm
export function generateMultiplayerQuestions(
  player1Elo: number,
  player2Elo: number,
  count: number = 20
): Exercise[] {
  // Use question-generators system for multiplayer
  const avgElo = Math.round((player1Elo + player2Elo) / 2);
  const generator = new AdaptiveQuestionGenerator(avgElo);
  const questions = generator.generateMixed(count);
  
  // Convert GeneratedQuestion to Exercise format
  return questions.map(q => ({
    id: q.id,
    type: mapDomainToOperationType(q.domain),
    className: q.level as FrenchClass,
    question: q.question,
    answer: q.answer,
    explanation: q.explanation
  }));
}

// Helper function to get classes around a given class
function getClassesAround(targetClass: FrenchClass): FrenchClass[] {
  const classes: FrenchClass[] = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'];
  const targetIndex = classes.indexOf(targetClass);
  
  // Return current class and adjacent classes
  const result: FrenchClass[] = [targetClass];
  if (targetIndex > 0) result.push(classes[targetIndex - 1]);
  if (targetIndex < classes.length - 1) result.push(classes[targetIndex + 1]);
  
  return result;
}

// Get operation types for course
export function getOperationTypesForCourse(courseType: string): OperationType[] | null {
  const mapping: Record<string, OperationType[]> = {
    'addition': ['addition'],
    'subtraction': ['subtraction'],
    'multiplication': ['multiplication'],
    'division': ['division'],
    'pourcentage': ['percentage'],
    'fractions': ['fraction'],
    'equations': ['equation'],
    'calcul-mental': ['mental_math'],
    'logique': ['logic'],
    'methodes-avancees': ['addition', 'subtraction', 'multiplication', 'division', 'power', 'root', 'factorization', 'percentage', 'fraction', 'equation'],
  };
  return mapping[courseType] || null;
}

// Generate a focused test on specific operation types (using French class system)
export function generateFocusedTest(
  types: OperationType[],
  targetClass: FrenchClass,
  count: number = 20,
  elo: number = 600
): Exercise[] {
  const questions: Exercise[] = [];
  
  for (let i = 0; i < count; i++) {
    // Vary slightly between current class and adjacent classes
    const classOptions = getClassesAround(targetClass);
    const selectedClass = classOptions[Math.floor(Math.random() * classOptions.length)];
    
    // Pick random operation from specified types
    const operation = types[Math.floor(Math.random() * types.length)];
    
    questions.push(generateExercise(operation, selectedClass));
  }
  
  return questions;
}

// Generate percentage exercise
function generatePercentage(className: FrenchClass): Exercise {
  let base: number, percentage: number, answer: number;
  
  switch (className) {
    case 'CP':
    case 'CE1':
      base = randomInt(10, 100);
      percentage = [10, 25, 50, 75][randomInt(0, 3)];
      break;
    case 'CE2':
    case 'CM1':
      base = randomInt(20, 200);
      percentage = [5, 10, 20, 25, 50][randomInt(0, 4)];
      break;
    case 'CM2':
    case '6e':
      base = randomInt(50, 500);
      percentage = randomInt(1, 20) * 5;
      break;
    default:
      base = randomInt(10, 1000);
      percentage = randomInt(1, 99);
  }
  
  answer = Math.round((base * percentage) / 100);
  
  const scenarios = [
    `${percentage}% de ${base}`,
    `Réduction de ${percentage}% sur ${base}`,
    `Augmentation de ${percentage}% sur ${base}`
  ];
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'percentage',
    className,
    question: `${scenarios[randomInt(0, scenarios.length - 1)]} = ?`,
    answer: answer.toString()
  };
}

// Helper functions for fractions
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(num: number, den: number): string {
  const divisor = gcd(num, den);
  return `${num / divisor}/${den / divisor}`;
}

// Generate fraction exercise
function generateFraction(className: FrenchClass): Exercise {
  let num1: number, den1: number, num2: number, den2: number;
  
  switch (className) {
    case 'CP':
    case 'CE1':
      den1 = randomInt(2, 10);
      num1 = randomInt(1, den1 - 1);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'fraction',
        className,
        question: `Convertis ${num1}/${den1} en décimal`,
        answer: (num1 / den1).toFixed(2).replace('.00', '')
      };
    case 'CE2':
    case 'CM1':
      den1 = randomInt(2, 12);
      num1 = randomInt(1, den1);
      den2 = den1;
      num2 = randomInt(1, den2);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'fraction',
        className,
        question: `${num1}/${den1} + ${num2}/${den2} = ? (donne le numérateur)`,
        answer: (num1 + num2).toString()
      };
    default:
      den1 = randomInt(2, 20);
      num1 = randomInt(1, den1 * 3);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'fraction',
        className,
        question: `Simplifie ${num1}/${den1} au maximum (format: a/b)`,
        answer: simplifyFraction(num1, den1)
      };
  }
}

// Generate equation exercise (simple linear)
function generateEquation(className: FrenchClass): Exercise {
  let a: number, b: number, c: number, x: number;
  
  const isLowLevel = ['CP', 'CE1', 'CE2'].includes(className);
  const isMediumLevel = ['CM1', 'CM2', '6e', '5e'].includes(className);
  
  x = randomInt(1, isLowLevel ? 10 : (isMediumLevel ? 50 : 100));
  a = randomInt(2, isMediumLevel ? 5 : 10);
  b = randomInt(1, 20);
  c = a * x + b;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'equation',
    className,
    question: `Résous: ${a}x + ${b} = ${c}`,
    answer: x.toString()
  };
}

// Generate mental math strategies
function generateMentalMath(className: FrenchClass): Exercise {
  const isLowLevel = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(className);
  const strategies = [
    () => {
      const base = randomInt(5, isLowLevel ? 25 : 50);
      const near = base + (Math.random() > 0.5 ? 1 : -1);
      return {
        question: `${base} × ${near} = ?`,
        answer: (base * near).toString()
      };
    },
    () => {
      const num = randomInt(11, 99);
      return {
        question: `${num} × 11 = ?`,
        answer: (num * 11).toString()
      };
    },
    () => {
      const num = randomInt(10, 99);
      return {
        question: `${num}² = ?`,
        answer: (num * num).toString()
      };
    },
    () => {
      const num = randomInt(100, 999);
      return {
        question: `${num} × 5 = ?`,
        answer: (num * 5).toString()
      };
    }
  ];
  
  const strategyIndex = isLowLevel ? randomInt(0, 2) : randomInt(0, strategies.length - 1);
  const result = strategies[strategyIndex]();
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'mental_math',
    className,
    question: result.question,
    answer: result.answer
  };
}

// Generate logic/math puzzle
function generateLogic(className: FrenchClass): Exercise {
  const isLowLevel = ['CP', 'CE1', 'CE2'].includes(className);
  const puzzles = [
    // Sequence completion
    () => {
      const start = randomInt(1, isLowLevel ? 5 : 10);
      const step = randomInt(2, isLowLevel ? 3 : 5);
      const seq = [start, start + step, start + step * 2, start + step * 3];
      return {
        question: `Suite: ${seq.join(', ')}, ?`,
        answer: (start + step * 4).toString()
      };
    },
    // Find the missing number
    () => {
      const a = randomInt(2, isLowLevel ? 5 : 10);
      const b = randomInt(2, isLowLevel ? 5 : 10);
      const c = a * b;
      return {
        question: `${a} × ? = ${c}`,
        answer: b.toString()
      };
    },
    // Number pattern
    () => {
      const base = randomInt(2, isLowLevel ? 5 : 9);
      const pattern = [base, base * 2, base * 3, base * 4];
      return {
        question: `Motif: ${pattern.join(', ')}, ?`,
        answer: (base * 5).toString()
      };
    }
  ];
  
  const puzzleIndex = isLowLevel ? randomInt(0, 1) : randomInt(0, puzzles.length - 1);
  const result = puzzles[puzzleIndex]();
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'logic',
    className,
    question: result.question,
    answer: result.answer
  };
}

// Generate geometry exercise (perimeter, area, volume)
function generateGeometry(className: FrenchClass): Exercise {
  const geometryTypes = ['perimeter', 'area', 'volume', 'angle', 'pythagore'];
  const classIndex = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'].indexOf(className);
  const type = geometryTypes[randomInt(0, Math.min(geometryTypes.length - 1, classIndex + 1))];
  
  switch (type) {
    case 'perimeter': {
      // Square, rectangle, triangle, circle
      const shapes = ['carré', 'rectangle', 'triangle', 'cercle'];
      const shape = shapes[randomInt(0, Math.min(shapes.length - 1, classIndex + 1))];
      
      if (shape === 'carré') {
        const side = randomInt(3, 5 + classIndex * 2);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Périmètre d'un carré de côté ${side} cm = ?`,
          answer: (side * 4).toString()
        };
      } else if (shape === 'rectangle') {
        const length = randomInt(5, 10 + classIndex * 2);
        const width = randomInt(3, length - 1);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Périmètre d'un rectangle de ${length} cm × ${width} cm = ?`,
          answer: (2 * (length + width)).toString()
        };
      } else if (shape === 'triangle') {
        const a = randomInt(3, 5 + classIndex);
        const b = randomInt(3, 5 + classIndex);
        const c = randomInt(3, 5 + classIndex);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Périmètre d'un triangle de côtés ${a}, ${b}, ${c} cm = ?`,
          answer: (a + b + c).toString()
        };
      } else {
        const radius = randomInt(3, 5 + classIndex);
        const perimeter = Math.round(2 * Math.PI * radius);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Circonférence d'un cercle de rayon ${radius} cm (π≈3,14) = ?`,
          answer: perimeter.toString()
        };
      }
    }
    
    case 'area': {
      const shapes = ['rectangle', 'triangle', 'cercle'];
      const shape = shapes[randomInt(0, Math.min(shapes.length - 1, classIndex + 1))];
      
      if (shape === 'rectangle') {
        const length = randomInt(4, 8 + classIndex);
        const width = randomInt(3, 6 + classIndex);
        const area = length * width;
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Aire d'un rectangle de ${length} cm × ${width} cm = ?`,
          answer: area.toString()
        };
      } else if (shape === 'triangle') {
        const base = randomInt(4, 8 + classIndex);
        const height = randomInt(3, 6 + classIndex);
        const area = Math.round((base * height) / 2);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Aire d'un triangle de base ${base} cm et hauteur ${height} cm = ?`,
          answer: area.toString()
        };
      } else {
        const radius = randomInt(2, 5 + classIndex);
        const area = Math.round(Math.PI * radius * radius);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Aire d'un cercle de rayon ${radius} cm (π≈3,14) = ?`,
          answer: area.toString()
        };
      }
    }
    
    case 'volume': {
      const shapes = ['cube', 'pavé'];
      const shape = shapes[randomInt(0, Math.min(shapes.length - 1, classIndex - 3))];
      
      if (shape === 'cube') {
        const side = randomInt(3, 5 + classIndex);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Volume d'un cube d'arête ${side} cm = ?`,
          answer: (side * side * side).toString()
        };
      } else {
        const length = randomInt(5, 10 + classIndex);
        const width = randomInt(3, 6 + classIndex);
        const height = randomInt(2, 5 + classIndex);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Volume d'un pavé droit de ${length}×${width}×${height} cm = ?`,
          answer: (length * width * height).toString()
        };
      }
    }
    
    case 'angle': {
      const angle1 = randomInt(30, 80);
      const angle2 = randomInt(30, 80);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'geometry',
        className,
        question: `Dans un triangle, deux angles font ${angle1}° et ${angle2}°. Le troisième angle = ?`,
        answer: (180 - angle1 - angle2).toString()
      };
    }
    
    case 'pythagore': {
      const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
      const triple = triples[randomInt(0, Math.min(triples.length - 1, classIndex))];
      const [a, b, c] = triple;
      const askFor = randomInt(0, 2);
      
      if (askFor === 0) {
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Triangle rectangle : côtés ${a} et ${b}, hypoténuse = ?`,
          answer: c.toString()
        };
      } else {
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          className,
          question: `Triangle rectangle : hypoténuse ${c}, un côté ${a}, l'autre côté = ?`,
          answer: b.toString()
        };
      }
    }
    
    default:
      // Create a simple addition fallback for lower levels
      const a = randomInt(1, 10);
      const b = randomInt(1, 10);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'geometry',
        className,
        question: `${a} + ${b} = ?`,
        answer: (a + b).toString()
      };
  }
}
