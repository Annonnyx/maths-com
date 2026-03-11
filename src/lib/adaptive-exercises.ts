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
  | 'geometry'
  | 'delta'
  | 'quadratic'
  | 'pythagore'
  | 'thales'
  | 'trigonometry'
  | 'vectors'
  | 'complex_numbers'
  | 'matrices'
  | 'graphs'
  | 'integrals'
  | 'derivatives'
  | 'probabilities'
  | 'statistics';

export interface Exercise {
  id: string;
  type: OperationType;
  difficulty: number;
  question: string;
  answer: string;
  explanation?: string;
  frenchClass: string;
  topic: string;
}

export interface QuestionHistory {
  question_id: string;
  answered_at: Date;
  correct: boolean;
  elo_at_moment: number;
}

// Random number generator with constraints
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// French classes with their ELO ranges
const FRENCH_CLASSES = [
  'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'
];

const ELO_RANGES: Record<string, [number, number]> = {
  'CP': [0, 199],
  'CE1': [200, 349],
  'CE2': [350, 499],
  'CM1': [500, 649],
  'CM2': [650, 799],
  '6e': [800, 949],
  '5e': [950, 1099],
  '4e': [1100, 1299],
  '3e': [1300, 1499],
  '2de': [1500, 1699],
  '1re': [1700, 1999],
  'Tle': [2000, 2399],
  'Sup1': [2400, 2600],
  'Sup2': [2600, 2700],
  'Sup3': [2700, 2800],
  'Pro': [2800, 9999]
};

// Get French class from ELO
function getClassFromElo(elo: number): string {
  for (const [className, [min, max]] of Object.entries(ELO_RANGES)) {
    if (elo >= min && elo <= max) {
      return className;
    }
  }
  return 'CP';
}

// Curriculum mapping by French class
const CURRICULUM_BY_CLASS: Record<string, { topics: string[], operations: OperationType[] }> = {
  'CP': {
    topics: ['addition_soustraction_0_20', 'comparer_nombres', 'pair_impair', 'problemes_simples'],
    operations: ['addition', 'subtraction', 'mental_math', 'logic']
  },
  'CE1': {
    topics: ['addition_soustraction_99', 'multiplication_tables_2_5_10', 'moities_quarts', 'mesures_cm_m'],
    operations: ['addition', 'subtraction', 'multiplication', 'mental_math', 'logic']
  },
  'CE2': {
    topics: ['multiplication_tables_toutes', 'division_exacte', 'nombres_999', 'fractions_1_2_3_4', 'perimetre_rectangle_carre'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'geometry', 'mental_math', 'logic']
  },
  'CM1': {
    topics: ['multiplications_posees', 'fractions_comparer', 'decimaux_dixiemes_centiemes', 'angles', 'aire_rectangle'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'geometry', 'mental_math', 'logic']
  },
  'CM2': {
    topics: ['fractions_operations', 'proportionnalite', 'pourcentages_simples', 'volume_pave', 'symetrie_axiale'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'geometry', 'mental_math', 'logic']
  },
  '6e': {
    topics: ['nombres_relatifs', 'fractions_avancees', 'pgcd_multiples', 'repere_cartesien', 'perimetre_aire_cercle', 'probabilites_vocabulaire'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'geometry', 'mental_math', 'logic']
  },
  '5e': {
    topics: ['puissances_entieres', 'pythagore', 'triangles_proprietes', 'fractions_division', 'pourcentages_calculs', 'statistiques_moyenne'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'equation', 'power', 'geometry', 'mental_math', 'logic']
  },
  '4e': {
    topics: ['equations_premier_degre', 'developpement_factorisation', 'thales', 'fonctions_lineaires_affines', 'relatifs_multiplication', 'trigonometrie_triangle'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'equation', 'power', 'root', 'geometry', 'mental_math', 'logic']
  },
  '3e': {
    topics: ['systemes_equations', 'racines_carrees', 'fonctions_image_antecedent', 'statistiques_etendue_quartiles', 'probabilites_evenements', 'pythagore_reciproque'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'equation', 'power', 'root', 'geometry', 'mental_math', 'logic']
  },
  '2de': {
    topics: ['fonctions_reference', 'vecteurs', 'trigonometrie_cercle', 'ensembles_nombres', 'equations_second_degre', 'statistiques_variance'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'equation', 'power', 'root', 'factorization', 'geometry', 'delta', 'quadratic', 'mental_math', 'logic']
  },
  '1re': {
    topics: ['derivation', 'suites', 'trinome_second_degre', 'loi_binomiale', 'probabilites_conditionnelles', 'geometrie_espace'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'equation', 'power', 'root', 'factorization', 'geometry', 'delta', 'quadratic', 'derivatives', 'mental_math', 'logic']
  },
  'Tle': {
    topics: ['calcul_integral', 'logarithme_exponentielle', 'equations_differentielles', 'limites', 'probabilites_continues', 'geometrie_espace_avancee'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'equation', 'power', 'root', 'factorization', 'geometry', 'delta', 'quadratic', 'integrals', 'derivatives', 'mental_math', 'logic']
  },
  'Sup1': {
    topics: ['nombres_complexes', 'equations_polynomiales', 'arithmetique', 'matrices', 'graphes'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'equation', 'power', 'root', 'factorization', 'complex_numbers', 'matrices', 'graphs', 'mental_math', 'logic']
  },
  'Sup2': {
    topics: ['combinatoire_avancee', 'series_numeriques', 'espaces_vectoriels', 'calcul_differentiel_multiple', 'probabilites_avancees'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'equation', 'power', 'root', 'factorization', 'complex_numbers', 'matrices', 'graphs', 'integrals', 'derivatives', 'mental_math', 'logic']
  },
  'Sup3': {
    topics: ['combinatoire_avancee', 'series_numeriques', 'espaces_vectoriels', 'calcul_differentiel_multiple', 'probabilites_avancees'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'equation', 'power', 'root', 'factorization', 'complex_numbers', 'matrices', 'graphs', 'integrals', 'derivatives', 'mental_math', 'logic']
  },
  'Pro': {
    topics: ['combinatoire_avancee', 'series_numeriques', 'espaces_vectoriels', 'calcul_differentiel_multiple', 'probabilites_avancees'],
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'percentage', 'equation', 'power', 'root', 'factorization', 'complex_numbers', 'matrices', 'graphs', 'integrals', 'derivatives', 'mental_math', 'logic']
  }
};

