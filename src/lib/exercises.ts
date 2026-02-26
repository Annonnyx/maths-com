export type OperationType = 
  | 'addition' 
  | 'subtraction' 
  | 'multiplication' 
  | 'division' 
  | 'power' 
  | 'root' 
  | 'factorization'
  | 'percentage'
  | 'fraction'
  | 'equation'
  | 'mental_math'
  | 'logic'
  | 'geometry';

import { 
  FRENCH_CLASSES, 
  FrenchClass, 
  getClassFromElo 
} from './french-classes';

export interface Exercise {
  id: string;
  type: OperationType;
  difficulty: number;
  question: string;
  answer: string;
  explanation?: string;
}

// Random number generator with constraints
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate addition exercise
function generateAddition(difficulty: number): Exercise {
  let a: number, b: number;
  
  switch (difficulty) {
    case 1:
      a = randomInt(1, 10);
      b = randomInt(1, 10);
      break;
    case 2:
      a = randomInt(5, 20);
      b = randomInt(5, 20);
      break;
    case 3:
      a = randomInt(10, 50);
      b = randomInt(10, 50);
      break;
    case 4:
      a = randomInt(20, 100);
      b = randomInt(20, 100);
      break;
    case 5:
      a = randomInt(50, 200);
      b = randomInt(50, 200);
      break;
    case 6:
      a = randomInt(100, 500);
      b = randomInt(100, 500);
      break;
    case 7:
      a = randomInt(200, 999);
      b = randomInt(200, 999);
      break;
    case 8:
      a = randomInt(100, 999);
      b = randomInt(100, 999);
      break;
    case 9:
      a = randomInt(100, 999);
      b = randomInt(100, 999);
      break;
    case 10:
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
    difficulty,
    question: `${a} + ${b} = ?`,
    answer: (a + b).toString(),
    explanation: `${a} + ${b} = ${a + b}`
  };
}

// Generate subtraction exercise
function generateSubtraction(difficulty: number): Exercise {
  let a: number, b: number;
  
  switch (difficulty) {
    case 1:
      a = randomInt(5, 15);
      b = randomInt(1, a);
      break;
    case 2:
      a = randomInt(10, 30);
      b = randomInt(1, a);
      break;
    case 3:
      a = randomInt(20, 100);
      b = randomInt(10, a);
      break;
    case 4:
      a = randomInt(50, 200);
      b = randomInt(20, a);
      break;
    case 5:
      a = randomInt(100, 500);
      b = randomInt(50, a);
      break;
    case 6:
      a = randomInt(200, 1000);
      b = randomInt(100, a);
      break;
    case 7:
      a = randomInt(500, 2000);
      b = randomInt(200, a);
      break;
    case 8:
      a = randomInt(100, 500);
      b = randomInt(100, a);
      break;
    case 9:
      a = randomInt(100, 500);
      b = randomInt(100, a);
      break;
    case 10:
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
    difficulty,
    question: `${a} - ${b} = ?`,
    answer: (a - b).toString(),
    explanation: `${a} - ${b} = ${a - b}`
  };
}

// Generate multiplication exercise
function generateMultiplication(difficulty: number): Exercise {
  let a: number, b: number;
  
  switch (difficulty) {
    case 1:
      a = randomInt(2, 5);
      b = randomInt(2, 10);
      break;
    case 2:
      a = randomInt(2, 9);
      b = randomInt(2, 12);
      break;
    case 3:
      a = randomInt(5, 12);
      b = randomInt(5, 12);
      break;
    case 4:
      a = randomInt(10, 20);
      b = randomInt(5, 15);
      break;
    case 5:
      a = randomInt(10, 50);
      b = randomInt(5, 20);
      break;
    case 6:
      a = randomInt(10, 100);
      b = randomInt(10, 20);
      break;
    case 7:
      a = randomInt(20, 100);
      b = randomInt(10, 50);
      break;
    case 8:
      a = randomInt(50, 200);
      b = randomInt(10, 50);
      break;
    case 9:
      a = randomInt(100, 500);
      b = randomInt(10, 100);
      break;
    case 10:
      a = randomInt(200, 1000);
      b = randomInt(50, 200);
      break;
    default:
      a = randomInt(2, 10);
      b = randomInt(2, 10);
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'multiplication',
    difficulty,
    question: `${a} × ${b} = ?`,
    answer: (a * b).toString(),
    explanation: `${a} × ${b} = ${a * b}`
  };
}

