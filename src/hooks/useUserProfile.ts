import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';

interface UserProfile {
  user: {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    // SOLO Ranking
    soloElo: number;
    soloRankClass: string;
    soloBestElo: number;
    soloBestRankClass: string;
    soloCurrentStreak: number;
    soloBestStreak: number;
    // MULTIPLAYER Ranking
    multiplayerElo: number;
    multiplayerRankClass: string;
    multiplayerBestElo: number;
    multiplayerBestRankClass: string;
    // Profile
    bannerUrl?: string;
    selectedBadgeIds?: string;
    isTeacher: boolean;
    isOnline: boolean;
    lastSeenAt: string;
    hasCompletedOnboarding: boolean;
  };
  statistics?: any;
  recentGames?: any[];
  recentTests?: any[];
}

// Cache avec TTL de 2 minutes
const profileCache = new Map<string, { data: UserProfile; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export function useUserProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProfile = useCallback(async (forceRefresh = false) => {
    if (!session?.user?.email) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    const cacheKey = session.user.email;
    const cached = profileCache.get(cacheKey);
    
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setProfile(cached.data);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/profile', {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': forceRefresh ? 'no-cache' : 'max-age=120'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const data = await response.json();
      setProfile(data);
      
      // Update cache
      profileCache.set(cacheKey, { data, timestamp: Date.now() });
      
      // Clean old cache entries
      if (profileCache.size > 10) {
        const now = Date.now();
        for (const [key, value] of profileCache.entries()) {
          if (now - value.timestamp > CACHE_TTL) {
            profileCache.delete(key);
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfile();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [session?.user?.email, fetchProfile]);

  return {
    profile,
    isLoading: status === 'loading' || isLoading,
    error,
    refetch: () => fetchProfile(true)
  };
}