// Exercise generators by operation and class
function generateExerciseForClass(operation: OperationType, frenchClass: string): Exercise {
  const classIndex = FRENCH_CLASSES.indexOf(frenchClass);
  const difficulty = Math.min(10, Math.max(1, classIndex + 1));
  
  switch (operation) {
    case 'addition':
      return generateAddition(frenchClass);
    case 'subtraction':
      return generateSubtraction(frenchClass);
    case 'multiplication':
      return generateMultiplication(frenchClass);
    case 'division':
      return generateDivision(frenchClass);
    case 'power':
      return generatePower(frenchClass);
    case 'root':
      return generateRoot(frenchClass);
    case 'fraction':
      return generateFraction(frenchClass);
    case 'percentage':
      return generatePercentage(frenchClass);
    case 'equation':
      return generateEquation(frenchClass);
    case 'geometry':
      return generateGeometry(frenchClass);
    case 'mental_math':
      return generateMentalMath(frenchClass);
    case 'logic':
      return generateLogic(frenchClass);
    case 'delta':
      return generateDelta(frenchClass);
    case 'quadratic':
      return generateQuadratic(frenchClass);
    case 'derivatives':
      return generateDerivatives(frenchClass);
    case 'integrals':
      return generateIntegrals(frenchClass);
    case 'complex_numbers':
      return generateComplexNumbers(frenchClass);
    case 'matrices':
      return generateMatrices(frenchClass);
    case 'graphs':
      return generateGraphs(frenchClass);
    default:
      return generateAddition(frenchClass);
  }
}

// Generate addition based on French class curriculum
function generateAddition(frenchClass: string): Exercise {
  let a: number, b: number;
  
  switch (frenchClass) {
    case 'CP': // 0-20
      a = randomInt(1, 10);
      b = randomInt(1, 10);
      break;
    case 'CE1': // jusqu'à 99
      a = randomInt(10, 50);
      b = randomInt(10, 49);
      break;
    case 'CE2': // jusqu'à 99
      a = randomInt(20, 80);
      b = randomInt(10, 79);
      break;
    case 'CM1': // nombres jusqu'à 999
      a = randomInt(100, 500);
      b = randomInt(100, 400);
      break;
    case 'CM2': // nombres jusqu'à 999
      a = randomInt(200, 800);
      b = randomInt(100, 700);
      break;
    case '6e': // nombres relatifs
      a = randomInt(-100, 100);
      b = randomInt(-100, 100);
      break;
    case '5e': // nombres relatifs
      a = randomInt(-500, 500);
      b = randomInt(-500, 500);
      break;
    case '4e': // nombres relatifs
      a = randomInt(-1000, 1000);
      b = randomInt(-1000, 1000);
      break;
    case '3e': // nombres relatifs
      a = randomInt(-2000, 2000);
      b = randomInt(-2000, 2000);
      break;
    default: // lycée et supérieur
      a = randomInt(-10000, 10000);
      b = randomInt(-10000, 10000);
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'addition',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `${a} + ${b} = ?`,
    answer: (a + b).toString(),
    explanation: `${a} + ${b} = ${a + b}`,
    frenchClass,
    topic: 'addition'
  };
}

// Generate subtraction based on French class curriculum
function generateSubtraction(frenchClass: string): Exercise {
  let a: number, b: number;
  
  switch (frenchClass) {
    case 'CP': // 0-20
      a = randomInt(5, 20);
      b = randomInt(1, Math.min(a, 10));
      break;
    case 'CE1': // jusqu'à 99
      a = randomInt(20, 99);
      b = randomInt(1, Math.min(a, 50));
      break;
    case 'CE2': // jusqu'à 99
      a = randomInt(30, 99);
      b = randomInt(1, Math.min(a, 70));
      break;
    case 'CM1': // nombres jusqu'à 999
      a = randomInt(200, 999);
      b = randomInt(1, Math.min(a, 500));
      break;
    case 'CM2': // nombres jusqu'à 999
      a = randomInt(300, 999);
      b = randomInt(1, Math.min(a, 600));
      break;
    case '6e': // nombres relatifs
      a = randomInt(-100, 100);
      b = randomInt(-100, 100);
      break;
    case '5e': // nombres relatifs
      a = randomInt(-500, 500);
      b = randomInt(-500, 500);
      break;
    case '4e': // nombres relatifs
      a = randomInt(-1000, 1000);
      b = randomInt(-1000, 1000);
      break;
    case '3e': // nombres relatifs
      a = randomInt(-2000, 2000);
      b = randomInt(-2000, 2000);
      break;
    default: // lycée et supérieur
      a = randomInt(-10000, 10000);
      b = randomInt(-10000, 10000);
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'subtraction',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `${a} - ${b} = ?`,
    answer: (a - b).toString(),
    explanation: `${a} - ${b} = ${a - b}`,
    frenchClass,
    topic: 'soustraction'
  };
}