// Generate division exercise
function generateDivision(difficulty: number): Exercise {
  let a: number, b: number, result: number;
  
  switch (difficulty) {
    case 1:
      result = randomInt(2, 10);
      b = randomInt(2, 5);
      a = result * b;
      break;
    case 2:
      result = randomInt(2, 12);
      b = randomInt(2, 10);
      a = result * b;
      break;
    case 3:
      result = randomInt(5, 20);
      b = randomInt(3, 12);
      a = result * b;
      break;
    case 4:
      result = randomInt(10, 50);
      b = randomInt(5, 20);
      a = result * b;
      break;
    case 5:
      result = randomInt(10, 100);
      b = randomInt(5, 20);
      a = result * b;
      break;
    case 6:
      result = randomInt(20, 200);
      b = randomInt(10, 50);
      a = result * b;
      break;
    case 7:
      result = randomInt(50, 500);
      b = randomInt(10, 100);
      a = result * b;
      break;
    case 8:
      result = randomInt(100, 1000);
      b = randomInt(50, 200);
      a = result * b;
      break;
    case 9:
      result = randomInt(200, 2000);
      b = randomInt(100, 500);
      a = result * b;
      break;
    case 10:
      result = randomInt(500, 5000);
      b = randomInt(200, 1000);
      a = result * b;
      break;
    default:
      result = randomInt(2, 10);
      b = randomInt(2, 5);
      a = result * b;
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'division',
    difficulty,
    question: `${a} ÷ ${b} = ?`,
    answer: result.toString(),
    explanation: `${a} ÷ ${b} = ${result} car ${result} × ${b} = ${a}`
  };
}

// Generate power exercise
function generatePower(difficulty: number): Exercise {
  let a: number, b: number;
  
  switch (difficulty) {
    case 1:
      a = randomInt(2, 5);
      b = 2;
      break;
    case 2:
      a = randomInt(2, 10);
      b = 2;
      break;
    case 3:
      a = randomInt(2, 12);
      b = randomInt(2, 3);
      break;
    case 4:
      a = randomInt(2, 15);
      b = randomInt(2, 3);
      break;
    case 5:
      a = randomInt(2, 20);
      b = randomInt(2, 4);
      break;
    case 6:
      a = randomInt(5, 25);
      b = randomInt(2, 4);
      break;
    case 7:
      a = randomInt(2, 10);
      b = randomInt(3, 5);
      break;
    case 8:
      a = randomInt(2, 15);
      b = randomInt(3, 5);
      break;
    case 9:
      a = randomInt(2, 20);
      b = randomInt(3, 5);
      break;
    case 10:
      a = randomInt(5, 30);
      b = randomInt(3, 5);
      break;
    default:
      a = randomInt(2, 10);
      b = 2;
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'power',
    difficulty,
    question: `${a}^${b} = ?`,
    answer: Math.pow(a, b).toString(),
    explanation: `${a}^${b} = ${Math.pow(a, b)}` + 
      (b === 2 ? ` (${a} × ${a})` : 
       b === 3 ? ` (${a} × ${a} × ${a})` : 
       b === 4 ? ` (${a} × ${a} × ${a} × ${a})` : 
       ` (${a} multiplié ${b} fois par lui-même)`)
  };
}

