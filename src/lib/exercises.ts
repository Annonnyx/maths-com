// ============================================================================
// EXERCISES-UNIFIED.TS — Système unifié piloté par les générateurs de classes
// ============================================================================
// Ce fichier fait le pont entre l'ancienne interface Exercise et le nouveau système
// de générateurs de classes. Toute la logique est déléguée aux générateurs spécialisés.
// ============================================================================

// Import types from french-classes
import { 
  FRENCH_CLASSES, 
  FrenchClass, 
  OperationType, 
  getClassFromElo 
} from './french-classes';

// Import the unified question-generators system
import { AdaptiveQuestionGenerator, DomainType, GeneratedQuestion } from './question-generators';

// Type alias pour unifier les interfaces
export type UnifiedExercise = GeneratedQuestion;

// Export pour compatibilité - UnifiedExercise remplace Exercise
export type Exercise = UnifiedExercise;

// Helper function to get ELO from class name
function getClassElo(className: FrenchClass): number {
  const eloMap: Record<FrenchClass, number> = {
    'CP': 475, 'CE1': 600, 'CE2': 725, 'CM1': 900, 'CM2': 1100,
    '6e': 1300, '5e': 1500, '4e': 1700, '3e': 1900,
    '2de': 2150, '1re': 2400, 'Tle': 2625,
    'Sup1': 2875, 'Sup2': 3250, 'Sup3': 3750, 'Pro': 4250
  };
  return eloMap[className] || 1000;
}

// ============================================================================
// SYSTÈME UNIFIÉ PILOTÉ PAR LES GÉNÉRATEURS DE CLASSES
// ============================================================================
// Toutes les fonctions délèguent entièrement aux générateurs de classes spécifiques
// Les générateurs de classes déterminent le type, le domaine et les paramètres
// ============================================================================

// Fonction utilitaire principale - délègue entièrement au générateur de classe
function generateByClass(className: FrenchClass, operationType: OperationType): UnifiedExercise {
  const generator = new AdaptiveQuestionGenerator(getClassElo(className));
  const question = generator.generateNext();
  
  // Ajouter seulement les métadonnées de compatibilité
  return {
    ...question,
    className,
    operationType,
  };
}

// Generate addition exercise (piloté par le générateur de classe)
export function generateAddition(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'addition');
}

// Generate subtraction exercise (piloté par le générateur de classe)
export function generateSubtraction(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'subtraction');
}

// Generate multiplication exercise (piloté par le générateur de classe)
export function generateMultiplication(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'multiplication');
}

// Generate division exercise (piloté par le générateur de classe)
export function generateDivision(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'division');
}

// Generate percentage exercise (piloté par le générateur de classe)
export function generatePercentage(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'percentage');
}

// Generate fraction exercise (piloté par le générateur de classe)
export function generateFraction(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'fraction');
}

// Generate equation exercise (piloté par le générateur de classe)
export function generateEquation(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'equation');
}

// Generate geometry exercise (piloté par le générateur de classe)
export function generateGeometry(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'geometry');
}

// Generate power exercise (piloté par le générateur de classe)
export function generatePower(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'power');
}

// Generate root exercise (piloté par le générateur de classe)
export function generateRoot(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'root');
}

// Generate mental math exercise (piloté par le générateur de classe)
export function generateMentalMath(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'mental_math');
}

// Generate logic exercise (piloté par le générateur de classe)
export function generateLogic(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'logic');
}

// Generate factorization exercise (piloté par le générateur de classe)
export function generateFactorization(className: FrenchClass): UnifiedExercise {
  return generateByClass(className, 'factorization');
}

// Main exercise generator function (piloté par le générateur de classe)
export function generateExercise(type: OperationType, className: FrenchClass): UnifiedExercise {
  return generateByClass(className, type);
}

// ============================================================================
// FONCTIONS DE VALIDATION UNIFIÉES
// ============================================================================

// Validate answer for exercise (unifié)
export function validateAnswer(exercise: UnifiedExercise | Exercise, userAnswer: string): boolean {
  // Si la question a une fonction de validation personnalisée (nouveau système)
  if ('validate' in exercise && exercise.validate && typeof exercise.validate === 'function') {
    try {
      return exercise.validate(userAnswer);
    } catch (error) {
      console.error('Erreur dans la fonction de validation personnalisée:', error);
      // Fallback sur la validation standard
    }
  }
  
  // Validation standard améliorée
  const cleanUserAnswer = userAnswer.trim().toLowerCase();
  const cleanCorrectAnswer = exercise.answer.trim().toLowerCase();
  
  // Handle numeric answers with various formats
  if (!isNaN(Number(cleanUserAnswer)) && !isNaN(Number(cleanCorrectAnswer))) {
    return Math.abs(Number(cleanUserAnswer) - Number(cleanCorrectAnswer)) < 0.01;
  }
  
  // Gérer les réponses avec unités (ex: "30m" vs "30")
  const numericUserAnswer = parseFloat(cleanUserAnswer.replace(/[^0-9.-]/g, ''));
  const numericCorrectAnswer = parseFloat(cleanCorrectAnswer.replace(/[^0-9.-]/g, ''));
  
  if (!isNaN(numericUserAnswer) && !isNaN(numericCorrectAnswer)) {
    return Math.abs(numericUserAnswer - numericCorrectAnswer) < 0.01;
  }
  
  // Handle exact string matches
  return cleanUserAnswer === cleanCorrectAnswer;
}