// Generate multiplication based on French class curriculum
function generateMultiplication(frenchClass: string): Exercise {
  let a: number, b: number;
  
  switch (frenchClass) {
    case 'CP': // tables 2-5
      a = randomInt(2, 5);
      b = randomInt(1, 5);
      break;
    case 'CE1': // tables 2, 5, 10
      const tables = [2, 5, 10];
      a = tables[randomInt(0, 2)];
      b = randomInt(1, 10);
      break;
    case 'CE2': // toutes les tables jusqu'à 9
      a = randomInt(2, 9);
      b = randomInt(2, 9);
      break;
    case 'CM1': // toutes les tables, multiplications posées
      a = randomInt(10, 50);
      b = randomInt(10, 20);
      break;
    case 'CM2': // multiplications plus complexes
      a = randomInt(20, 100);
      b = randomInt(10, 30);
      break;
    case '6e': // nombres relatifs
      a = randomInt(-50, 50);
      b = randomInt(-20, 20);
      break;
    case '5e': // nombres relatifs
      a = randomInt(-100, 100);
      b = randomInt(-50, 50);
      break;
    case '4e': // nombres relatifs
      a = randomInt(-200, 200);
      b = randomInt(-100, 100);
      break;
    case '3e': // nombres relatifs
      a = randomInt(-500, 500);
      b = randomInt(-200, 200);
      break;
    default: // lycée et supérieur
      a = randomInt(-1000, 1000);
      b = randomInt(-1000, 1000);
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'multiplication',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `${a} × ${b} = ?`,
    answer: (a * b).toString(),
    explanation: `${a} × ${b} = ${a * b}`,
    frenchClass,
    topic: 'multiplication'
  };
}

// Generate division based on French class curriculum
function generateDivision(frenchClass: string): Exercise {
  let result: number, divisor: number, dividend: number;
  
  switch (frenchClass) {
    case 'CP': // très basique
      result = randomInt(1, 5);
      divisor = randomInt(2, 5);
      break;
    case 'CE1': // petits nombres
      result = randomInt(1, 10);
      divisor = randomInt(2, 10);
      break;
    case 'CE2': // division exacte simple
      result = randomInt(2, 12);
      divisor = randomInt(2, 12);
      break;
    case 'CM1': // Tables 2-9 seulement, divisions exactes uniquement
      result = randomInt(2, 9);
      divisor = randomInt(2, 9);
      break;
    case 'CM2': // plus complexe
      result = randomInt(10, 100);
      divisor = randomInt(5, 30);
      break;
    case '6e': // nombres relatifs
      result = randomInt(-50, 50);
      divisor = randomInt(-20, 20);
      break;
    case '5e': // nombres relatifs
      result = randomInt(-100, 100);
      divisor = randomInt(-50, 50);
      break;
    case '4e': // nombres relatifs
      result = randomInt(-200, 200);
      divisor = randomInt(-100, 100);
      break;
    case '3e': // nombres relatifs
      result = randomInt(-500, 500);
      divisor = randomInt(-200, 200);
      break;
    default: // lycée et supérieur
      result = randomInt(-1000, 1000);
      divisor = randomInt(-1000, 1000);
  }
  
  dividend = result * divisor;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'division',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `${dividend} ÷ ${divisor} = ?`,
    answer: result.toString(),
    explanation: `${dividend} ÷ ${divisor} = ${result} car ${result} × ${divisor} = ${dividend}`,
    frenchClass,
    topic: 'division'
  };
}

// Generate power exercise based on French class curriculum
function generatePower(frenchClass: string): Exercise {
  let base: number, exponent: number;
  
  switch (frenchClass) {
    case '5e': // puissances entières a², a³, 10ⁿ
      base = randomInt(2, 15);
      exponent = randomInt(2, 3);
      break;
    case '4e': // puissances entières
      base = randomInt(2, 20);
      exponent = randomInt(2, 4);
      break;
    case '3e': // puissances entières
      base = randomInt(2, 25);
      exponent = randomInt(2, 5);
      break;
    case '2de': // puissances entières
      base = randomInt(2, 30);
      exponent = randomInt(2, 6);
      break;
    case '1re': // puissances entières
      base = randomInt(2, 50);
      exponent = randomInt(2, 7);
      break;
    case 'Tle': // puissances entières
      base = randomInt(2, 100);
      exponent = randomInt(2, 8);
      break;
    default: // supérieur
      base = randomInt(2, 100);
      exponent = randomInt(2, 10);
  }
  
  const result = Math.pow(base, exponent);
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'power',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `${base}^${exponent} = ?`,
    answer: result.toString(),
    explanation: `${base}^${exponent} = ${base} multiplié ${exponent} fois par lui-même = ${result}`,
    frenchClass,
    topic: 'puissances'
  };
}