// Generate square root exercise
function generateRoot(difficulty: number): Exercise {
  let a: number, result: number;
  
  switch (difficulty) {
    case 1:
      result = randomInt(2, 5);
      a = result * result;
      break;
    case 2:
      result = randomInt(2, 10);
      a = result * result;
      break;
    case 3:
      result = randomInt(5, 15);
      a = result * result;
      break;
    case 4:
      result = randomInt(10, 20);
      a = result * result;
      break;
    case 5:
      result = randomInt(10, 30);
      a = result * result;
      break;
    case 6:
      result = randomInt(20, 50);
      a = result * result;
      break;
    case 7:
      result = randomInt(30, 70);
      a = result * result;
      break;
    case 8:
      result = randomInt(50, 100);
      a = result * result;
      break;
    case 9:
      result = randomInt(100, 150);
      a = result * result;
      break;
    case 10:
      result = randomInt(150, 200);
      a = result * result;
      break;
    default:
      result = randomInt(2, 10);
      a = result * result;
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'root',
    difficulty,
    question: `√${a} = ?`,
    answer: result.toString(),
    explanation: `√${a} = ${result} car ${result}² = ${a}`
  };
}

// Generate factorization exercise
function generateFactorization(difficulty: number): Exercise {
  let a: number, b: number, c: number;
  
  switch (difficulty) {
    case 1:
      a = randomInt(2, 5);
      b = randomInt(2, 5);
      c = randomInt(2, 10);
      break;
    case 2:
      a = randomInt(2, 10);
      b = randomInt(2, 10);
      c = randomInt(5, 15);
      break;
    case 3:
      a = randomInt(3, 15);
      b = randomInt(3, 15);
      c = randomInt(10, 30);
      break;
    case 4:
      a = randomInt(5, 20);
      b = randomInt(5, 20);
      c = randomInt(20, 50);
      break;
    case 5:
      a = randomInt(10, 30);
      b = randomInt(10, 30);
      c = randomInt(30, 100);
      break;
    case 6:
      a = randomInt(10, 50);
      b = randomInt(10, 50);
      c = randomInt(50, 150);
      break;
    case 7:
      a = randomInt(20, 100);
      b = randomInt(20, 100);
      c = randomInt(100, 300);
      break;
    case 8:
      a = randomInt(50, 200);
      b = randomInt(50, 200);
      c = randomInt(200, 500);
      break;
    case 9:
      a = randomInt(100, 300);
      b = randomInt(100, 300);
      c = randomInt(300, 1000);
      break;
    case 10:
      a = randomInt(200, 500);
      b = randomInt(200, 500);
      c = randomInt(500, 2000);
      break;
    default:
      a = randomInt(2, 10);
      b = randomInt(2, 10);
      c = randomInt(5, 20);
  }
  
  const result = a * c + b * c;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'factorization',
    difficulty,
    question: `${a}×${c} + ${b}×${c} = ?`,
    answer: result.toString(),
    explanation: `${a}×${c} + ${b}×${c} = ${a * c} + ${b * c} = ${result} ou (${a} + ${b}) × ${c} = ${a + b} × ${c} = ${result}`
  };
}

// Main exercise generator function
export function generateExercise(type: OperationType, difficulty: number): Exercise {
  switch (type) {
    case 'addition':
      return generateAddition(difficulty);
    case 'subtraction':
      return generateSubtraction(difficulty);
    case 'multiplication':
      return generateMultiplication(difficulty);
    case 'division':
      return generateDivision(difficulty);
    case 'power':
      return generatePower(difficulty);
    case 'root':
      return generateRoot(difficulty);
    case 'factorization':
      return generateFactorization(difficulty);
    case 'percentage':
      return generatePercentage(difficulty);
    case 'fraction':
      return generateFraction(difficulty);
    case 'equation':
      return generateEquation(difficulty);
    case 'mental_math':
      return generateMentalMath(difficulty);
    case 'logic':
      return generateLogic(difficulty);
    case 'geometry':
      return generateGeometry(difficulty);
    default:
      return generateAddition(difficulty);
  }
}