// ============================================================================
// FONCTIONS DE GÉNÉRATION DE TESTS
// ============================================================================

// Generate a test with mixed questions using unified question-generators system
export function generateTest(elo: number, count: number = 20): UnifiedExercise[] {
  // Use question-generators system for competitive tests too
  const generator = new AdaptiveQuestionGenerator(elo);
  const questions = generator.generateMixed(count);
  
  // Convert GeneratedQuestion to UnifiedExercise format (already compatible)
  return questions.map(q => ({
    ...q,
    className: q.className || q.level as FrenchClass,
    operationType: mapDomainToOperationType(q.domain),
  }));
}

// Generate evaluation test using adaptive algorithm
export function generateEvaluationTest(count: number = 20, excludeGeometry: boolean = false): UnifiedExercise[] {
  // Use question-generators system for evaluation tests
  const generator = new AdaptiveQuestionGenerator(1200); // Medium ELO for evaluation
  const questions = generator.generateMixed(count, { excludeGeometry });
  
  // Convert GeneratedQuestion to UnifiedExercise format (already compatible)
  return questions.map(q => ({
    ...q,
    className: q.className || q.level as FrenchClass,
    operationType: mapDomainToOperationType(q.domain),
  }));
}

// Generate multiplayer questions using adaptive algorithm
export function generateMultiplayerQuestions(
  player1Elo: number,
  player2Elo: number,
  count: number = 20
): UnifiedExercise[] {
  // Use question-generators system for multiplayer
  const avgElo = Math.round((player1Elo + player2Elo) / 2);
  const generator = new AdaptiveQuestionGenerator(avgElo);
  const questions = generator.generateMixed(count);
  
  // Convert GeneratedQuestion to UnifiedExercise format (already compatible)
  return questions.map(q => ({
    ...q,
    className: q.className || q.level as FrenchClass,
    operationType: mapDomainToOperationType(q.domain),
  }));
}

// ============================================================================
// UTILITAIRES
// ============================================================================

// Helper function to map domain types to operation types
function mapDomainToOperationType(domain: DomainType): OperationType {
  const mapping: Record<DomainType, OperationType> = {
    'arithmetic': 'calculation',
    'algebra': 'equation',
    'geometry': 'geometry',
    'functions': 'functions',
    'statistics': 'statistics',
    'complex': 'complex',
    'calculation': 'calculation'
  };
  return mapping[domain] || 'calculation';
}

// Helper function to get classes around a given class
export function getClassesAround(targetClass: FrenchClass): FrenchClass[] {
  const classes: FrenchClass[] = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', '2de', '1re', 'Tle', 'Sup1', 'Sup2', 'Sup3', 'Pro'];
  const targetIndex = classes.indexOf(targetClass);
  
  // Return current class and adjacent classes
  const result: FrenchClass[] = [targetClass];
  
  if (targetIndex > 0) result.push(classes[targetIndex - 1]);
  if (targetIndex < classes.length - 1) result.push(classes[targetIndex + 1]);
  
  return result;
}

// Generate practice exercises with variation
export function generatePracticeExercises(
  className: FrenchClass,
  count: number = 10,
  elo: number = 600
): UnifiedExercise[] {
  const questions: UnifiedExercise[] = [];
  
  for (let i = 0; i < count; i++) {
    // Vary slightly between current class and adjacent classes
    const availableClasses = getClassesAround(className);
    const selectedClass = availableClasses[Math.floor(Math.random() * availableClasses.length)];
    
    const generator = new AdaptiveQuestionGenerator(getClassElo(selectedClass));
    const question = generator.generateNext();
    
    questions.push({
      ...question,
      className: selectedClass,
      operationType: mapDomainToOperationType(question.domain),
    });
  }
  
  return questions;
}

// Generate focused test for specific operation type
export function generateFocusedTest(
  operationType: OperationType,
  count: number = 20,
  elo?: number,
  className?: FrenchClass
): UnifiedExercise[] {
  const targetElo = elo || 1200;
  const generator = new AdaptiveQuestionGenerator(targetElo);
  const questions: UnifiedExercise[] = [];
  
  for (let i = 0; i < count; i++) {
    const question = generator.generateNext();
    
    // Filter by operation type if possible
    if (mapDomainToOperationType(question.domain) === operationType) {
      questions.push({
        ...question,
        className: className || question.level as FrenchClass,
        operationType: mapDomainToOperationType(question.domain),
      });
    } else {
      // If no match, generate another question
      i--;
    }
  }
  
  return questions;
}

// Get operation types for a specific course
export function getOperationTypesForCourse(courseName: string): OperationType[] {
  const courseMappings: Record<string, OperationType[]> = {
    'addition': ['addition'],
    'subtraction': ['subtraction'],
    'multiplication': ['multiplication'],
    'division': ['division'],
    'geometry': ['geometry', 'pythagore', 'thales', 'trigonometry', 'geometry_3d'],
    'algebra': ['equation', 'delta', 'quadratic'],
    'functions': ['functions', 'derivatives', 'integrals', 'limits'],
    'statistics': ['statistics', 'probabilities', 'normal_law'],
    'complex': ['complex', 'complex_numbers'],
    'arithmetic': ['calculation', 'percentage', 'fraction'],
  };
  
  return courseMappings[courseName] || ['addition'];
}