// Generate root exercise based on French class curriculum
function generateRoot(frenchClass: string): Exercise {
  let result: number, radicand: number;
  
  switch (frenchClass) {
    case '4e': // racines carrées simples
      result = randomInt(2, 15);
      break;
    case '3e': // racines carrées
      result = randomInt(5, 25);
      break;
    case '2de': // racines carrées
      result = randomInt(10, 50);
      break;
    case '1re': // racines carrées
      result = randomInt(20, 100);
      break;
    case 'Tle': // racines carrées
      result = randomInt(50, 200);
      break;
    default: // supérieur
      result = randomInt(100, 500);
  }
  
  radicand = result * result;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'root',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `√${radicand} = ?`,
    answer: result.toString(),
    explanation: `√${radicand} = ${result} car ${result}² = ${radicand}`,
    frenchClass,
    topic: 'racines_carrees'
  };
}

// Generate fraction exercise based on French class curriculum
function generateFraction(frenchClass: string): Exercise {
  switch (frenchClass) {
    case 'CM2': // fractions simples
      const den1 = randomInt(2, 10);
      const num1 = randomInt(1, den1 - 1);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'fraction',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Convertis ${num1}/${den1} en décimal`,
        answer: (num1 / den1).toFixed(2).replace('.00', ''),
        explanation: `${num1}/${den1} = ${(num1 / den1).toFixed(2).replace('.00', '')}`,
        frenchClass,
        topic: 'fractions_simples'
      };
    case '6e': // fractions avancées
      const den2 = randomInt(2, 12);
      const num2 = randomInt(1, den2);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'fraction',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Simplifie ${num2 * 2}/${den2 * 2}`,
        answer: `${num2}/${den2}`,
        explanation: `${num2 * 2}/${den2 * 2} = ${num2}/${den2} (divisé par 2)`,
        frenchClass,
        topic: 'fractions_simplification'
      };
    case '5e': // fractions division
      const num3 = randomInt(2, 10);
      const den3 = randomInt(2, 10);
      const num4 = randomInt(2, 10);
      const den4 = randomInt(2, 10);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'fraction',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `${num3}/${den3} ÷ ${num4}/${den4} = ?`,
        answer: `${num3 * den4}/${den3 * num4}`,
        explanation: `${num3}/${den3} ÷ ${num4}/${den4} = ${num3}/${den3} × ${den4}/${num4} = ${num3 * den4}/${den3 * num4}`,
        frenchClass,
        topic: 'fractions_division'
      };
    default: // lycée et supérieur
      const num5 = randomInt(1, 20);
      const den5 = randomInt(2, 20);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'fraction',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Calcule ${num5}/${den5} en décimal (arrondi à 0,01)`,
        answer: (num5 / den5).toFixed(2),
        explanation: `${num5}/${den5} ≈ ${(num5 / den5).toFixed(2)}`,
        frenchClass,
        topic: 'fractions_decimales'
      };
  }
}

// Generate percentage exercise based on French class curriculum
function generatePercentage(frenchClass: string): Exercise {
  let base: number, percentage: number, answer: number;
  
  switch (frenchClass) {
    case 'CM1': // pourcentages simples
      base = randomInt(10, 100);
      percentage = [10, 25, 50, 75][randomInt(0, 3)];
      break;
    case 'CM2': // pourcentages simples
      base = randomInt(20, 200);
      percentage = [5, 10, 20, 25, 50][randomInt(0, 4)];
      break;
    case '6e': // pourcentages
      base = randomInt(50, 500);
      percentage = randomInt(1, 20) * 5;
      break;
    case '5e': // calcul de taux, augmentation/diminution
      base = randomInt(100, 1000);
      percentage = randomInt(1, 50);
      break;
    default: // lycée et supérieur
      base = randomInt(100, 5000);
      percentage = randomInt(1, 99);
  }
  
  answer = Math.round((base * percentage) / 100);
  
  const scenarios = [
    `${percentage}% de ${base}`,
    `Augmentation de ${percentage}% sur ${base}`,
    `Réduction de ${percentage}% sur ${base}`
  ];
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'percentage',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `${scenarios[randomInt(0, scenarios.length - 1)]} = ?`,
    answer: answer.toString(),
    explanation: `${percentage}% de ${base} = (${base} × ${percentage}) / 100 = ${answer}`,
    frenchClass,
    topic: 'pourcentages'
  };
}

// Generate equation exercise based on French class curriculum
function generateEquation(frenchClass: string): Exercise {
  let a: number, b: number, c: number, x: number;
  
  switch (frenchClass) {
    case '5e': // équations 1er degré simples
      x = randomInt(1, 20);
      a = randomInt(2, 5);
      b = randomInt(1, 50);
      c = a * x + b;
      break;
    case '4e': // équations 1er degré
      x = randomInt(1, 50);
      a = randomInt(2, 10);
      b = randomInt(-50, 50);
      c = a * x + b;
      break;
    case '3e': // systèmes d'équations
      const x1 = randomInt(1, 20);
      const y1 = randomInt(1, 20);
      const a1 = randomInt(2, 5);
      const b1 = randomInt(2, 5);
      const c1 = a1 * x1 + b1 * y1;
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'equation',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Résous le système: ${a1}x + ${b1}y = ${c1}, x = ${x1}`,
        answer: y1.toString(),
        explanation: `Si x = ${x1}, alors ${a1}×${x1} + ${b1}y = ${c1} → ${a1 * x1} + ${b1}y = ${c1} → ${b1}y = ${c1 - a1 * x1} → y = ${y1}`,
        frenchClass,
        topic: 'systemes_equations'
      };
    case '2de': // équations second degré sans discriminant
      const a2 = randomInt(1, 3);
      const b2 = randomInt(-10, 10);
      const c2 = randomInt(-10, 10);
      const x2 = randomInt(1, 5);
      const result2 = a2 * x2 * x2 + b2 * x2 + c2;
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'equation',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Calcule ${a2}x² + ${b2}x + ${c2} pour x = ${x2}`,
        answer: result2.toString(),
        explanation: `${a2}×${x2}² + ${b2}×${x2} + ${c2} = ${a2 * x2 * x2} + ${b2 * x2} + ${c2} = ${result2}`,
        frenchClass,
        topic: 'equations_second_degre'
      };
    default: // lycée et supérieur
      x = randomInt(1, 100);
      a = randomInt(2, 20);
      b = randomInt(-100, 100);
      c = a * x + b;
  }
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'equation',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `Résous: ${a}x + ${b} = ${c}`,
    answer: x.toString(),
    explanation: `${a}x + ${b} = ${c} → ${a}x = ${c - b} → x = ${(c - b) / a}`,
    frenchClass,
    topic: 'equations_premier_degre'
  };
}

// Generate geometry exercise based on French class curriculum
function generateGeometry(frenchClass: string): Exercise {
  switch (frenchClass) {
    case 'CE2': // périmètre rectangle et carré
      const side = randomInt(3, 10);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'geometry',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Périmètre d'un carré de côté ${side} cm = ?`,
        answer: (side * 4).toString(),
        explanation: `Pense à la formule du périmètre pour un carré`,
        frenchClass,
        topic: 'perimetre_carre'
      };
    case 'CM1': // aire rectangle
      const length = randomInt(5, 15);
      const width = randomInt(3, 10);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'geometry',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Aire d'un rectangle de ${length} cm × ${width} cm = ?`,
        answer: (length * width).toString(),
        explanation: `Pense à la formule de l'aire d'un rectangle`,
        frenchClass,
        topic: 'aire_rectangle'
      };
    case 'CM2': // volume pavé droit
      const l = randomInt(3, 10);
      const w = randomInt(2, 8);
      const h = randomInt(2, 6);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'geometry',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Volume d'un pavé droit de ${l}×${w}×${h} cm = ?`,
        answer: (l * w * h).toString(),
        explanation: `Pense à la formule du volume d'un pavé droit`,
        frenchClass,
        topic: 'volume_pave'
      };
    case '6e': // périmètre/aire cercle
      const radius = randomInt(3, 10);
      const perimeter = Math.round(2 * Math.PI * radius);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'geometry',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Circonférence d'un cercle de rayon ${radius} cm (π≈3,14) = ?`,
        answer: perimeter.toString(),
        explanation: `Circonférence = 2 × π × rayon = 2 × 3,14 × ${radius} ≈ ${perimeter} cm`,
        frenchClass,
        topic: 'perimetre_cercle'
      };
    case '5e': // Pythagore
      const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]];
      const triple = triples[randomInt(0, triples.length - 1)];
      const [a, b, c] = triple;
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'geometry',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Triangle rectangle : côtés ${a} et ${b}, hypoténuse = ?`,
        answer: c.toString(),
        explanation: `Théorème de Pythagore : c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, donc c = ${c}`,
        frenchClass,
        topic: 'pythagore'
      };
    case '4e': // Thalès
      const ratio = randomInt(2, 5);
      const base1 = randomInt(10, 20);
      const base2 = base1 * ratio;
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'geometry',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Configuration de Thalès : petit côté ${base1}, grand côté ${base2}, rapport = ?`,
        answer: ratio.toString(),
        explanation: `Rapport = grand côté / petit côté = ${base2} / ${base1} = ${ratio}`,
        frenchClass,
        topic: 'thales'
      };
    case '3e': // trigonométrie triangle rectangle
      const angle = randomInt(30, 60);
      const opposite = randomInt(3, 10);
      const hypotenuse = Math.round(opposite / Math.sin(angle * Math.PI / 180));
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'geometry',
        difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
        question: `Triangle rectangle : angle ${angle}°, côté opposé ${opposite}, hypoténuse = ?`,
        answer: hypotenuse.toString(),
        explanation: `sin(${angle}°) = opposé / hypoténuse → hypoténuse = opposé / sin(${angle}°) ≈ ${opposite} / ${Math.sin(angle * Math.PI / 180).toFixed(2)} ≈ ${hypotenuse}`,
        frenchClass,
        topic: 'trigonometrie_triangle'
      };
    default: // lycée et supérieur
      return generateAddition(frenchClass); // fallback
  }
}