// Generate a test with mixed questions based on user Elo (using French class system)
export function generateTest(elo: number, count: number = 20): Exercise[] {
  const questions: Exercise[] = [];
  
  // Get user's current French class based on ELO
  const currentClass = getClassFromElo(elo);
  const classIndex = FRENCH_CLASSES.indexOf(currentClass);
  
  // Determine which classes to use for questions (current class + 1 below for variety)
  const availableClasses: FrenchClass[] = [];
  if (classIndex > 0) availableClasses.push(FRENCH_CLASSES[classIndex - 1]); // One class below
  availableClasses.push(currentClass); // Current class
  if (classIndex < FRENCH_CLASSES.length - 1) availableClasses.push(FRENCH_CLASSES[classIndex + 1]); // One above
  
  // Get available operations for the current class
  const availableOperations = getFrenchClassOperations(currentClass);
  
  for (let i = 0; i < count; i++) {
    // Pick a random class from available (weighted toward current)
    const questionClass = availableClasses[Math.floor(Math.random() * availableClasses.length)];
    const questionClassIndex = FRENCH_CLASSES.indexOf(questionClass);
    
    // Convert class to difficulty (1-10 scale for internal use)
    // CP=1, CE1=2, CE2=3, CM1=4, CM2=5, 6e=6, 5e=7, 4e=8, 3e=9, 2de+=10
    const difficulty = Math.min(10, Math.max(1, questionClassIndex + 1));
    
    // Get operations for this specific class
    const classOperations = getFrenchClassOperations(questionClass);
    
    // Pick random operation
    const operation = classOperations[Math.floor(Math.random() * classOperations.length)];
    
    questions.push(generateExercise(operation, difficulty));
  }
  
  return questions;
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
      return ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'geometry', 'mental_math', 'logic'];
  }
}

// Generate evaluation test for first-time users (using French class system - starts at CP level)
export function generateEvaluationTest(count: number = 20): Exercise[] {
  const questions: Exercise[] = [];
  const operations: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
  
  for (let i = 0; i < count; i++) {
    // Progressive difficulty: starts at CP (level 1) and progresses through classes
    const classIndex = Math.min(FRENCH_CLASSES.length - 1, Math.floor(i / 3));
    const difficulty = Math.min(10, classIndex + 1);
    const operation = operations[i % 4]; // Rotate through operations
    
    questions.push(generateExercise(operation, difficulty));
  }
  
  return questions;
}

// Generate multiplayer questions with French class system
export function generateMultiplayerQuestions(
  player1Elo: number,
  player2Elo: number,
  count: number = 20
): Exercise[] {
  console.log('generateMultiplayerQuestions called with:', { player1Elo, player2Elo, count });
  
  const questions: Exercise[] = [];
  
  // Calculate average Elo and determine French class
  const avgElo = (player1Elo + player2Elo) / 2;
  const currentClass = getClassFromElo(avgElo);
  const classIndex = FRENCH_CLASSES.indexOf(currentClass);
  
  console.log('Average Elo:', avgElo, 'Class:', currentClass);
  
  // Determine which classes to use for questions
  const availableClasses: FrenchClass[] = [];
  if (classIndex > 0) availableClasses.push(FRENCH_CLASSES[classIndex - 1]);
  availableClasses.push(currentClass);
  if (classIndex < FRENCH_CLASSES.length - 1) availableClasses.push(FRENCH_CLASSES[classIndex + 1]);
  
  for (let i = 0; i < count; i++) {
    // Pick a random class from available
    const questionClass = availableClasses[Math.floor(Math.random() * availableClasses.length)];
    const questionClassIndex = FRENCH_CLASSES.indexOf(questionClass);
    
    // Convert class to difficulty
    const difficulty = Math.min(10, Math.max(1, questionClassIndex + 1));
    
    // Get operations for this class
    const classOperations = getFrenchClassOperations(questionClass);
    const operation = classOperations[Math.floor(Math.random() * classOperations.length)];
    
    console.log(`Generating question ${i}:`, { operation, difficulty, class: questionClass });
    
    try {
      const exercise = generateExercise(operation, difficulty);
      questions.push(exercise);
      console.log(`Successfully generated question ${i}`);
    } catch (error) {
      console.error(`Error generating question ${i}:`, error);
      // Fallback to addition
      const fallbackExercise = generateExercise('addition', 1);
      questions.push(fallbackExercise);
    }
  }
  
  console.log('Generated questions count:', questions.length);
  return questions;
}

