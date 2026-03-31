import { useSession } from 'next-auth/react';

// Extend the session type to include multiplayer fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      displayName?: string;
      elo: number;
      rankClass: string;
      bestElo: number;
      bestFrenchClass: string;
      currentStreak: number;
      bestStreak: number;
      // Multiplayer fields
      multiplayerElo: number;
      multiplayerClass: string;
      bestMultiplayerElo: number;
      bestMultiplayerFrenchClass: string;
      multiplayerGames: number;
      multiplayerWins: number;
      multiplayerLosses: number;
      isOnline: boolean;
      lastSeenAt: string;
    };
  }
}

export function useExtendedSession() {
  const { data: session, status } = useSession();
  
  // Add default values for multiplayer fields if they don't exist
  const extendedSession = session ? {
    ...session,
    user: {
      ...session.user,
      multiplayerElo: session.user.multiplayerElo || 400,
      multiplayerClass: session.user.multiplayerClass || 'F-',
      bestMultiplayerElo: session.user.bestMultiplayerElo || 400,
      bestMultiplayerFrenchClass: session.user.bestMultiplayerFrenchClass || 'F-',
      multiplayerGames: session.user.multiplayerGames || 0,
      multiplayerWins: session.user.multiplayerWins || 0,
      multiplayerLosses: session.user.multiplayerLosses || 0,
      isOnline: session.user.isOnline || false,
      lastSeenAt: session.user.lastSeenAt || new Date().toISOString()
    }
  } : null;

  return { data: extendedSession, status };
}
