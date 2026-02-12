import { MultiplayerGame, MultiplayerStats, TimeControl, GameType } from './multiplayer';
import { getRankFromElo } from './elo';

// Calculate Elo change for multiplayer games
export function calculateMultiplayerEloChange(
  playerElo: number,
  opponentElo: number,
  playerScore: number,
  opponentScore: number,
  isRanked: boolean
): number {
  if (!isRanked) return 0; // No Elo change for friendly games
  
  // Base K-factor for multiplayer (higher than solo for more dynamic changes)
  const K = 32;
  
  // Calculate expected scores
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  
  // Actual score (1 for win, 0.5 for draw, 0 for loss)
  const actualScore = playerScore > opponentScore ? 1 : playerScore === opponentScore ? 0.5 : 0;
  
  // Elo change
  const eloChange = Math.round(K * (actualScore - expectedScore));
  
  return eloChange;
}

// Calculate multiplayer performance tier
export function getMultiplayerPerformanceTier(
  wins: number,
  losses: number,
  draws: number,
  totalGames: number
): { tier: string; color: string; message: string } {
  if (totalGames === 0) {
    return {
      tier: 'Débutant',
      color: 'text-gray-400',
      message: 'Commence tes premières parties !'
    };
  }
  
  const winRate = wins / totalGames;
  
  if (winRate >= 0.8) {
    return {
      tier: 'Légende',
      color: 'text-yellow-400',
      message: 'Invincible !'
    };
  } else if (winRate >= 0.7) {
    return {
      tier: 'Maître',
      color: 'text-purple-400',
      message: 'Excellent niveau !'
    };
  } else if (winRate >= 0.6) {
    return {
      tier: 'Expert',
      color: 'text-blue-400',
      message: 'Très solide !'
    };
  } else if (winRate >= 0.5) {
    return {
      tier: 'Compétent',
      color: 'text-green-400',
      message: 'Bon niveau !'
    };
  } else if (winRate >= 0.4) {
    return {
      tier: 'Apprenti',
      color: 'text-orange-400',
      message: 'En progression !'
    };
  } else {
    return {
      tier: 'Débutant',
      color: 'text-gray-400',
      message: 'Continue tes efforts !'
    };
  }
}

// Get best time control for a player
export function getBestTimeControl(stats: MultiplayerStats): {
  timeControl: TimeControl;
  winRate: number;
  games: number;
} | null {
  const timeControls: TimeControl[] = ['lightning', 'blitz', 'rapid', 'classical', 'thinking'];
  
  let bestTimeControl: TimeControl | null = null;
  let bestWinRate = 0;
  let bestGames = 0;
  
  for (const tc of timeControls) {
    const games = stats[`${tc}Games` as keyof MultiplayerStats] as number;
    const wins = stats[`${tc}Wins` as keyof MultiplayerStats] as number;
    
    if (games > 0) {
      const winRate = wins / games;
      if (winRate > bestWinRate || (winRate === bestWinRate && games > bestGames)) {
        bestWinRate = winRate;
        bestGames = games;
        bestTimeControl = tc;
      }
    }
  }
  
  return bestTimeControl ? {
    timeControl: bestTimeControl,
    winRate: bestWinRate,
    games: bestGames
  } : null;
}

// Calculate head-to-head statistics
export function getHeadToHeadStats(
  userId: string,
  opponentId: string,
  headToHeadJson: string | null
): { wins: number; losses: number; draws: number; totalGames: number } {
  if (!headToHeadJson) {
    return { wins: 0, losses: 0, draws: 0, totalGames: 0 };
  }
  
  try {
    const headToHead = JSON.parse(headToHeadJson);
    const opponentStats = headToHead.find((stat: any) => stat.opponentId === opponentId);
    
    if (opponentStats) {
      return {
        wins: opponentStats.wins || 0,
        losses: opponentStats.losses || 0,
        draws: opponentStats.draws || 0,
        totalGames: (opponentStats.wins || 0) + (opponentStats.losses || 0) + (opponentStats.draws || 0)
      };
    }
  } catch (error) {
    console.error('Error parsing head-to-head data:', error);
  }
  
  return { wins: 0, losses: 0, draws: 0, totalGames: 0 };
}

