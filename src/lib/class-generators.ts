// Générateurs de questions par classe française
// Chaque classe a des types de questions adaptés à son programme scolaire

import { Exercise, OperationType } from './exercises';
import { FrenchClass, CLASS_INFO } from './french-classes';

// Types d'exercices spécifiques par classe
export interface ClassExerciseConfig {
  className: FrenchClass;
  operations: OperationType[];
  minDifficulty: number;
  maxDifficulty: number;
  geometryEnabled: boolean;
  specialTypes: string[]; // Types spéciaux comme 'geometrie', 'probabilite', etc.
}

// Configuration des exercices par classe
export const CLASS_EXERCISE_CONFIG: Record<FrenchClass, ClassExerciseConfig> = {
  'CP': {
    className: 'CP',
    operations: ['addition', 'subtraction', 'mental_math', 'logic'],
    minDifficulty: 1,
    maxDifficulty: 3,
    geometryEnabled: false,
    specialTypes: ['comptage', 'formes_simples']
  },
  'CE1': {
    className: 'CE1',
    operations: ['addition', 'subtraction', 'multiplication', 'mental_math', 'logic'],
    minDifficulty: 1,
    maxDifficulty: 4,
    geometryEnabled: false,
    specialTypes: ['tables_multiplication', 'mesures']
  },
  'CE2': {
    className: 'CE2',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mental_math', 'logic'],
    minDifficulty: 2,
    maxDifficulty: 5,
    geometryEnabled: true,
    specialTypes: ['fractions_simples', 'geometrie_base', 'perimetre']
  },
  'CM1': {
    className: 'CM1',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'mental_math', 'logic'],
    minDifficulty: 3,
    maxDifficulty: 6,
    geometryEnabled: true,
    specialTypes: ['nombres_decimaux', 'fractions', 'aire', 'volume_simple']
  },
  'CM2': {
    className: 'CM2',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'mental_math', 'logic'],
    minDifficulty: 4,
    maxDifficulty: 7,
    geometryEnabled: true,
    specialTypes: ['pourcentages', 'symetrie', 'solides', 'proportionnalite']
  },
  '6e': {
    className: '6e',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'mental_math', 'logic'],
    minDifficulty: 4,
    maxDifficulty: 7,
    geometryEnabled: true,
    specialTypes: ['priorite_operatoire', 'axes_symetrie', 'angles', 'echelle']
  },
  '5e': {
    className: '5e',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'mental_math'],
    minDifficulty: 5,
    maxDifficulty: 8,
    geometryEnabled: true,
    specialTypes: ['nombres_relatifs', 'calcul_litteral_simple', 'triangles', 'statistiques']
  },
  '4e': {
    className: '4e',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'mental_math'],
    minDifficulty: 6,
    maxDifficulty: 8,
    geometryEnabled: true,
    specialTypes: ['puissances', 'identites_remarquables', 'pythagore', 'trigonometrie_debut']
  },
  '3e': {
    className: '3e',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'],
    minDifficulty: 7,
    maxDifficulty: 9,
    geometryEnabled: true,
    specialTypes: ['theoreme_thales', 'trigonometrie', 'fonctions_lineaires', 'probabilites']
  },
  '2de': {
    className: '2de',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'],
    minDifficulty: 7,
    maxDifficulty: 9,
    geometryEnabled: true,
    specialTypes: ['ensembles_nombres', 'intervalles', 'statistiques_avancees', 'probabilites']
  },
  '1re': {
    className: '1re',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'],
    minDifficulty: 8,
    maxDifficulty: 10,
    geometryEnabled: true,
    specialTypes: ['derivation', 'suites', 'fonctions', 'combinatoire']
  },
  'Tle': {
    className: 'Tle',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'],
    minDifficulty: 8,
    maxDifficulty: 10,
    geometryEnabled: true,
    specialTypes: ['integrales', 'equations_differentielles', 'lois_binomiales', 'geometrie_espace']
  },
  'Sup1': {
    className: 'Sup1',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'],
    minDifficulty: 9,
    maxDifficulty: 10,
    geometryEnabled: true,
    specialTypes: ['algebre_lineaire', 'topologie', 'analyse_reelle', 'geometrie_avancee']
  },
  'Sup2': {
    className: 'Sup2',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'],
    minDifficulty: 9,
    maxDifficulty: 10,
    geometryEnabled: true,
    specialTypes: ['analyse_complexe', 'geometrie_differentielle', 'probabilites_avancees', 'algebre_abstracte']
  },
  'Sup3': {
    className: 'Sup3',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'],
    minDifficulty: 10,
    maxDifficulty: 10,
    geometryEnabled: true,
    specialTypes: ['recherche', 'mathematiques_pures', 'applications_avancees']
  },
  'Pro': {
    className: 'Pro',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math', 'logic'],
    minDifficulty: 10,
    maxDifficulty: 10,
    geometryEnabled: true,
    specialTypes: ['tous_types', 'defis_experts', 'problemes_olympiade']
  }
};