// Generate a focused test on specific operation types (using French class system)
export function generateFocusedTest(
  types: OperationType[],
  difficulty: number,
  count: number = 20,
  elo: number = 600
): Exercise[] {
  const questions: Exercise[] = [];
  
  // Get user's French class based on Elo
  const userClass = getClassFromElo(elo);
  const classIndex = FRENCH_CLASSES.indexOf(userClass);
  
  // Cap difficulty based on user's class (not arbitrary difficulty numbers)
  const maxAllowedDifficulty = Math.min(10, classIndex + 2); // Allow up to 2 classes above
  const adjustedDifficulty = Math.min(difficulty, maxAllowedDifficulty);
  
  for (let i = 0; i < count; i++) {
    // Vary difficulty slightly for progression, but stay within user's capabilities
    const variedDifficulty = Math.min(maxAllowedDifficulty, Math.max(1, adjustedDifficulty + Math.floor(i / 7) - 1));
    
    // Pick random operation from specified types
    const operation = types[Math.floor(Math.random() * types.length)];
    
    questions.push(generateExercise(operation, variedDifficulty));
  }
  
  return questions;
}

// Validate answer
export function validateAnswer(exercise: Exercise, userAnswer: string): boolean {
  const normalizedUserAnswer = userAnswer.trim().replace(/\s/g, '');
  const normalizedCorrectAnswer = exercise.answer.trim().replace(/\s/g, '');
  
  return normalizedUserAnswer === normalizedCorrectAnswer;
}

// Generate percentage exercise
function generatePercentage(difficulty: number): Exercise {
  let base: number, percentage: number, answer: number;
  
  switch (difficulty) {
    case 1:
    case 2:
      base = randomInt(10, 100);
      percentage = [10, 25, 50, 75][randomInt(0, 3)];
      break;
    case 3:
    case 4:
      base = randomInt(20, 200);
      percentage = [5, 10, 20, 25, 50][randomInt(0, 4)];
      break;
    case 5:
    case 6:
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
    `Pourcentage d'augmentation de ${base} de ${percentage}%`
  ];
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'percentage',
    difficulty,
    question: `${scenarios[randomInt(0, scenarios.length - 1)]} = ?`,
    answer: answer.toString(),
    explanation: `${percentage}% de ${base} = (${base} × ${percentage}) / 100 = ${answer}`
  };
}