// Update head-to-head statistics
export function updateHeadToHeadStats(
  currentHeadToHead: string | null,
  opponentId: string,
  result: 'win' | 'loss' | 'draw'
): string {
  let headToHead = [];
  
  if (currentHeadToHead) {
    try {
      headToHead = JSON.parse(currentHeadToHead);
    } catch (error) {
      console.error('Error parsing head-to-head data:', error);
    }
  }
  
  // Find existing opponent stats or create new
  let opponentStats = headToHead.find((stat: any) => stat.opponentId === opponentId);
  
  if (!opponentStats) {
    opponentStats = {
      opponentId,
      wins: 0,
      losses: 0,
      draws: 0
    };
    headToHead.push(opponentStats);
  }
  
  // Update the result
  if (result === 'win') {
    opponentStats.wins++;
  } else if (result === 'loss') {
    opponentStats.losses++;
  } else {
    opponentStats.draws++;
  }
  
  return JSON.stringify(headToHead);
}

// Generate matchmaking pool based on Elo and preferences
export function generateMatchmakingPool(
  playerElo: number,
  timeControl: TimeControl,
  gameType: GameType,
  availablePlayers: Array<{
    id: string;
    username: string;
    multiplayerElo: number;
    isSearching: boolean;
    preferredTimeControl?: TimeControl;
  }>
): Array<typeof availablePlayers[0]> {
  const eloRange = 100; // ±100 Elo for ranked games, wider for friendly
  
  return availablePlayers.filter(player => {
    // Don't match with self
    if (player.id === player.id) return false;
    
    // Player must be searching
    if (!player.isSearching) return false;
    
    // Check Elo compatibility for ranked games
    if (gameType === 'ranked') {
      const eloDiff = Math.abs(player.multiplayerElo - playerElo);
      if (eloDiff > eloRange) return false;
    }
    
    // Check time control preference
    if (player.preferredTimeControl && player.preferredTimeControl !== timeControl) {
      return false;
    }
    
    return true;
  });
}

// Calculate game difficulty based on both players' Elos
export function calculateGameDifficulty(
  player1Elo: number,
  player2Elo: number
): 'easy' | 'medium' | 'hard' | 'mixed' {
  const averageElo = (player1Elo + player2Elo) / 2;
  
  if (averageElo < 600) return 'easy';
  if (averageElo < 900) return 'medium';
  if (averageElo < 1200) return 'hard';
  return 'mixed';
}

// Generate questions for multiplayer game
export function generateMultiplayerQuestions(
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed',
  questionCount: number = 20,
  player1Elo: number,
  player2Elo: number
): Array<{
  question: string;
  answer: string;
  type: string;
  difficulty: number;
}> {
  // This would integrate with your existing exercise generation
  // For now, return placeholder structure
  const averageElo = (player1Elo + player2Elo) / 2;
  
  // Generate questions based on average Elo and difficulty setting
  // This is a placeholder - you'd integrate with your existing exercise.ts
  return Array(questionCount).fill(null).map((_, index) => ({
    question: `${index + 1} + ${index + 2}`,
    answer: String((index + 1) + (index + 2)),
    type: 'addition',
    difficulty: Math.min(10, Math.max(1, Math.floor(averageElo / 100)))
  }));
}

// Check if a player is on a winning streak
export function isOnWinningStreak(stats: MultiplayerStats): boolean {
  return stats.currentStreak >= 3;
}

// Get streak milestone message
export function getStreakMilestoneMessage(streak: number): string {
  if (streak === 3) return '🔥 Série de 3 victoires !';
  if (streak === 5) return '🔥🔥 Série de 5 victoires !';
  if (streak === 10) return '🔥🔥🔥 Série de 10 victoires ! Incroyable !';
  if (streak === 15) return '🔥🔥🔥🔥 Série de 15 victoires ! Légendaire !';
  if (streak >= 20) return `🔥🔥🔥🔥🔥 Série de ${streak} victoires ! DIVIN !`;
  return '';
}