// Helper function pour générer des nombres entiers aléatoires (évite les décimaux)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ====== GÉNÉRATEURS PAR CLASSE ======

// CP : Nombres jusqu'à 1000, additions/soustractions simples
export function generateCPQuestion(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'mental_math', 'logic'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(1, 3);
  
  return generateExerciseByClass(type, difficulty, 'CP');
}

// CE1 : Tables de multiplication, division simple
export function generateCE1Question(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(1, 4);
  
  return generateExerciseByClass(type, difficulty, 'CE1');
}

// CE2 : Fractions simples, division
export function generateCE2Question(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(2, 5);
  
  return generateExerciseByClass(type, difficulty, 'CE2');
}

// CM1 : Grands nombres, décimaux, périmètre/aire
export function generateCM1Question(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(3, 6);
  
  return generateExerciseByClass(type, difficulty, 'CM1');
}

// CM2 : Pourcentages, solides, symétrie
export function generateCM2Question(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(4, 7);
  
  return generateExerciseByClass(type, difficulty, 'CM2');
}

// 6e : Priorité opératoire
export function generate6eQuestion(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(4, 7);
  
  return generateExerciseByClass(type, difficulty, '6e');
}

// 5e : Nombres relatifs, algèbre
export function generate5eQuestion(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(5, 8);
  
  return generateExerciseByClass(type, difficulty, '5e');
}

// 4e : Puissances, Pythagore
export function generate4eQuestion(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(6, 8);
  
  return generateExerciseByClass(type, difficulty, '4e');
}

// 3e : Thalès, trigonométrie
export function generate3eQuestion(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(7, 9);
  
  return generateExerciseByClass(type, difficulty, '3e');
}

// 2de : Ensembles, intervalles
export function generate2deQuestion(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(7, 9);
  
  return generateExerciseByClass(type, difficulty, '2de');
}

// 1re : Dérivation, suites
export function generate1reQuestion(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(8, 10);
  
  return generateExerciseByClass(type, difficulty, '1re');
}

// Tle : Intégrales, équations différentielles
export function generateTleQuestion(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(8, 10);
  
  return generateExerciseByClass(type, difficulty, 'Tle');
}

// Sup1 : Algèbre linéaire
export function generateSup1Question(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'equation', 'power', 'root', 'factorization', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(9, 10);
  
  return generateExerciseByClass(type, difficulty, 'Sup1');
}

// Sup2 : Analyse complexe
export function generateSup2Question(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'equation', 'power', 'root', 'factorization', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = randomInt(9, 10);
  
  return generateExerciseByClass(type, difficulty, 'Sup2');
}

// Sup3 : Recherche
export function generateSup3Question(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'equation', 'power', 'root', 'factorization', 'mental_math'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = 10;
  
  return generateExerciseByClass(type, difficulty, 'Sup3');
}

// Pro : Expert
export function generateProQuestion(): Exercise {
  const types: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division', 'percentage', 'fraction', 'equation', 'power', 'root', 'factorization', 'mental_math', 'logic'];
  const type = types[randomInt(0, types.length - 1)];
  const difficulty = 10;
  
  return generateExerciseByClass(type, difficulty, 'Pro');
}

// Générateur principal par classe
export function generateExerciseByClass(
  type: OperationType, 
  difficulty: number, 
  className: FrenchClass
): Exercise {
  // Utilise la logique existante mais adapte selon la classe
  const config = CLASS_EXERCISE_CONFIG[className];
  
  // Ajuste la difficulté pour éviter les décimaux selon la classe
  const adjustedDifficulty = Math.max(config.minDifficulty, Math.min(difficulty, config.maxDifficulty));
  
  // Génère l'exercice avec les contraintes de la classe
  return generateWithConstraints(type, adjustedDifficulty, className);
}