// Generate fraction exercise
function generateFraction(difficulty: number): Exercise {
  let num1: number, den1: number, num2: number, den2: number;
  
  switch (difficulty) {
    case 1:
    case 2:
      den1 = randomInt(2, 10);
      num1 = randomInt(1, den1 - 1);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'fraction',
        difficulty,
        question: `Convertis ${num1}/${den1} en décimal`,
        answer: (num1 / den1).toFixed(2).replace('.00', ''),
        explanation: `${num1}/${den1} = ${(num1 / den1).toFixed(2).replace('.00', '')}`
      };
    case 3:
    case 4:
      den1 = randomInt(2, 12);
      num1 = randomInt(1, den1);
      den2 = den1;
      num2 = randomInt(1, den2);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'fraction',
        difficulty,
        question: `${num1}/${den1} + ${num2}/${den2} = ? (donne le numérateur)`,
        answer: (num1 + num2).toString(),
        explanation: `${num1}/${den1} + ${num2}/${den2} = ${num1 + num2}/${den1}`
      };
    default:
      den1 = randomInt(2, 20);
      num1 = randomInt(1, den1 * 3);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'fraction',
        difficulty,
        question: `Simplifie ${num1}/${den1} au maximum (format: a/b)`,
        answer: simplifyFraction(num1, den1),
        explanation: `PGCD(${num1}, ${den1}) = ${gcd(num1, den1)}, donc ${num1}/${den1} = ${simplifyFraction(num1, den1)}`
      };
  }
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(num: number, den: number): string {
  const divisor = gcd(num, den);
  return `${num / divisor}/${den / divisor}`;
}

// Generate equation exercise (simple linear)
function generateEquation(difficulty: number): Exercise {
  let a: number, b: number, c: number, x: number;
  
  x = randomInt(1, difficulty <= 3 ? 10 : 50);
  a = randomInt(2, difficulty <= 5 ? 5 : 10);
  b = randomInt(1, 20);
  c = a * x + b;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'equation',
    difficulty,
    question: `Résous: ${a}x + ${b} = ${c}`,
    answer: x.toString(),
    explanation: `${a}x + ${b} = ${c} → ${a}x = ${c - b} → x = ${(c - b) / a}`
  };
}

// Generate mental math strategies
function generateMentalMath(difficulty: number): Exercise {
  const strategies = [
    () => {
      const base = randomInt(5, difficulty <= 5 ? 25 : 50);
      const near = base + (Math.random() > 0.5 ? 1 : -1);
      return {
        question: `${base} × ${near} = ?`,
        answer: (base * near).toString(),
        explanation: `${base} × ${near} = ${base} × ${base} ${near > base ? '+' + base : '-' + base} = ${base * base} ${near > base ? '+' + base : '-' + base} = ${base * near}`
      };
    },
    () => {
      const num = randomInt(11, 99);
      return {
        question: `${num} × 11 = ?`,
        answer: (num * 11).toString(),
        explanation: `Pour multiplier par 11: ${num} → ${num.toString()[0] || ''}${parseInt(num.toString()[0] || '0') + parseInt(num.toString()[1] || '0')}${num.toString()[1]} = ${num * 11}`
      };
    },
    () => {
      const num = randomInt(10, 99);
      return {
        question: `${num}² = ?`,
        answer: (num * num).toString(),
        explanation: `${num}² = ${num * num}`
      };
    },
    () => {
      const num = randomInt(100, 999);
      return {
        question: `${num} × 5 = ?`,
        answer: (num * 5).toString(),
        explanation: `${num} × 5 = ${num} × 10 / 2 = ${num * 10} / 2 = ${num * 5}`
      };
    }
  ];
  
  const strategy = strategies[randomInt(0, Math.min(strategies.length - 1, difficulty))];
  const result = strategy();
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'mental_math',
    difficulty,
    question: result.question,
    answer: result.answer,
    explanation: result.explanation
  };
}

// Generate logic/math puzzle
function generateLogic(difficulty: number): Exercise {
  const puzzles = [
    // Sequence completion
    () => {
      const start = randomInt(1, 10);
      const step = randomInt(2, 5);
      const seq = [start, start + step, start + step * 2, start + step * 3];
      return {
        question: `Suite: ${seq.join(', ')}, ?`,
        answer: (start + step * 4).toString(),
        explanation: `Suite arithmétique avec +${step}: ${seq.join(', ')}, ${start + step * 4}`
      };
    },
    // Find the missing number
    () => {
      const a = randomInt(2, 10);
      const b = randomInt(2, 10);
      const c = a * b;
      return {
        question: `${a} × ? = ${c}`,
        answer: b.toString(),
        explanation: `${a} × ${b} = ${c}, donc ? = ${c} / ${a} = ${b}`
      };
    },
    // Number pattern
    () => {
      const base = randomInt(2, 9);
      const pattern = [base, base * 2, base * 3, base * 4];
      return {
        question: `Motif: ${pattern.join(', ')}, ?`,
        answer: (base * 5).toString(),
        explanation: `Table de ${base}: ${pattern.join(', ')}, ${base * 5}`
      };
    }
  ];
  
  const puzzle = puzzles[randomInt(0, Math.min(puzzles.length - 1, difficulty))];
  const result = puzzle();
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'logic',
    difficulty,
    question: result.question,
    answer: result.answer,
    explanation: result.explanation
  };
}

