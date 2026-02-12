import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface UserProfile {
  user: {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    elo: number;
    rankClass: string;
    bestElo: number;
    bestRankClass: string;
    currentStreak: number;
    bestStreak: number;
    bannerUrl?: string;
    selectedBadgeIds?: string;
  };
  statistics?: any;
  recentTests?: any[];
  recentGames?: any[];
}

export function useUserProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!session?.user?.email) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session?.user?.email]);

  return {
    profile,
    isLoading: status === 'loading' || isLoading,
    error,
    refetch: fetchProfile
  };
}