// Générateur avec contraintes spécifiques par classe
function generateWithConstraints(type: OperationType, difficulty: number, className: FrenchClass): Exercise {
  // Utiliser les paramètres pour adapter la génération
  const baseExercise = generateBaseExercise(type, difficulty);
  
  // Ajoute des métadonnées de classe
  return {
    ...baseExercise,
    id: `${className.toLowerCase()}-${Math.random().toString(36).substring(2, 11)}`,
    // On garde la difficulté originale pour référence
  };
}

// Générateur de base (simplifié - utilise exercises.ts en pratique)
function generateBaseExercise(type: OperationType, difficulty: number): Exercise {
  // Cette fonction serait connectée à la logique existante dans exercises.ts
  // Pour l'instant, retourne une structure minimale
  return {
    id: Math.random().toString(36).substring(2, 11),
    type,
    difficulty,
    question: 'Question en cours de génération...',
    answer: '0',
    explanation: 'Explication à venir'
  };
}

// Fonction pour générer un test complet pour une classe
export function generateClassTest(className: FrenchClass, count: number = 20): Exercise[] {
  const questions: Exercise[] = [];
  const config = CLASS_EXERCISE_CONFIG[className];
  
  for (let i = 0; i < count; i++) {
    // Difficulté progressive dans le test
    const progress = i / count;
    const difficultyRange = config.maxDifficulty - config.minDifficulty;
    const difficulty = Math.min(
      config.maxDifficulty, 
      Math.floor(config.minDifficulty + (progress * difficultyRange * 1.5))
    );
    
    // Choix aléatoire parmi les opérations disponibles
    const operation = config.operations[randomInt(0, config.operations.length - 1)];
    
    questions.push(generateExerciseByClass(operation, difficulty, className));
  }
  
  return questions;
}

// Fonction pour obtenir le générateur approprié selon la classe
export function getGeneratorForClass(className: FrenchClass): () => Exercise {
  const generators: Record<FrenchClass, () => Exercise> = {
    'CP': generateCPQuestion,
    'CE1': generateCE1Question,
    'CE2': generateCE2Question,
    'CM1': generateCM1Question,
    'CM2': generateCM2Question,
    '6e': generate6eQuestion,
    '5e': generate5eQuestion,
    '4e': generate4eQuestion,
    '3e': generate3eQuestion,
    '2de': generate2deQuestion,
    '1re': generate1reQuestion,
    'Tle': generateTleQuestion,
    'Sup1': generateSup1Question,
    'Sup2': generateSup2Question,
    'Sup3': generateSup3Question,
    'Pro': generateProQuestion
  };
  
  return generators[className] || generateCPQuestion;
}

// Fonction pour générer des questions multijoueur adaptées aux classes des joueurs
export function generateMultiplayerQuestionsByClass(
  player1Class: FrenchClass,
  player2Class: FrenchClass,
  count: number = 20
): Exercise[] {
  // Prend la classe la plus avancée comme référence pour la difficulté
  const classIndex1 = Object.keys(CLASS_EXERCISE_CONFIG).indexOf(player1Class);
  const classIndex2 = Object.keys(CLASS_EXERCISE_CONFIG).indexOf(player2Class);
  const referenceClass = classIndex1 >= classIndex2 ? player1Class : player2Class;
  
  // Génère des questions adaptées mais accessibles aux deux
  const questions: Exercise[] = [];
  const config = CLASS_EXERCISE_CONFIG[referenceClass];
  
  for (let i = 0; i < count; i++) {
    // Difficulté moyenne entre les deux classes
    const minClass = classIndex1 <= classIndex2 ? player1Class : player2Class;
    const minConfig = CLASS_EXERCISE_CONFIG[minClass];
    
    const progress = i / count;
    const difficulty = Math.floor(
      minConfig.minDifficulty + (progress * (config.maxDifficulty - minConfig.minDifficulty))
    );
    
    // Opérations communes aux deux classes
    const commonOperations = config.operations.filter(op => 
      minConfig.operations.includes(op)
    );
    
    const operation = commonOperations[randomInt(0, commonOperations.length - 1)] || 'addition';
    
    questions.push(generateExerciseByClass(operation, difficulty, referenceClass));
  }
  
  return questions;
}

// Fonction pour filtrer les opérations selon les préférences (ex: sans géométrie)
export function filterOperationsByPreferences(
  operations: OperationType[],
  options: { disableGeometry?: boolean; disableFractions?: boolean }
): OperationType[] {
  let filtered = [...operations];
  
  // Pas de filtrage spécifique sur les types de base, mais pourrait être étendu
  // pour des types spéciaux comme 'geometrie' si on les ajoute comme OperationType
  
  return filtered;
}