// Generate mental math exercise
function generateMentalMath(frenchClass: string): Exercise {
  const strategies = [
    () => {
      const base = randomInt(5, 20);
      const near = base + (Math.random() > 0.5 ? 1 : -1);
      return {
        question: `${base} × ${near} = ?`,
        answer: (base * near).toString(),
        explanation: `${base} × ${near} = ${base * near}`
      };
    },
    () => {
      const num = randomInt(11, 99);
      return {
        question: `${num} × 11 = ?`,
        answer: (num * 11).toString(),
        explanation: `${num} × 11 = ${num * 11}`
      };
    },
    () => {
      const num = randomInt(10, 30);
      return {
        question: `${num}² = ?`,
        answer: (num * num).toString(),
        explanation: `${num}² = ${num * num}`
      };
    }
  ];
  
  const strategy = strategies[randomInt(0, strategies.length - 1)];
  const result = strategy();
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'mental_math',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: result.question,
    answer: result.answer,
    explanation: result.explanation,
    frenchClass,
    topic: 'calcul_mental'
  };
}

// Generate logic exercise
function generateLogic(frenchClass: string): Exercise {
  const puzzles = [
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
    () => {
      const a = randomInt(2, 10);
      const b = randomInt(2, 10);
      const c = a * b;
      return {
        question: `${a} × ? = ${c}`,
        answer: b.toString(),
        explanation: `Pour trouver le nombre manquant, on divise ${c} par ${a}: ${c} ÷ ${a} = ${b}`
      };
    }
  ];
  
  const puzzle = puzzles[randomInt(0, puzzles.length - 1)];
  const result = puzzle();
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'logic',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: result.question,
    answer: result.answer,
    explanation: result.explanation,
    frenchClass,
    topic: 'logique'
  };
}

