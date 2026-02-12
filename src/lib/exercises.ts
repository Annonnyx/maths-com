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
  | 'logic';

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
      a = randomInt(100, 9999);
      b = randomInt(100, 9999);
      break;
    case 9:
      a = randomInt(1000, 99999);
      b = randomInt(1000, 99999);
      break;
    case 10:
      a = randomInt(10000, 999999);
      b = randomInt(10000, 999999);
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
      a = randomInt(1000, 5000);
      b = randomInt(500, a);
      break;
    case 9:
      a = randomInt(2000, 10000);
      b = randomInt(1000, a);
      break;
    case 10:
      a = randomInt(5000, 50000);
      b = randomInt(2000, a);
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
    default:
      return generateAddition(difficulty);
  }
}

// Generate a test with mixed questions based on user Elo
export function generateTest(elo: number, count: number = 20): Exercise[] {
  const questions: Exercise[] = [];
  const availableOperations = getAvailableOperations(elo);
  
  // Calculate difficulty range based on Elo
  // Low Elo (400-600): difficulty 1-3
  // Medium Elo (600-800): difficulty 3-5  
  // High Elo (800-1000): difficulty 5-7
  // Very High Elo (1000+): difficulty 7-10
  let minDifficulty, maxDifficulty;
  
  if (elo < 500) {
    minDifficulty = 1;
    maxDifficulty = 2;
  } else if (elo < 600) {
    minDifficulty = 1;
    maxDifficulty = 3;
  } else if (elo < 750) {
    minDifficulty = 2;
    maxDifficulty = 4;
  } else if (elo < 900) {
    minDifficulty = 3;
    maxDifficulty = 6;
  } else if (elo < 1100) {
    minDifficulty = 4;
    maxDifficulty = 7;
  } else if (elo < 1300) {
    minDifficulty = 5;
    maxDifficulty = 8;
  } else {
    minDifficulty = 6;
    maxDifficulty = 10;
  }
  
  for (let i = 0; i < count; i++) {
    // Progressive difficulty within the test
    const progress = i / count; // 0 to 1
    const difficultyRange = maxDifficulty - minDifficulty;
    const difficulty = Math.min(maxDifficulty, Math.floor(minDifficulty + (progress * difficultyRange * 1.5)));
    
    // Pick random operation from available ones
    const operation = availableOperations[Math.floor(Math.random() * availableOperations.length)];
    
    questions.push(generateExercise(operation, difficulty));
  }
  
  return questions;
}

// Generate evaluation test for first-time users (mix of all basic operations)
export function generateEvaluationTest(count: number = 20): Exercise[] {
  const questions: Exercise[] = [];
  const operations: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
  
  for (let i = 0; i < count; i++) {
    // Start easy and progressively get harder
    const difficulty = Math.min(10, Math.floor(i / 4) + 1);
    const operation = operations[i % 4]; // Rotate through operations
    
    questions.push(generateExercise(operation, difficulty));
  }
  
  return questions;
}

// Get available operations based on Elo
function getAvailableOperations(elo: number): OperationType[] {
  const operations: OperationType[] = ['addition', 'mental_math', 'logic'];
  
  if (elo >= 450) operations.push('subtraction');
  if (elo >= 500) operations.push('percentage');
  if (elo >= 550) operations.push('multiplication');
  if (elo >= 600) operations.push('fraction');
  if (elo >= 700) operations.push('division');
  if (elo >= 800) operations.push('equation');
  if (elo >= 900) operations.push('power');
  if (elo >= 1000) operations.push('root');
  if (elo >= 1100) operations.push('factorization');
  
  return operations;
}

// Generate multiplayer questions with adaptive difficulty
export function generateMultiplayerQuestions(
  player1Elo: number,
  player2Elo: number,
  count: number = 20
): Exercise[] {
  console.log('generateMultiplayerQuestions called with:', { player1Elo, player2Elo, count });
  
  const questions: Exercise[] = [];
  
  // Calculate average Elo for difficulty balancing
  const avgElo = (player1Elo + player2Elo) / 2;
  console.log('Average Elo:', avgElo);
  
  // Get available operations based on average Elo
  const availableOperations = getAvailableOperations(avgElo);
  console.log('Available operations:', availableOperations);
  
  // Calculate difficulty range based on average Elo
  let minDifficulty, maxDifficulty;
  
  if (avgElo < 500) {
    minDifficulty = 1;
    maxDifficulty = 2;
  } else if (avgElo < 600) {
    minDifficulty = 1;
    maxDifficulty = 3;
  } else if (avgElo < 750) {
    minDifficulty = 2;
    maxDifficulty = 4;
  } else if (avgElo < 900) {
    minDifficulty = 3;
    maxDifficulty = 6;
  } else if (avgElo < 1100) {
    minDifficulty = 4;
    maxDifficulty = 7;
  } else if (avgElo < 1300) {
    minDifficulty = 5;
    maxDifficulty = 8;
  } else {
    minDifficulty = 6;
    maxDifficulty = 10;
  }
  
  console.log('Difficulty range:', { minDifficulty, maxDifficulty });
  
  // Generate questions with progressive difficulty
  for (let i = 0; i < count; i++) {
    // Progressive difficulty within the game
    const progress = i / count; // 0 to 1
    const difficultyRange = maxDifficulty - minDifficulty;
    const difficulty = Math.min(maxDifficulty, Math.floor(minDifficulty + (progress * difficultyRange * 1.5)));
    
    // Pick random operation from available ones
    const operation = availableOperations[Math.floor(Math.random() * availableOperations.length)];
    
    console.log(`Generating question ${i}:`, { operation, difficulty });
    
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

// Generate a focused test on specific operation types
export function generateFocusedTest(
  types: OperationType[],
  difficulty: number,
  count: number = 20,
  elo: number = 600
): Exercise[] {
  const questions: Exercise[] = [];
  
  // Adjust difficulty based on Elo
  let adjustedDifficulty = difficulty;
  if (elo < 500) {
    adjustedDifficulty = Math.min(difficulty, 2); // Cap at level 2 for beginners
  } else if (elo < 600) {
    adjustedDifficulty = Math.min(difficulty, 3); // Cap at level 3 for low Elo
  } else if (elo < 750) {
    adjustedDifficulty = Math.min(difficulty, 4); // Cap at level 4 for medium-low Elo
  } else if (elo < 900) {
    adjustedDifficulty = Math.min(difficulty, 6); // Cap at level 6 for medium Elo
  } else if (elo < 1100) {
    adjustedDifficulty = Math.min(difficulty, 8); // Cap at level 8 for high Elo
  }
  // High Elo players get full difficulty
  
  for (let i = 0; i < count; i++) {
    // Vary difficulty slightly for progression
    const variedDifficulty = Math.min(10, Math.max(1, adjustedDifficulty + Math.floor(i / 7) - 1));
    
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
