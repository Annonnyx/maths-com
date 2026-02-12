import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Types
export interface GameSearch {
  timeControl: string;
  gameType: string;
  isSearching: boolean;
}

export interface MultiplayerGame {
  id: string;
  player1Id: string;
  player2Id: string | null;
  status: string;
  gameType: string;
  timeControl: string;
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
  questions?: any[];
}

export interface Friend {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    isOnline: boolean;
    lastSeenAt: string;
  };
  isInitiator: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    displayName: string | null;
  };
}

export function useMultiplayer() {
  const { data: session } = useSession();
  const [currentGame, setCurrentGame] = useState<MultiplayerGame | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchConfig, setSearchConfig] = useState<GameSearch>({
    timeControl: 'blitz',
    gameType: 'ranked',
    isSearching: false
  });
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<any[]>([]);

  // Search for a game
  const searchGame = useCallback(async (timeControl: string, gameType: string) => {
    if (!session?.user?.email) return;

    try {
      setIsSearching(true);
      setSearchConfig(prev => ({ ...prev, timeControl, gameType, isSearching: true }));

      const response = await fetch('/api/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl,
          gameType,
          questionCount: 20
        })
      });

      if (!response.ok) {
        throw new Error('Failed to search for game');
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentGame(data.game);
        if (data.game.status === 'playing') {
          // Game found immediately
          setIsSearching(false);
          setSearchConfig(prev => ({ ...prev, isSearching: false }));
        }
      }
    } catch (error) {
      console.error('Error searching for game:', error);
      setIsSearching(false);
      setSearchConfig(prev => ({ ...prev, isSearching: false }));
    }
  }, [session]);

  // Cancel game search
  const cancelSearch = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      await fetch('/api/multiplayer', {
        method: 'DELETE'
      });

      setIsSearching(false);
      setSearchConfig(prev => ({ ...prev, isSearching: false }));
      setCurrentGame(null);
    } catch (error) {
      console.error('Error canceling search:', error);
    }
  }, [session]);

  // Get current game status
  const getGameStatus = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/multiplayer');
      if (!response.ok) return;

      const data = await response.json();
      
      if (data.currentGame) {
        setCurrentGame(data.currentGame);
        if (data.currentGame.status === 'playing') {
          setIsSearching(false);
          setSearchConfig(prev => ({ ...prev, isSearching: false }));
        }
      }
    } catch (error) {
      console.error('Error getting game status:', error);
    }
  }, [session]);

  // Get friends
  const getFriends = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/friends');
      if (!response.ok) return;

      const data = await response.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
      setSentRequests(data.sentRequests || []);
    } catch (error) {
      console.error('Error getting friends:', error);
    }
  }, [session]);

  // Add friend
  const addFriend = useCallback(async (username: string) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add friend');
      }

      const data = await response.json();
      if (data.success) {
        setSentRequests(prev => [data.friendship, ...prev]);
      }

      return data;
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  }, [session]);

  // Respond to friend request
  const respondToFriendRequest = useCallback(async (friendshipId: string, action: 'accept' | 'decline' | 'block') => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action })
      });

      if (!response.ok) {
        throw new Error('Failed to respond to friend request');
      }

      const data = await response.json();
      
      // Update friends list
      await getFriends();

      return data;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  }, [session, getFriends]);

  // Get messages
  const getMessages = useCallback(async (page = 1, type?: string) => {
    if (!session?.user?.email) return;

    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (type) params.append('type', type);

      const response = await fetch(`/api/messages?${params}`);
      if (!response.ok) return;

      const data = await response.json();
      
      if (page === 1) {
        setConversations(data.conversations || []);
        setMessages(data.messages || []);
      } else {
        setMessages(prev => [...prev, ...(data.messages || [])]);
      }
      
      setUnreadCount(data.unreadCount || 0);

      return data;
    } catch (error) {
      console.error('Error getting messages:', error);
    }
  }, [session]);

  // Send message
  const sendMessage = useCallback(async (receiverId: string, content: string, type = 'chat') => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content, type })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [data.message, ...prev]);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [session]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds })
      });

      if (!response.ok) return;

      const data = await response.json();
      
      if (data.success) {
        setUnreadCount(prev => Math.max(0, prev - data.markedAsRead));
      }

      return data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [session]);

  // Poll for game updates
  useEffect(() => {
    if (!session || !isSearching) return;

    const interval = setInterval(getGameStatus, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [session, isSearching, getGameStatus]);

  // Initial data fetch
  useEffect(() => {
    if (session) {
      getFriends();
      getMessages();
    }
  }, [session, getFriends, getMessages]);

  return {
    // Game state
    currentGame,
    isSearching,
    searchConfig,
    
    // Actions
    searchGame,
    cancelSearch,
    getGameStatus,
    
    // Friends
    friends,
    pendingRequests,
    sentRequests,
    addFriend,
    respondToFriendRequest,
    getFriends,
    
    // Messages
    messages,
    unreadCount,
    sendMessage,
    markMessagesAsRead,
    getMessages
  };
}
