import { RankClass } from '@/lib/elo';
import { OperationType } from '@/lib/exercises';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  // SOLO Ranking
  soloElo: number;
  soloRankClass: RankClass;
  soloBestElo: number;
  soloBestRankClass: RankClass;
  soloCurrentStreak: number;
  soloBestStreak: number;
  // MULTIPLAYER Ranking  
  multiplayerElo: number;
  multiplayerRankClass: RankClass;
  multiplayerBestElo: number;
  multiplayerBestRankClass: RankClass;
  // Profile
  classe?: string;
  birthYear?: number;
  bannerUrl?: string;
  selectedBadgeIds?: string;
  customBannerId?: string;
  // Admin
  isAdmin: boolean;
  isTeacher: boolean;
  school?: string;
  subject?: string;
  acceptJoinRequests: boolean;
  // Status
  hasCompletedOnboarding: boolean;
  lastTestDate?: string;
  isOnline: boolean;
  lastSeenAt: string;
  // Discord
  discordId?: string;
  discordUsername?: string;
  discordLinkedAt?: string;
  discordLinkCode?: string;
}

export interface SoloTestResult {
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
  questions: SoloQuestionResult[];
}

export interface SoloQuestionResult {
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

export interface SoloStatistics {
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

// Leaderboard types
export interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string | null;
  globalRank: number;
  weeklyRank?: number;
  monthlyRank?: number;
  stats: {
    winRate?: number;
    accuracy?: number;
    totalGames?: number;
    currentElo: number;
    currentRank: string;
    bestElo: number;
    bestRank: string;
  };
  isOnline: boolean;
  lastSeenAt: string;
}

export interface LeaderboardResponse {
  mode: 'solo' | 'multiplayer';
  leaderboard: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  userRank: number | null;
  currentUser: {
    id: string;
    username: string;
    displayName: string | null;
    stats: {
      currentElo: number;
      currentRank: string;
      totalGames?: number;
    };
  } | null;
}

// Multiplayer Statistics
export interface MultiplayerStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  
  // By time control
  lightningGames: number;
  lightningWins: number;
  blitzGames: number;
  blitzWins: number;
  rapidGames: number;
  rapidWins: number;
  classicalGames: number;
  classicalWins: number;
  thinkingGames: number;
  thinkingWins: number;
  
  // Performance metrics
  averageScore: number;
  averageTime: number;
  multiplayerCurrentStreak: number;
  multiplayerBestStreak: number;
  
  // Head to head records (stored as JSON)
  headToHead?: { opponentId: string; wins: number; losses: number; draws: number }[];
}