// Generate delta exercise (discriminant)
function generateDelta(frenchClass: string): Exercise {
  const a = randomInt(1, 5);
  const b = randomInt(-10, 10);
  const c = randomInt(-10, 10);
  const delta = b * b - 4 * a * c;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'delta',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `Calcule le discriminant de l'équation ${a}x² + ${b}x + ${c} = 0`,
    answer: delta.toString(),
    explanation: `Δ = b² - 4ac = (${b})² - 4×${a}×${c} = ${b * b} - ${4 * a * c} = ${delta}`,
    frenchClass,
    topic: 'discriminant'
  };
}

// Generate quadratic exercise
function generateQuadratic(frenchClass: string): Exercise {
  const a = randomInt(1, 3);
  const b = randomInt(-5, 5);
  const c = randomInt(-5, 5);
  const x = randomInt(1, 5);
  const result = a * x * x + b * x + c;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'quadratic',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `Calcule ${a}x² + ${b}x + ${c} pour x = ${x}`,
    answer: result.toString(),
    explanation: `${a}×${x}² + ${b}×${x} + ${c} = ${a * x * x} + ${b * x} + ${c} = ${result}`,
    frenchClass,
    topic: 'trinome_second_degre'
  };
}

// Generate derivatives exercise
function generateDerivatives(frenchClass: string): Exercise {
  const functions = [
    { func: 'x²', derivative: '2x', value: (x: number) => 2 * x },
    { func: 'x³', derivative: '3x²', value: (x: number) => 3 * x * x },
    { func: '2x + 1', derivative: '2', value: (x: number) => 2 },
    { func: 'x² + 3x - 2', derivative: '2x + 3', value: (x: number) => 2 * x + 3 }
  ];
  
  const selected = functions[randomInt(0, functions.length - 1)];
  const x = randomInt(1, 5);
  const result = selected.value(x);
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'derivatives',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `Calcule la dérivée de f(x) = ${selected.func} pour x = ${x}`,
    answer: result.toString(),
    explanation: `f'(x) = ${selected.derivative}, donc f'(${x}) = ${result}`,
    frenchClass,
    topic: 'derivation'
  };
}

// Generate integrals exercise
function generateIntegrals(frenchClass: string): Exercise {
  const functions = [
    { func: '2x', integral: 'x²', value: (a: number, b: number) => b * b - a * a },
    { func: '3x²', integral: 'x³', value: (a: number, b: number) => b * b * b - a * a * a },
    { func: '1', integral: 'x', value: (a: number, b: number) => b - a }
  ];
  
  const selected = functions[randomInt(0, functions.length - 1)];
  const a = randomInt(0, 3);
  const b = randomInt(4, 8);
  const result = selected.value(a, b);
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'integrals',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `Calcule ∫[${a}, ${b}] ${selected.func} dx`,
    answer: result.toString(),
    explanation: `∫ ${selected.func} dx = ${selected.integral}, donc ∫[${a}, ${b}] = ${selected.integral}|[${a}, ${b}] = ${result}`,
    frenchClass,
    topic: 'calcul_integral'
  };
}

// Generate complex numbers exercise
function generateComplexNumbers(frenchClass: string): Exercise {
  const a = randomInt(-5, 5);
  const b = randomInt(-5, 5);
  const c = randomInt(-5, 5);
  const d = randomInt(-5, 5);
  
  // Multiplication of complex numbers
  const real = a * c - b * d;
  const imag = a * d + b * c;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'complex_numbers',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `Calcule (${a} + ${b}i) × (${c} + ${d}i)`,
    answer: `${real} + ${imag}i`,
    explanation: `(${a} + ${b}i) × (${c} + ${d}i) = ${a * c} + ${a * d}i + ${b * c}i + ${b * d}i² = ${real} + ${imag}i`,
    frenchClass,
    topic: 'nombres_complexes'
  };
}

// Generate matrices exercise
function generateMatrices(frenchClass: string): Exercise {
  const a = randomInt(1, 5);
  const b = randomInt(1, 5);
  const c = randomInt(1, 5);
  const d = randomInt(1, 5);
  
  // Determinant of 2x2 matrix
  const det = a * d - b * c;
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'matrices',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `Calcule le déterminant de [[${a}, ${b}], [${c}, ${d}]]`,
    answer: det.toString(),
    explanation: `det = ${a}×${d} - ${b}×${c} = ${a * d} - ${b * c} = ${det}`,
    frenchClass,
    topic: 'matrices'
  };
}

