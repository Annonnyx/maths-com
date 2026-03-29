# Question Generators System

## 📋 Overview

This directory contains a comprehensive question generation system that creates mathematical questions dynamically with random values, ensuring no two questions are identical. The system is based on French school levels and adapts to user ELO ratings.

## 🏗️ Architecture

### Core Components

- **`types.ts`** - Common interfaces and utility functions
- **`index.ts`** - Factory class for managing all generators
- **`elo-ranges.ts`** - ELO to level mapping and progression
- **`level-unlock.ts`** - Weighted level selection algorithm
- **Level generators** - Specialized generators for each school level

### Level Generators

#### 🎯 Primary School Levels
- **`cp.ts`** - CP (Cours Préparatoire, 6-7 ans)
- **`ce1.ts`** - CE1 (Cours Élémentaire 1, 7-8 ans)
- **`ce2.ts`** - CE2 (Cours Élémentaire 2, 8-9 ans)
- **`cm1.ts`** - CM1 (Cours Moyen 1, 9-10 ans)
- **`cm2.ts`** - CM2 (Cours Moyen 2, 10-11 ans)

#### 🎓 Secondary School Levels
- **`6e.ts`** - Sixième (11-12 ans)
- **`5e.ts`** - Cinquième (12-13 ans)
- **`4e.ts`** - Quatrième (13-14 ans)
- **`3e.ts`** - Troisième (14-15 ans)
- **`2de.ts`** - Seconde (15-16 ans)
- **`1re.ts`** - Première (16-17 ans)
- **`tle.ts`** - Terminale (17-18 ans)

#### 🎓 University Levels
- **`sup1.ts`** - Supérieur 1 (L1/M1)
- **`sup2.ts`** - Supérieur 2 (L2/M2)
- **`sup3.ts`** - Supérieur 3 (L3/M3/Doctorat)

### Domain Coverage

Each level generator covers multiple mathematical domains:

#### 📊 Arithmetic
- **Operations**: Addition, Subtraction, Multiplication, Division, Powers, Roots, Percentages, Fractions
- **Features**: Adaptive number ranges, Common mistake distractors, Detailed explanations

#### 🔢 Algebra
- **Topics**: Linear equations, Quadratic equations, Systems of equations, Identities, Factorization
- **Features**: Step-by-step solutions, Multiple equation types, Real-world applications

#### 📐 Geometry
- **Topics**: Pythagoras, Thales, Trigonometry, Areas, Perimeters, Volumes
- **Features**: Visual geometry problems, Formula-based calculations, Practical applications

#### 📈 Functions
- **Topics**: Linear functions, Quadratic functions, Derivatives, Variations, Limits
- **Features**: Function notation, Calculus concepts, Graph analysis

#### 📊 Statistics
- **Topics**: Mean, Median, Probability, Binomial distribution
- **Features**: Real data scenarios, Statistical calculations, Probability theory

#### 🔬 Advanced Mathematics
- **Topics**: Complex numbers, Matrices, Graph theory
- **Features**: Advanced mathematics, Abstract concepts, Theoretical applications

## 🎯 Usage Examples

### Basic Usage

```typescript
import { AdaptiveQuestionGenerator } from '@/lib/question-generators';

// Create generator for user with 1200 ELO
const generator = new AdaptiveQuestionGenerator(1200);

// Generate a single question
const question = generator.generateNext();

// Generate mixed questions
const questions = generator.generateMixed(10);
```

### Level-Specific Generation

```typescript
import { CPGenerator } from '@/lib/question-generators';

const generator = new CPGenerator();
const question = generator.generate({ userElo: 800 });
```

### Multiplayer Questions

```typescript
import { generateMultiplayerQuestions } from '@/lib/question-generators';

const questions = generateMultiplayerQuestions(1200, 1500, 20, false);
```

## 🔧 Configuration

### French School Levels

The system uses the French educational system:

- **CP-CE2**: Primary school (6-9 ans)
- **CM1-CM2**: Elementary school (9-11 ans)
- **6e-3e**: Middle school (11-15 ans)
- **2de-Tle**: High school (15-18 ans)
- **Sup1-Sup3**: University (18+ ans)
- **Pro**: Professional/Expert level

### ELO Mapping

