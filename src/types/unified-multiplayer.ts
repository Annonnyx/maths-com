// TYPES UNIFIÉS POUR LE MULTIJOUER

export type GameMode = 'ranked_1v1' | 'casual_1v1' | 'group_quiz';
export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'custom';

export interface UnifiedGameSession {
  id: string;
  joinCode?: string; // nullable pour 1v1
  hostId?: string;   // nullable pour 1v1
  status: 'waiting' | 'active' | 'finished';
  
  // Mode de jeu
  gameMode: GameMode;
  timeControl?: TimeControl;
  timeLimit?: number; // en secondes, pour 1v1
  timePerQuestion?: number; // en secondes, pour groupe
  maxPlayers: number; // 2 pour 1v1, jusqu'à 30 pour groupe
  isRanked: boolean;
  
  // Configuration
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  currentQuestionIndex: number;
  qrCodeUrl?: string;
  
  // Champs 1v1
  player1Id?: string;
  player2Id?: string;
  player1Elo?: number;
  player2Elo?: number;
  player1Score: number;
  player2Score: number;
  winner?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  
  // Relations
  host?: {
    id: string;
    username: string;
    displayName?: string;
    multiplayerElo: number;
    multiplayerRankClass: string;
  };
  player1?: {
    id: string;
    username: string;
    displayName?: string;
    multiplayerElo: number;
    multiplayerRankClass: string;
  };
  player2?: {
    id: string;
    username: string;
    displayName?: string;
    multiplayerElo: number;
    multiplayerRankClass: string;
  };
  players: GamePlayer[];
  questions: GameQuestion[];
}

export interface GamePlayer {
  id: string;
  sessionId: string;
  userId: string;
  score: number;
  joinedAt: Date;
  isReady: boolean;
  updatedAt: Date;
  user: {
    username: string;
    displayName?: string;
    multiplayerElo: number;
    multiplayerRankClass: string;
  };
}

export interface GameQuestion {
  id: string;
  sessionId: string;
  question: string;
  answer: string;
  type: string; // operation type
  difficulty: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Réponses 1v1
  player1Answer?: string;
  player2Answer?: string;
  player1Time?: number; // milliseconds
  player2Time?: number; // milliseconds
  player1Correct?: boolean;
  player2Correct?: boolean;
}

// Configuration pour la création de partie
export interface CreateGameConfig {
  gameMode: GameMode;
  timeControl?: TimeControl;
  maxPlayers?: number;
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  isRanked?: boolean;
  timePerQuestion?: number; // pour mode groupe
}

// Options par mode de jeu
export const GAME_MODE_CONFIGS = {
  ranked_1v1: {
    maxPlayers: 2,
    timeControlOptions: ['bullet', 'blitz', 'rapid', 'classical'] as TimeControl[],
    defaultTimeControl: 'blitz' as TimeControl,
    isRanked: true,
    hasJoinCode: false,
    hasQRCode: false,
    description: 'Duels classés avec ELO'
  },
  casual_1v1: {
    maxPlayers: 2,
    timeControlOptions: ['bullet', 'blitz', 'rapid', 'classical'] as TimeControl[],
    defaultTimeControl: 'blitz' as TimeControl,
    isRanked: false,
    hasJoinCode: false,
    hasQRCode: false,
    description: 'Duels amicaux pour s\'entraîner'
  },
  group_quiz: {
    maxPlayers: 30,
    timeControlOptions: ['custom'] as TimeControl[],
    defaultTimeControl: 'custom' as TimeControl,
    isRanked: false,
    hasJoinCode: true,
    hasQRCode: true,
    description: 'Quiz multijoueur en groupe'
  }
};

// Contrôles de temps avec leurs durées
export const TIME_CONTROL_CONFIGS = {
  bullet: { name: 'Bullet', timeLimit: 60, description: '1 minute' },
  blitz: { name: 'Blitz', timeLimit: 180, description: '3 minutes' },
  rapid: { name: 'Rapide', timeLimit: 300, description: '5 minutes' },
  classical: { name: 'Classique', timeLimit: 480, description: '8 minutes' },
  custom: { name: 'Personnalisé', timeLimit: null, description: 'Variable' }
};