// Generate graphs exercise
function generateGraphs(frenchClass: string): Exercise {
  const vertices = randomInt(3, 6);
  const edges = randomInt(2, vertices * (vertices - 1) / 2);
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    type: 'graphs',
    difficulty: FRENCH_CLASSES.indexOf(frenchClass) + 1,
    question: `Un graphe a ${vertices} sommets et ${edges} arêtes. Quel est le nombre maximum d'arêtes possibles ?`,
    answer: (vertices * (vertices - 1) / 2).toString(),
    explanation: `Nombre maximum d'arêtes = n(n-1)/2 = ${vertices}×${vertices - 1}/2 = ${vertices * (vertices - 1) / 2}`,
    frenchClass,
    topic: 'graphes'
  };
}

// Main adaptive question generation function
export function generateAdaptiveQuestion(
  currentElo: number,
  questionHistory: QuestionHistory[] = [],
  recentPerformance: { correct: boolean; time: number }[] = []
): Exercise {
  // Determine user's French class
  const currentClass = getClassFromElo(currentElo);
  const classIndex = FRENCH_CLASSES.indexOf(currentClass);
  
  // Determine target difficulty based on recent performance
  let targetClassIndex = classIndex;
  
  // Adjust based on recent performance
  if (recentPerformance.length >= 3) {
    const recentCorrect = recentPerformance.slice(-3).filter(p => p.correct).length;
    if (recentCorrect === 3) {
      // All correct, move up
      targetClassIndex = Math.min(FRENCH_CLASSES.length - 1, classIndex + 1);
    } else if (recentCorrect === 0) {
      // All wrong, move down
      targetClassIndex = Math.max(0, classIndex - 1);
    }
  }
  
  // Weighted selection: 60% current level, 30% above, 10% below
  const weights = [0.1, 0.6, 0.3]; // below, current, above
  const possibleIndices = [
    Math.max(0, targetClassIndex - 1),
    targetClassIndex,
    Math.min(FRENCH_CLASSES.length - 1, targetClassIndex + 1)
  ];
  
  const random = Math.random();
  let selectedIndex = targetClassIndex;
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      selectedIndex = possibleIndices[i];
      break;
    }
  }
  
  const selectedClass = FRENCH_CLASSES[selectedIndex];
  const curriculum = CURRICULUM_BY_CLASS[selectedClass];
  
  // Pick random operation from curriculum
  const operation = curriculum.operations[randomInt(0, curriculum.operations.length - 1)];
  
  // Add variety: 15% chance for multi-ops, parentheses, or word problems (CE1 and above)
  const varietyRoll = Math.random();
  if (classIndex >= 1 && varietyRoll < 0.15) {
    const varietyType = Math.floor(Math.random() * 3);
    if (varietyType === 0 && classIndex >= 2) {
      return generateMultiOperations(selectedClass);
    } else if (varietyType === 1 && classIndex >= 3) {
      return generateParentheses(selectedClass);
    } else {
      return generateWordProblem(selectedClass);
    }
  }
  
  // Generate exercise
  let exercise = generateExerciseForClass(operation, selectedClass);
  
  // Check if question was recently seen (last 20 questions)
  const recentQuestionIds = questionHistory.slice(-20).map(h => h.question_id);
  let attempts = 0;
  while (recentQuestionIds.includes(exercise.id) && attempts < 10) {
    exercise = generateExerciseForClass(operation, selectedClass);
    attempts++;
  }
  
  return exercise;
}

// Generate test with multiple adaptive questions
export function generateAdaptiveTest(
  currentElo: number,
  count: number = 20,
  questionHistory: QuestionHistory[] = []
): Exercise[] {
  const questions: Exercise[] = [];
  const performance: { correct: boolean; time: number }[] = [];
  
  for (let i = 0; i < count; i++) {
    const question = generateAdaptiveQuestion(currentElo, questionHistory, performance);
    questions.push(question);
    
    // Simulate performance for next question (in real usage, this would come from actual answers)
    // For now, assume 70% correct with random timing
    performance.push({
      correct: Math.random() > 0.3,
      time: randomInt(5, 30)
    });
  }
  
  return questions;
}

// Validate answer
export function validateAnswer(exercise: Exercise, userAnswer: string): boolean {
  const normalizedUserAnswer = userAnswer.trim().replace(/\s/g, '');
  const normalizedCorrectAnswer = exercise.answer.trim().replace(/\s/g, '');
  
  // Pour les réponses numériques, normaliser en supprimant les zéros superflus
  // et en gérant les décimales
  const isNumericAnswer = !isNaN(parseFloat(normalizedUserAnswer)) && !isNaN(parseFloat(normalizedCorrectAnswer));
  
  if (isNumericAnswer) {
    const userNum = parseFloat(normalizedUserAnswer);
    const correctNum = parseFloat(normalizedCorrectAnswer);
    
    // Comparaison numérique avec tolérance pour les décimales
    return Math.abs(userNum - correctNum) < 0.0001;
  }
  
  return normalizedUserAnswer === normalizedCorrectAnswer;
}

// Calculate ELO change based on performance
export function calculateEloChange(
  currentElo: number,
  questionDifficulty: number,
  correct: boolean,
  responseTime: number
): number {
  const baseChange = correct ? 25 : -15;
  const timeBonus = correct && responseTime < 10 ? 10 : 0;
  const difficultyBonus = questionDifficulty > 7 ? 5 : 0;
  
  return baseChange + timeBonus + difficultyBonus;
}