Each school level corresponds to an ELO range:
- **CP**: 0-300 ELO
- **CE1**: 200-500 ELO
- **CE2**: 400-700 ELO
- **CM1**: 600-900 ELO
- **CM2**: 800-1100 ELO
- **6e**: 1000-1300 ELO
- **5e**: 1200-1500 ELO
- **4e**: 1400-1700 ELO
- **3e**: 1600-1900 ELO
- **2de**: 1800-2100 ELO
- **1re**: 2000-2300 ELO
- **Tle**: 2200-2500 ELO
- **Sup1**: 2400-2700 ELO
- **Sup2**: 2600-2900 ELO
- **Sup3**: 2800-3000+ ELO

### Question Structure

Each generated question includes:

```typescript
interface GeneratedQuestion {
  id: string;              // Unique identifier
  type: 'numeric' | 'mcq' | 'expression';  // Question type
  domain: DomainType;      // Mathematical domain
  level: SchoolLevel;      // French school level
  difficultyElo: number;   // ELO-based difficulty
  question: string;        // The question text
  answer: string;          // The correct answer
  explanation: string;     // Step-by-step explanation
  timeEstimate?: number;   // Estimated time in seconds
  options?: string[];       // Multiple choice options (if MCQ)
  acceptableAnswers?: string[]; // Alternative valid answers
}
```

## 🚀 Features

### ✅ Random Generation
- All values are generated randomly
- No hardcoded questions
- Infinite question combinations

### 🎯 Adaptive Difficulty
- Questions scale with user ELO rating
- Weighted level selection algorithm
- Progressive challenge system

### 🧠 Smart Distractors
- Wrong answers based on common mistakes
- Plausible alternatives for MCQ
- Educational value in errors

### 📚 Comprehensive Explanations
- Step-by-step solutions
- Formula demonstrations
- Concept reinforcement

### 🔄 Weighted Level Selection
- Intelligent level selection based on ELO
- Adjacent level variation for progression
- Personalized difficulty adaptation

## 🔗 Integration

### With Existing Systems

The generators integrate seamlessly with:

- **Practice mode**: `/practice?course_id=XXX`
- **Multiplayer**: Real-time question generation
- **Tests**: Adaptive test creation
- **Class groups**: Dynamic group questions
- **ELO system**: Automatic difficulty adjustment

### Migration from Hardcoded Questions

The system automatically replaces hardcoded questions:

```typescript
// Before (exercises.ts)
function generateAddition(className: FrenchClass): Exercise {
  // Hardcoded logic...
}

// After
const generator = new AdaptiveQuestionGenerator(userElo);
const question = generator.generateNext();
const exercise = convertToExercise(question);
```

### ELO Integration

```typescript
// Automatic ELO-based question generation
const userElo = getUserElo();
const generator = new AdaptiveQuestionGenerator(userElo);

// Questions automatically adapt to user level
const questions = generator.generateMixed(20);
```

## 📈 Performance

- **Generation Speed**: < 1ms per question
- **Memory Usage**: Minimal footprint
- **Scalability**: Handles thousands of questions
- **ELO Adaptation**: Real-time level selection
- **Weighted Selection**: Optimized algorithm

## 🎨 Customization

### Adding New Level Generators

1. Create a new generator class implementing `LevelGenerator`
2. Add it to the factory in `index.ts`
3. Update the ELO ranges in `elo-ranges.ts`

```typescript
export class NewLevelGenerator implements LevelGenerator {
  getEloRange(): { min: number; max: number } {
    return { min: 1000, max: 1300 };
  }
  
  generate(context: GenerationContext): GeneratedQuestion {
    // Implementation...
  }
}
```

### Extending ELO Ranges

Modify the ELO ranges in `elo-ranges.ts` to add new levels or adjust existing ones.

## 🔍 Testing

Each generator includes comprehensive testing:

- Unit tests for each generation method
- ELO validation
- Answer verification
- Edge case handling
- Level progression testing

## 📊 Analytics

The system tracks:

- Question generation patterns
- ELO distribution
- Popular domains
- Performance metrics
- Level progression

## 🔄 Backward Compatibility

The system maintains compatibility with existing code:

```typescript
// Legacy support for exercises.ts
export function generateTest(elo: number, count: number = 20): Exercise[] {
  const generator = new AdaptiveQuestionGenerator(elo);
  const questions = generator.generateMixed(count);
  return questions.map(convertToExercise);
}
```

---

**🎓 Educational Impact**: This system ensures that every student gets unique, appropriately challenging questions that adapt to their learning level while maintaining educational rigor and engagement. The French school system integration provides a natural progression path for students from primary school through university levels.

**🎯 ELO Integration**: The system seamlessly integrates with the existing ELO ranking system, providing automatic difficulty adjustment and personalized learning paths for each student.
