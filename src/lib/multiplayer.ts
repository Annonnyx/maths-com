// Multiplayer game types and configurations

export type TimeControl = 'lightning' | 'blitz' | 'rapid' | 'classical' | 'thinking';
export type GameType = 'friendly' | 'ranked' | 'random';
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'aborted';
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';
export type MessageType = 'friend_request' | 'challenge' | 'chat' | 'system';

export interface TimeControlConfig {
  name: string;
  timeLimit: number; // in seconds
  description: string;
  averageTimePerQuestion: number; // in seconds
  icon: string;
  color: string;
}

export const TIME_CONTROLS: Record<TimeControl, TimeControlConfig> = {
  lightning: {
    name: 'Éclair',
    timeLimit: 120, // 2 minutes
    description: '6 secondes par question - Ultra rapide !',
    averageTimePerQuestion: 6,
    icon: '⚡',
    color: 'text-yellow-400'
  },
  blitz: {
    name: 'Blitz',
    timeLimit: 180, // 3 minutes
    description: '9 secondes par question - Très intense',
    averageTimePerQuestion: 9,
    icon: '🔥',
    color: 'text-orange-400'
  },
  rapid: {
    name: 'Rapide',
    timeLimit: 300, // 5 minutes
    description: '15 secondes par question - Équilibré',
    averageTimePerQuestion: 15,
    icon: '⚡',
    color: 'text-blue-400'
  },
  classical: {
    name: 'Classique',
    timeLimit: 480, // 8 minutes
    description: '24 secondes par question - Réfléchi',
    averageTimePerQuestion: 24,
    icon: '🎯',
    color: 'text-purple-400'
  },
  thinking: {
    name: 'Réflexion',
    timeLimit: 720, // 12 minutes
    description: '36 secondes par question - Stratégique',
    averageTimePerQuestion: 36,
    icon: '🧠',
    color: 'text-green-400'
  }
};

export interface MultiplayerGame {
  id: string;
  player1Id: string;
  player2Id: string | null;
  status: GameStatus;
  gameType: GameType;
  timeControl: TimeControl;
  timeLimit: number;
  player1Elo: number;
  player2Elo: number | null;
  player1Score: number;
  player2Score: number;
  winner: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  questionCount: number;
  difficulty: string;
  player1?: {
    id: string;
    username: string;
    displayName: string | null;
    multiplayerElo: number;
    multiplayerRankClass: string;
    isOnline: boolean;
  };
  player2?: {
    id: string;
    username: string;
    displayName: string | null;
    multiplayerElo: number;
    multiplayerRankClass: string;
    isOnline: boolean;
  };
  questions?: MultiplayerQuestion[];
}

export interface MultiplayerQuestion {
  id: string;
  gameId: string;
  question: string;
  answer: string;
  type: string;
  difficulty: number;
  order: number;
  player1Answer: string | null;
  player2Answer: string | null;
  player1Time: number | null;
  player2Time: number | null;
  player1Correct: boolean | null;
  player2Correct: boolean | null;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
  user1?: {
    id: string;
    username: string;
    displayName: string | null;
    isOnline: boolean;
  };
  user2?: {
    id: string;
    username: string;
    displayName: string | null;
    isOnline: boolean;
  };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
    displayName: string | null;
  };
  receiver?: {
    id: string;
    username: string;
    displayName: string | null;
  };
}

export interface MultiplayerStats {
  id: string;
  userId: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
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
  averageScore: number;
  averageTime: number;
  bestStreak: number;
  currentStreak: number;
  headToHead: string | null;
  updatedAt: string;
}

export interface GameSearchRequest {
  timeControl: TimeControl;
  gameType: GameType;
  difficulty?: string;
  questionCount?: number;
}

export interface GameSearchResult {
  game: MultiplayerGame;
  opponent: {
    id: string;
    username: string;
    displayName: string | null;
    multiplayerElo: number;
    multiplayerRankClass: string;
  };
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'game_search' | 'game_found' | 'game_start' | 'question_update' | 'score_update' | 'game_end' | 'chat' | 'friend_request' | 'status_update';
  data: any;
  gameId?: string;
  senderId?: string;
  receiverId?: string;
}

export interface GameSearchMessage extends WebSocketMessage {
  type: 'game_search';
  data: GameSearchRequest;
}

export interface GameFoundMessage extends WebSocketMessage {
  type: 'game_found';
  data: GameSearchResult;
}

export interface GameStartMessage extends WebSocketMessage {
  type: 'game_start';
  data: {
    game: MultiplayerGame;
    questions: MultiplayerQuestion[];
  };
}

export interface QuestionUpdateMessage extends WebSocketMessage {
  type: 'question_update';
  data: {
    questionIndex: number;
    player1Answer?: string;
    player2Answer?: string;
    player1Time?: number;
    player2Time?: number;
  };
}

export interface ScoreUpdateMessage extends WebSocketMessage {
  type: 'score_update';
  data: {
    player1Score: number;
    player2Score: number;
    currentQuestion: number;
    totalQuestions: number;
  };
}

export interface GameEndMessage extends WebSocketMessage {
  type: 'game_end';
  data: {
    game: MultiplayerGame;
    winner: string;
    player1EloChange?: number;
    player2EloChange?: number;
  };
}
