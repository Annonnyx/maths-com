'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Trophy, Medal, TrendingUp, Users, ArrowLeft, Crown, Swords, Target, Clock, Search, ArrowUpDown } from 'lucide-react';
import { RANK_COLORS, RANK_BG_COLORS } from '@/lib/elo';

interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string | null;
  globalRank: number;
  stats: {
    winRate: number;
    accuracy: number;
    totalGames: number;
    currentElo: number;
    currentRank: string;
    bestElo: number;
    bestRank: string;
  };
  isOnline: boolean;
  lastSeenAt: string;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  userRank: number | null;
  currentUser: {
    id: string;
    username: string;
    displayName: string | null;
    stats: {
      currentElo: number;
      currentRank: string;
      totalGames: number;
    };
  } | null;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<'solo' | 'multiplayer'>('multiplayer');
  const [timeFrame, setTimeFrame] = useState<'all' | 'week' | 'month'>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scope, setScope] = useState<'global' | 'friends'>('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'elo' | 'games' | 'winRate' | 'accuracy'>('elo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/leaderboard?type=${activeTab}&timeFrame=${timeFrame}&page=${page}&limit=20&scope=${scope}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data: LeaderboardResponse = await response.json();
      
      setLeaderboard(data.leaderboard);
      setUserRank(data.userRank);
      setCurrentUser(data.currentUser);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchLeaderboard();
    }
  }, [session, activeTab, timeFrame, page, scope]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  const getRankColor = (rank: string) => {
    const tier = rank.charAt(0);
    return RANK_COLORS[tier] || 'text-gray-400';
  };

  const getRankBgColor = (rank: string) => {
    const tier = rank.charAt(0);
    return RANK_BG_COLORS[tier] || 'bg-gray-500/20 border-gray-500';
  };

  // Filter and sort leaderboard client-side
  const processedLeaderboard = leaderboard
    .filter(entry => {
      if (!searchQuery.trim()) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        entry.username.toLowerCase().includes(searchLower) ||
        (entry.displayName?.toLowerCase() || '').includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'elo':
          comparison = a.stats.currentElo - b.stats.currentElo;
          break;
        case 'games':
          comparison = a.stats.totalGames - b.stats.totalGames;
          break;
        case 'winRate':
          comparison = a.stats.winRate - b.stats.winRate;
          break;
        case 'accuracy':
          comparison = a.stats.accuracy - b.stats.accuracy;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const toggleSort = (field: 'elo' | 'games' | 'winRate' | 'accuracy') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour voir le classement</h1>
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>
          
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Classement
          </h1>
          
          <div className="text-right">
            <div className="text-sm font-semibold">{profile?.user?.username}</div>
            <div className="text-xs text-gray-400">
              {activeTab === 'multiplayer' ? (profile?.user as any)?.multiplayerElo || 400 : profile?.user?.elo} Elo
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* User Rank Card */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl border border-indigo-500/30 p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-indigo-400">
                  #{userRank || 'N/A'}
                </div>
                <div>
                  <div className="font-semibold">{currentUser.displayName || currentUser.username}</div>
                  <div className="text-sm text-gray-400">
                    {currentUser.stats.totalGames} parties • {currentUser.stats.currentElo} Elo
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl border text-center ${getRankBgColor(currentUser.stats.currentRank)}`}>
                <div className="text-sm font-bold">{currentUser.stats.currentRank}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Type Tabs */}
          <div className="flex bg-[#1e1e2e] rounded-xl p-1">
            <button
              onClick={() => setActiveTab('solo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'solo' 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4" />
              Solo
            </button>
            <button
              onClick={() => setActiveTab('multiplayer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'multiplayer' 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Swords className="w-4 h-4" />
              Multijoueur
            </button>
          </div>

          {/* Time Frame */}
          <div className="flex bg-[#1e1e2e] rounded-xl p-1">
            <button
              onClick={() => setTimeFrame('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeFrame === 'all' 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tout le temps
            </button>
            <button
              onClick={() => setTimeFrame('week')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeFrame === 'week' 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setTimeFrame('month')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeFrame === 'month' 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Ce mois
            </button>
          </div>

          {/* Scope - Global / Friends */}
          <div className="flex bg-[#1e1e2e] rounded-xl p-1">
            <button
              onClick={() => setScope('global')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                scope === 'global' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Global
            </button>
            <button
              onClick={() => setScope('friends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                scope === 'friends' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Amis
            </button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un joueur..."
              className="w-full pl-10 pr-4 py-3 bg-[#1e1e2e] border border-[#3a3a4a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Sort Buttons */}
          <div className="flex bg-[#1e1e2e] rounded-xl p-1">
            <button
              onClick={() => toggleSort('elo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                sortBy === 'elo' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowUpDown className={`w-4 h-4 ${sortBy === 'elo' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
              Elo
            </button>
            <button
              onClick={() => toggleSort('games')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                sortBy === 'games' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowUpDown className={`w-4 h-4 ${sortBy === 'games' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
              Parties
            </button>
            {activeTab === 'multiplayer' && (
              <button
                onClick={() => toggleSort('winRate')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  sortBy === 'winRate' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <ArrowUpDown className={`w-4 h-4 ${sortBy === 'winRate' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                Win Rate
              </button>
            )}
            <button
              onClick={() => toggleSort('accuracy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                sortBy === 'accuracy' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowUpDown className={`w-4 h-4 ${sortBy === 'accuracy' && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
              Précision
            </button>
          </div>
        </div>
        <div className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">
              Classement {scope === 'friends' ? 'Amis' : activeTab === 'multiplayer' ? 'Multijoueur' : 'Solo'} - {timeFrame === 'all' ? 'Tout le temps' : timeFrame === 'week' ? 'Cette semaine' : 'Ce mois'}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p>Chargement du classement...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Aucun joueur trouvé pour cette période</p>
              </div>
            ) : (
              <div className="space-y-3">
                {processedLeaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-[#2a2a3a] ${
                      currentUser?.id === entry.id ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-[#2a2a3a]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-12 text-center">
                        {getRankIcon(entry.globalRank)}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            <Link 
                              href={`/users/${entry.id}`}
                              className="hover:text-indigo-400 transition-colors"
                            >
                              {entry.displayName || entry.username}
                            </Link>
                            {entry.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {entry.stats.totalGames} parties
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-lg font-bold">{entry.stats.currentElo}</div>
                        <div className="text-xs text-gray-400">Elo</div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-lg border text-center ${getRankBgColor(entry.stats.currentRank)}`}>
                        <div className="text-sm font-bold">{entry.stats.currentRank}</div>
                      </div>

                      {activeTab === 'multiplayer' ? (
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">{entry.stats.winRate}%</div>
                          <div className="text-xs text-gray-400">Victoires</div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-400">{entry.stats.accuracy}%</div>
                          <div className="text-xs text-gray-400">Précision</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-[#2a2a3a] rounded-lg hover:bg-[#3a3a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-400">
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-[#2a2a3a] rounded-lg hover:bg-[#3a3a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