// Generate multi-operations exercise (e.g., 6 + 3 + 76 - 24)
function generateMultiOperations(frenchClass: string): Exercise {
  const classIndex = FRENCH_CLASSES.indexOf(frenchClass);
  let a: number, b: number, c: number, d: number, ops: string[], answer: number;
  
  switch (frenchClass) {
    case 'CP':
    case 'CE1':
      a = randomInt(1, 10);
      b = randomInt(1, 10);
      c = randomInt(1, 10);
      ops = ['+', '-'];
      answer = a + b - c;
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'mental_math',
        difficulty: classIndex + 1,
        question: `${a} ${ops[0]} ${b} ${ops[1]} ${c} = ?`,
        answer: answer.toString(),
        explanation: `${a} + ${b} - ${c} = ${a + b} - ${c} = ${answer}`,
        frenchClass,
        topic: 'calcul_enchaine'
      };
    case 'CE2':
    case 'CM1':
      a = randomInt(1, 20);
      b = randomInt(1, 20);
      c = randomInt(1, 20);
      ops = ['+', '+', '-'];
      answer = a + b + c - randomInt(5, 15);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'mental_math',
        difficulty: classIndex + 1,
        question: `${a} + ${b} + ${c} - ${a + b + c - answer} = ?`,
        answer: answer.toString(),
        explanation: `${a} + ${b} + ${c} - ${a + b + c - answer} = ${a + b + c} - ${a + b + c - answer} = ${answer}`,
        frenchClass,
        topic: 'calcul_enchaine'
      };
    default:
      a = randomInt(10, 100);
      b = randomInt(10, 50);
      c = randomInt(10, 50);
      d = randomInt(5, 30);
      answer = a + b + c - d;
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'mental_math',
        difficulty: classIndex + 1,
        question: `${a} + ${b} + ${c} - ${d} = ?`,
        answer: answer.toString(),
        explanation: `${a} + ${b} + ${c} - ${d} = ${a + b + c} - ${d} = ${answer}`,
        frenchClass,
        topic: 'calcul_enchaine'
      };
  }
}

// Generate parentheses exercise (e.g., 5 × (45 - 12))
function generateParentheses(frenchClass: string): Exercise {
  const classIndex = FRENCH_CLASSES.indexOf(frenchClass);
  let a: number, b: number, c: number, answer: number;
  
  switch (frenchClass) {
    case 'CM1':
    case 'CM2':
      a = randomInt(2, 9);
      b = randomInt(10, 50);
      c = randomInt(1, 20);
      answer = a * (b - c);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'mental_math',
        difficulty: classIndex + 1,
        question: `${a} × (${b} - ${c}) = ?`,
        answer: answer.toString(),
        explanation: `${a} × (${b} - ${c}) = ${a} × ${b - c} = ${answer}`,
        frenchClass,
        topic: 'parentheses'
      };
    default:
      a = randomInt(2, 12);
      b = randomInt(20, 100);
      c = randomInt(5, 30);
      answer = a * (b + c);
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'mental_math',
        difficulty: classIndex + 1,
        question: `${a} × (${b} + ${c}) = ?`,
        answer: answer.toString(),
        explanation: `${a} × (${b} + ${c}) = ${a} × ${b + c} = ${answer}`,
        frenchClass,
        topic: 'parentheses'
      };
  }
}

// Generate word problem (problème contextualisé)
function generateWordProblem(frenchClass: string): Exercise {
  const classIndex = FRENCH_CLASSES.indexOf(frenchClass);
  const objects = ['bananes', 'billes', 'livres', 'cartes', 'bonbons', 'pommes', 'jouets'];
  const object = objects[randomInt(0, objects.length - 1)];
  
  let x: number, y: number, z: number, answer: number, question: string;
  
  switch (frenchClass) {
    case 'CE1':
      x = randomInt(5, 20);
      y = randomInt(1, x - 2);
      answer = x - y;
      question = `Clément a ${x} ${object}. Il en donne ${y} à son ami. Combien lui en reste-t-il ?`;
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'logic',
        difficulty: classIndex + 1,
        question,
        answer: answer.toString(),
        explanation: `${x} - ${y} = ${answer}`,
        frenchClass,
        topic: 'probleme_contextuel'
      };
    case 'CE2':
    case 'CM1':
      x = randomInt(10, 30);
      y = randomInt(2, 8);
      z = randomInt(1, y - 1);
      answer = x - y - z;
      question = `Clément achète ${x} ${object}, en mange ${y} et en donne ${z} à son ami. Combien lui en reste-t-il ?`;
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'logic',
        difficulty: classIndex + 1,
        question,
        answer: answer.toString(),
        explanation: `${x} - ${y} - ${z} = ${x - y} - ${z} = ${answer}`,
        frenchClass,
        topic: 'probleme_contextuel'
      };
    default:
      x = randomInt(20, 100);
      y = randomInt(5, 20);
      z = randomInt(3, y - 2);
      answer = x - y - z;
      question = `Clément a ${x} ${object}. Il en utilise ${y} et en vend ${z}. Combien lui en reste-t-il ?`;
      return {
        id: Math.random().toString(36).substring(2, 11),
        type: 'logic',
        difficulty: classIndex + 1,
        question,
        answer: answer.toString(),
        explanation: `${x} - ${y} - ${z} = ${x - y} - ${z} = ${answer}`,
        frenchClass,
        topic: 'probleme_contextuel'
      };
  }
}

// Export functions for use in other modules
export { 
  getClassFromElo,
  FRENCH_CLASSES
};
