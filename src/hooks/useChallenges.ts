import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Types
export interface Challenge {
  id: string;
  status: string;
  gameType: string;
  timeControl: string;
  timeLimit: number;
  questionCount: number;
  difficulty: string;
  createdAt: string;
  expiresAt: string;
  respondedAt: string | null;
  isChallenger: boolean;
  opponent: {
    id: string;
    username: string;
    displayName: string | null;
    isOnline: boolean;
    lastSeenAt: string;
    multiplayerElo: number;
    multiplayerRankClass: string;
  };
  game?: {
    id: string;
  };
}

export function useChallenges() {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Challenge[]>([]);
  const [pendingSent, setPendingSent] = useState<Challenge[]>([]);
  const [accepted, setAccepted] = useState<Challenge[]>([]);
  const [declined, setDeclined] = useState<Challenge[]>([]);
  const [expired, setExpired] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);

  // Get all challenges
  const getChallenges = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);
      const response = await fetch('/api/challenges');
      if (!response.ok) throw new Error('Failed to fetch challenges');

      const data = await response.json();
      
      setChallenges(data.challenges || []);
      setPendingReceived(data.pendingReceived || []);
      setPendingSent(data.pendingSent || []);
      setAccepted(data.accepted || []);
      setDeclined(data.declined || []);
      setExpired(data.expired || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Create a challenge
  const createChallenge = useCallback(async (
    challengedId: string,
    gameType: string,
    timeControl: string,
    timeLimit: number,
    questionCount: number,
    difficulty: string
  ) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengedId,
          gameType,
          timeControl,
          timeLimit,
          questionCount,
          difficulty
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create challenge');
      }

      const data = await response.json();
      await getChallenges(); // Refresh challenges list
      
      return data;
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }, [session, getChallenges]);

  // Respond to a challenge
  const respondToChallenge = useCallback(async (challengeId: string, action: 'accept' | 'decline') => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/challenges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, action })
      });

      if (!response.ok) {
        throw new Error('Failed to respond to challenge');
      }

      const data = await response.json();
      await getChallenges(); // Refresh challenges list
      
      return data;
    } catch (error: any) {
      console.error('Error responding to challenge:', error);
      throw error;
    }
  }, [session, getChallenges]);

  // Initial fetch
  useEffect(() => {
    if (session) {
      getChallenges();
    }
  }, [session, getChallenges]);

  return {
    challenges,
    pendingReceived,
    pendingSent,
    accepted,
    declined,
    expired,
    loading,
    getChallenges,
    createChallenge,
    respondToChallenge
  };
}