// Generate geometry exercise (perimeter, area, volume)
function generateGeometry(difficulty: number): Exercise {
  const geometryTypes = ['perimeter', 'area', 'volume', 'angle', 'pythagore'];
  const type = geometryTypes[randomInt(0, Math.min(geometryTypes.length - 1, difficulty))];
  
  switch (type) {
    case 'perimeter': {
      // Square, rectangle, triangle, circle
      const shapes = ['carré', 'rectangle', 'triangle', 'cercle'];
      const shape = shapes[randomInt(0, Math.min(shapes.length - 1, difficulty))];
      
      if (shape === 'carré') {
        const side = randomInt(3, 5 + difficulty * 2);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Périmètre d'un carré de côté ${side} cm = ?`,
          answer: (side * 4).toString(),
          explanation: `Périmètre = 4 × côté = 4 × ${side} = ${side * 4} cm`
        };
      } else if (shape === 'rectangle') {
        const length = randomInt(5, 10 + difficulty * 2);
        const width = randomInt(3, length - 1);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Périmètre d'un rectangle de ${length} cm × ${width} cm = ?`,
          answer: (2 * (length + width)).toString(),
          explanation: `Périmètre = 2 × (longueur + largeur) = 2 × (${length} + ${width}) = ${2 * (length + width)} cm`
        };
      } else if (shape === 'triangle') {
        const a = randomInt(3, 5 + difficulty);
        const b = randomInt(3, 5 + difficulty);
        const c = randomInt(3, 5 + difficulty);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Périmètre d'un triangle de côtés ${a}, ${b}, ${c} cm = ?`,
          answer: (a + b + c).toString(),
          explanation: `Périmètre = ${a} + ${b} + ${c} = ${a + b + c} cm`
        };
      } else {
        const radius = randomInt(3, 5 + difficulty);
        const perimeter = Math.round(2 * Math.PI * radius);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Périmètre (circonférence) d'un cercle de rayon ${radius} cm (π≈3,14) = ?`,
          answer: perimeter.toString(),
          explanation: `Circonférence = 2 × π × r = 2 × 3,14 × ${radius} ≈ ${perimeter} cm`
        };
      }
    }
    
    case 'area': {
      const shapes = ['carré', 'rectangle', 'triangle', 'cercle'];
      const shape = shapes[randomInt(0, Math.min(shapes.length - 1, difficulty))];
      
      if (shape === 'carré') {
        const side = randomInt(3, 5 + difficulty * 2);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Aire d'un carré de côté ${side} cm = ?`,
          answer: (side * side).toString(),
          explanation: `Aire = côté² = ${side} × ${side} = ${side * side} cm²`
        };
      } else if (shape === 'rectangle') {
        const length = randomInt(5, 10 + difficulty * 2);
        const width = randomInt(3, length - 1);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Aire d'un rectangle de ${length} cm × ${width} cm = ?`,
          answer: (length * width).toString(),
          explanation: `Aire = longueur × largeur = ${length} × ${width} = ${length * width} cm²`
        };
      } else if (shape === 'triangle') {
        const base = randomInt(4, 8 + difficulty);
        const height = randomInt(3, 6 + difficulty);
        const area = Math.round((base * height) / 2);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Aire d'un triangle de base ${base} cm et hauteur ${height} cm = ?`,
          answer: area.toString(),
          explanation: `Aire = (base × hauteur) / 2 = (${base} × ${height}) / 2 = ${area} cm²`
        };
      } else {
        const radius = randomInt(2, 5 + difficulty);
        const area = Math.round(Math.PI * radius * radius);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Aire d'un cercle de rayon ${radius} cm (π≈3,14) = ?`,
          answer: area.toString(),
          explanation: `Aire = π × r² = 3,14 × ${radius}² ≈ ${area} cm²`
        };
      }
    }
    
    case 'volume': {
      const shapes = ['cube', 'pavé'];
      const shape = shapes[randomInt(0, Math.min(shapes.length - 1, difficulty - 3))];
      
      if (shape === 'cube') {
        const side = randomInt(3, 5 + difficulty);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Volume d'un cube d'arête ${side} cm = ?`,
          answer: (side * side * side).toString(),
          explanation: `Volume = arête³ = ${side}³ = ${side * side * side} cm³`
        };
      } else {
        const length = randomInt(5, 10 + difficulty);
        const width = randomInt(3, 6 + difficulty);
        const height = randomInt(2, 5 + difficulty);
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Volume d'un pavé de ${length}×${width}×${height} cm = ?`,
          answer: (length * width * height).toString(),
          explanation: `Volume = L × l × h = ${length} × ${width} × ${height} = ${length * width * height} cm³`
        };
      }
    }
    
    case 'angle': {
      // Simple angle calculations
      const angle1 = randomInt(30, 80);
      const angle2 = randomInt(30, 80);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'geometry',
        difficulty,
        question: `Dans un triangle, deux angles font ${angle1}° et ${angle2}°. Le troisième angle = ?`,
        answer: (180 - angle1 - angle2).toString(),
        explanation: `Somme des angles = 180°. Troisième angle = 180 - ${angle1} - ${angle2} = ${180 - angle1 - angle2}°`
      };
    }
    
    case 'pythagore': {
      // Pythagorean triples
      const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
      const triple = triples[randomInt(0, Math.min(triples.length - 1, difficulty))];
      const [a, b, c] = triple;
      const askFor = randomInt(0, 2); // 0 = hypotenuse, 1 = side a, 2 = side b
      
      if (askFor === 0) {
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Théorème de Pythagore : côtés ${a} et ${b}, hypoténuse = ?`,
          answer: c.toString(),
          explanation: `c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, donc c = ${c}`
        };
      } else {
        return {
          id: Math.random().toString(36).substring(2, 11),
          type: 'geometry',
          difficulty,
          question: `Théorème de Pythagore : hypoténuse ${c}, un côté ${a}, l'autre côté = ?`,
          answer: b.toString(),
          explanation: `b² = ${c}² - ${a}² = ${c * c} - ${a * a} = ${b * b}, donc b = ${b}`
        };
      }
    }
    
    default:
      return generateAddition(difficulty);
  }
}


export function getOperationTypesForCourse(slug: string): OperationType[] | null {
  const mapping: Record<string, OperationType[]> = {
    'addition-rapide': ['addition', 'mental_math'],
    'soustraction-efficace': ['subtraction'],
    'tables-multiplication': ['multiplication'],
    'division-mentale': ['division'],
    'carres-racines': ['power', 'root'],
    'puissances': ['power'],
    'factorisation': ['factorization'],
    'pourcentages': ['percentage'],
    'fractions': ['fraction'],
    'equations': ['equation'],
    'calcul-mental': ['mental_math'],
    'logique': ['logic'],
    'methodes-avancees': ['addition', 'subtraction', 'multiplication', 'division', 'power', 'root', 'factorization', 'percentage', 'fraction', 'equation'],
  };
  return mapping[slug] || null;
}
