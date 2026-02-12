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
    console.log('🔍 useUserProfile - Session email:', session?.user?.email);
    console.log('🔍 useUserProfile - Session status:', status);
    
    if (!session?.user?.email) {
      console.log('❌ useUserProfile - No email in session, skipping fetch');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚀 useUserProfile - Fetching /api/profile...');
      const response = await fetch('/api/profile');
      console.log('📊 useUserProfile - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ useUserProfile - Error response:', errorText);
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ useUserProfile - Profile fetched:', !!data.user);
      setProfile(data);
    } catch (err) {
      console.error('💥 useUserProfile - Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useUserProfile - useEffect triggered, session?.user?.email:', session?.user?.email);
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
