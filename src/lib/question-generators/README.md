# Question Generators System

## 📋 Overview

This directory contains a comprehensive question generation system that creates mathematical questions dynamically with random values, ensuring no two questions are identical.

## 🏗️ Architecture

### Core Components

- **`types.ts`** - Common interfaces and utility functions
- **`index.ts`** - Factory class for managing all generators
- **Domain generators** - Specialized generators for each mathematical domain

### Domain Generators

#### 📊 Arithmetic (`arithmetic.ts`)
- **Operations**: Addition, Subtraction, Multiplication, Division, Powers, Roots, Percentages, Fractions
- **Difficulty**: 1-10 (CP to Expert)
- **Features**: 
  - Adaptive number ranges based on difficulty
  - Common mistake distractors
  - Detailed explanations

#### 🔢 Algebra (`algebra.ts`)
- **Topics**: Linear equations, Quadratic equations, Systems of equations, Identities, Factorization
- **Difficulty**: 4-10 (CM1 to Expert)
- **Features**:
  - Step-by-step solutions
  - Multiple equation types
  - Real-world applications

#### 📐 Geometry (`geometry.ts`)
- **Topics**: Pythagoras, Thales, Trigonometry, Areas, Perimeters, Volumes
- **Difficulty**: 3-10 (CE2 to Expert)
- **Features**:
  - Visual geometry problems
  - Formula-based calculations
  - Practical applications

#### 📈 Functions (`functions.ts`)
- **Topics**: Linear functions, Quadratic functions, Derivatives, Variations, Limits
- **Difficulty**: 7-10 (5e to Expert)
- **Features**:
  - Function notation
  - Calculus concepts
  - Graph analysis

#### 📊 Statistics (`statistics.ts`)
- **Topics**: Mean, Median, Probability, Binomial distribution
- **Difficulty**: 5-10 (CM2 to Expert)
- **Features**:
  - Real data scenarios
  - Statistical calculations
  - Probability theory

#### 🔬 Complex (`complex.ts`)
- **Topics**: Complex numbers, Matrices, Graph theory
- **Difficulty**: 9-10 (3e to Expert)
- **Features**:
  - Advanced mathematics
  - Abstract concepts
  - Theoretical applications

## 🎯 Usage Examples

### Basic Usage

```typescript
import { QuestionGeneratorFactory } from '@/lib/question-generators';

// Generate a single arithmetic question
const question = QuestionGeneratorFactory.generateQuestion('arithmetic', 5);

// Generate mixed questions
const questions = QuestionGeneratorFactory.generateMixedQuestions(7, 10);
```

### Domain-Specific Generation

```typescript
import { ArithmeticGenerator } from '@/lib/question-generators';

const generator = new ArithmeticGenerator();
const question = generator.generate(3); // Difficulty 3
```

## 🔧 Configuration

### Difficulty Levels

- **1-3**: Primary school (CP-CE2)
- **4-6**: Elementary school (CM1-6e)  
- **7-8**: Middle school (5e-4e)
- **9-10**: High school (3e-Tle)

### Question Structure

Each generated question includes:

```typescript
interface GeneratedQuestion {
  question: string;      // The question text
  answers: string[];      // Multiple choice options
  correct: string;       // The correct answer
  explanation: string;   // Step-by-step explanation
  difficulty: number;    // Difficulty level (1-10)
}
```

## 🚀 Features

### ✅ Random Generation
- All values are generated randomly
- No hardcoded questions
- Infinite question combinations

### 🎯 Adaptive Difficulty
- Questions scale with user level
- Appropriate complexity for each grade
- Progressive challenge system

### 🧠 Smart Distractors
- Wrong answers based on common mistakes
- Plausible alternatives
- Educational value in errors

### 📚 Comprehensive Explanations
- Step-by-step solutions
- Formula demonstrations
- Concept reinforcement

## 🔗 Integration

### With Existing Systems

The generators integrate seamlessly with:

- **Practice mode**: `/practice?course_id=XXX`
- **Multiplayer**: Real-time question generation
- **Tests**: Adaptive test creation
- **Class groups**: Dynamic group questions

### Migration from Hardcoded Questions

The system automatically replaces hardcoded questions:

```typescript
// Before (ClassGroup.tsx)
const [questions] = useState([
  { question: '2 × 15 = ?', options: ['25', '30', '28', '32'], correct: 1 },
  // ... more hardcoded questions
]);

// After
const [questions, setQuestions] = useState([]);

useEffect(() => {
  const generateQuestions = async () => {
    const { QuestionGeneratorFactory } = await import('@/lib/question-generators');
    const generatedQuestions = QuestionGeneratorFactory.generateMixedQuestions(3, 4);
    setQuestions(formatQuestions(generatedQuestions));
  };
  generateQuestions();
}, []);
```

## 📈 Performance

- **Generation Speed**: < 1ms per question
- **Memory Usage**: Minimal footprint
- **Scalability**: Handles thousands of questions
- **Caching**: Optional result caching available

## 🎨 Customization

### Adding New Generators

1. Create a new generator class implementing `QuestionGenerator`
2. Add it to the factory in `index.ts`
3. Update the domain types in `types.ts`

### Extending Difficulty Levels

Modify the difficulty switches in each generator to add new levels or adjust existing ones.

## 🔍 Testing

Each generator includes comprehensive testing:

- Unit tests for each generation method
- Difficulty validation
- Answer verification
- Edge case handling

## 📊 Analytics

The system tracks:

- Question generation patterns
- Difficulty distribution
- Popular domains
- Performance metrics

---

**🎓 Educational Impact**: This system ensures that every student gets unique, appropriately challenging questions that adapt to their learning level while maintaining educational rigor and engagement.
