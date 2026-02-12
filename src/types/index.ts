import { RankClass } from '@/lib/elo';
import { OperationType } from '@/lib/exercises';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  elo: number;
  rankClass: RankClass;
  bestElo: number;
  bestRankClass: RankClass;
  hasCompletedOnboarding: boolean;
  currentStreak: number;
  bestStreak: number;
  additionLevel: number;
  subtractionLevel: number;
  multiplicationLevel: number;
  divisionLevel: number;
  powerLevel: number;
  rootLevel: number;
  factorizationLevel: number;
  lastTestDate?: string;
}

export interface TestResult {
  id: string;
  startedAt: string;
  completedAt?: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeTaken: number;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  isPerfect: boolean;
  isStreakTest: boolean;
  questions: QuestionResult[];
}

export interface QuestionResult {
  id: string;
  type: OperationType;
  difficulty: number;
  question: string;
  answer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  timeTaken?: number;
  explanation?: string;
  order: number;
}

export interface Statistics {
  totalTests: number;
  totalQuestions: number;
  totalCorrect: number;
  totalTime: number;
  averageScore: number;
  averageTime: number;
  
  // By operation type
  additionTests: number;
  additionCorrect: number;
  additionTotal: number;
  
  subtractionTests: number;
  subtractionCorrect: number;
  subtractionTotal: number;
  
  multiplicationTests: number;
  multiplicationCorrect: number;
  multiplicationTotal: number;
  
  divisionTests: number;
  divisionCorrect: number;
  divisionTotal: number;
  
  powerTests: number;
  powerCorrect: number;
  powerTotal: number;
  
  rootTests: number;
  rootCorrect: number;
  rootTotal: number;
  
  factorizationTests: number;
  factorizationCorrect: number;
  factorizationTotal: number;
  
  weakPoints?: string[];
  eloHistory?: { date: string; elo: number }[];
}

export interface ExerciseAttempt {
  id: string;
  type: OperationType;
  difficulty: number;
  question: string;
  answer: string;
  userAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  difficulty: number;
  order: number;
  isPublished: boolean;
  relatedTypes?: OperationType[];
}
