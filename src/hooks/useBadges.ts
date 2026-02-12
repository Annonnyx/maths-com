import { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  requirement?: string;
  isCustom: boolean;
  createdAt: string;
}

interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

export function useBadges(userId?: string) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch user's badges
      const userBadgesRes = await fetch(`/api/badges?userId=${userId}`);
      if (userBadgesRes.ok) {
        const userBadgesData = await userBadgesRes.json();
        setBadges(userBadgesData.badges || []);
      }

      // Fetch all available badges
      const allBadgesRes = await fetch('/api/badges');
      if (allBadgesRes.ok) {
        const allBadgesData = await allBadgesRes.json();
        setAllBadges(allBadgesData.badges || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch badges');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBadges();
    }
  }, [userId]);

  return {
    badges,
    allBadges,
    isLoading,
    error,
    refetch: fetchBadges
  };
}
