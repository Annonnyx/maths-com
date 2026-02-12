'use client';

import { useState, useEffect } from 'react';

interface BannerData {
  username: string;
  displayName?: string;
  bannerUrl?: string;
  selectedBadgeIds?: string[];
  elo: number;
  rankClass: string;
  isOnline?: boolean;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface PlayerBannerProps {
  player: BannerData;
  isOpponent?: boolean;
  showBadges?: boolean;
}

export function PlayerBanner({ player, isOpponent = false, showBadges = true }: PlayerBannerProps) {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    if (player.selectedBadgeIds && player.selectedBadgeIds.length > 0) {
      // Fetch badge details
      fetch('/api/badges')
        .then(res => res.json())
        .then(data => {
          const userBadges = data.badges || [];
          const selected = userBadges
            .filter((ub: any) => player.selectedBadgeIds?.includes(ub.badge.id))
            .map((ub: any) => ub.badge);
          setBadges(selected);
        })
        .catch(console.error);
    }
  }, [player.selectedBadgeIds]);

  // Parse banner gradient
  const getBannerStyle = () => {
    if (player.bannerUrl && player.bannerUrl.startsWith('gradient:')) {
      const gradient = player.bannerUrl.replace('gradient:', '');
      return { backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` };
    }
    return {};
  };

  const getBannerClass = () => {
    if (player.bannerUrl && player.bannerUrl.startsWith('gradient:')) {
      const gradient = player.bannerUrl.replace('gradient:', '');
      return `bg-gradient-to-r ${gradient}`;
    }
    // Default gradient based on rank
    const tier = player.rankClass.charAt(0);
    const gradients: Record<string, string> = {
      'S': 'from-yellow-500 to-orange-600',
      'A': 'from-orange-500 to-red-600',
      'B': 'from-purple-500 to-pink-600',
      'C': 'from-blue-500 to-indigo-600',
      'D': 'from-teal-500 to-cyan-600',
      'E': 'from-green-500 to-emerald-600',
      'F': 'from-gray-500 to-gray-700',
    };
    return `bg-gradient-to-r ${gradients[tier] || 'from-purple-600 to-indigo-600'}`;
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl ${getBannerClass()} p-6`}>
      {/* Badges */}
      {showBadges && badges.length > 0 && (
        <div className={`absolute top-3 ${isOpponent ? 'left-3' : 'right-3'} flex gap-2`}>
          {badges.slice(0, 3).map((badge, index) => (
            <div
              key={badge.id}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg animate-pulse"
              style={{ 
                backgroundColor: badge.color,
                animationDelay: `${index * 200}ms`,
                animationDuration: '2s'
              }}
              title={badge.name}
            >
              {badge.icon}
            </div>
          ))}
        </div>
      )}

      <div className={`flex items-center gap-4 ${isOpponent ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold backdrop-blur-sm">
          {(player.displayName || player.username).charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className={`${isOpponent ? 'text-right' : ''}`}>
          <h3 className="text-xl font-bold text-white drop-shadow-md">
            {player.displayName || player.username}
          </h3>
          <div className={`flex items-center gap-2 text-sm text-white/90 ${isOpponent ? 'justify-end' : ''}`}>
            <span className="font-semibold">{player.elo} Elo</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
              {player.rankClass}
            </span>
          </div>
        </div>

        {/* Online indicator */}
        {player.isOnline !== undefined && (
          <div className={`w-4 h-4 rounded-full ${player.isOnline ? 'bg-green-400' : 'bg-gray-400'} ${isOpponent ? 'ml-auto' : 'ml-auto'}`} />
        )}
      </div>
    </div>
  );
}

// Versus Banner for match start
interface VersusBannerProps {
  player1: BannerData;
  player2: BannerData;
}

export function VersusBanner({ player1, player2 }: VersusBannerProps) {
  return (
    <div className="relative">
      {/* VS Badge */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-3xl font-bold text-black shadow-xl border-4 border-[#1a1a2e] animate-pulse">
          VS
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <PlayerBanner player={player1} isOpponent={false} />
        <PlayerBanner player={player2} isOpponent={true} />
      </div>
    </div>
  );
}
