'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Target, Clock, TrendingUp, Users, Calendar, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { PlayerBanner } from '@/components/PlayerBanner';

interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  selectedBadgeIds?: string | string[] | null;
  userBadges?: Array<{
    id: string;
    earnedAt: string;
    expiresAt: string | null;
    badge: {
      id: string;
      name: string;
      icon: string;
      color: string;
    };
  }>;
  elo: number;
  rankClass: string;
  bestElo: number;
  bestRankClass: string;
  currentStreak: number;
  bestStreak: number;
  multiplayerElo?: number;
  multiplayerRankClass?: string;
  multiplayerGames?: number;
  multiplayerWins?: number;
  multiplayerLosses?: number;
  createdAt: string;
  lastSeenAt?: string;
  isOnline?: boolean;
}

interface GameHistory {
  id: string;
  type: 'solo' | 'multiplayer';
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number;
  completedAt: string;
  difficulty: number;
  operation?: string;
  opponent?: {
    username: string;
    displayName: string | null;
  };
  result?: 'win' | 'loss' | 'draw';
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'solo' | 'multiplayer' | 'all'>('all');
  const [isAlreadyFriend, setIsAlreadyFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  const userId = params.id as string;

  const friendRequestsEnabled = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('friends') !== '0';

  const selectedBadgeIds: string[] = (() => {
    if (!profile?.selectedBadgeIds) return [];
    if (Array.isArray(profile.selectedBadgeIds)) return profile.selectedBadgeIds;
    if (typeof profile.selectedBadgeIds === 'string') {
      try {
        const parsed = JSON.parse(profile.selectedBadgeIds);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  useEffect(() => {
    if (!userId) return;
    fetchUserProfile();
    fetchGameHistory();
    checkFriendship();
  }, [userId]);

  const checkFriendship = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/friends');
      if (response.ok) {
        const data = await response.json();
        const friends = data.friends || [];
        const isFriend = friends.some((friend: any) => friend.user.id === userId);
        setIsAlreadyFriend(isFriend);
      }
    } catch (error) {
      console.error('Error checking friendship:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Utilisateur non trouvé');
      }
      const data = await response.json();
      setProfile(data.user);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameHistory = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/games`);
      if (!response.ok) return;
      const data = await response.json();
      setGameHistory(data.games || []);
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  };

  const sendFriendRequest = async () => {
    if (!profile || !session?.user) return;
    if (!friendRequestsEnabled) return;
    if (isAlreadyFriend || friendRequestSent) return;

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: profile.username })
      });

      if (response.ok) {
        setFriendRequestSent(true);
        await checkFriendship();
        return;
      }

      const data = await response.json().catch(() => null);
      if (data?.error === 'Already friends') {
        setIsAlreadyFriend(true);
        return;
      }
      if (data?.error === 'Friend request already sent') {
        setFriendRequestSent(true);
        return;
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return `Il y a ${Math.floor(diffMins / 1440)}j`;
  };

  const getRankColor = (rankClass: string) => {
    const colors: Record<string, string> = {
      'S+': 'text-yellow-400',
      'S': 'text-yellow-500',
      'S-': 'text-orange-400',
      'A+': 'text-green-400',
      'A': 'text-green-500',
      'A-': 'text-green-600',
      'B+': 'text-blue-400',
      'B': 'text-blue-500',
      'B-': 'text-blue-600',
      'C+': 'text-purple-400',
      'C': 'text-purple-500',
      'C-': 'text-purple-600',
      'D+': 'text-gray-400',
      'D': 'text-gray-500',
      'D-': 'text-gray-600',
      'F+': 'text-red-400',
      'F': 'text-red-500',
      'F-': 'text-red-600'
    };
    return colors[rankClass] || 'text-gray-500';
  };

  const filteredGames = gameHistory.filter(game => {
    if (activeTab === 'all') return true;
    return game.type === activeTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Utilisateur non trouvé</h1>
          <Link href="/leaderboard" className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Retour au classement
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.email === profile.email;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/leaderboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Retour
          </Link>
          
          <h1 className="text-2xl font-bold">Profil de {profile.displayName || profile.username}</h1>
          
          <div className="flex items-center gap-3">
            {profile.isOnline && (
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">En ligne</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl border border-indigo-500/30 p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-6">
              <PlayerBanner
                player={{
                  username: profile.username,
                  displayName: profile.displayName || undefined,
                  bannerUrl: profile.bannerUrl || undefined,
                  selectedBadgeIds,
                  userBadges: profile.userBadges?.map((ub) => ({ badge: ub.badge })) ?? [],
                  elo: profile.elo,
                  rankClass: profile.rankClass,
                  isOnline: profile.isOnline
                }}
                showBadges
              />
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold mb-2">{profile.elo} Elo</div>
              {profile.multiplayerElo && (
                <div className="text-lg text-gray-400">{profile.multiplayerElo} Elo Multi</div>
              )}
              <div className="text-sm text-gray-500">
                Membre depuis {formatDate(profile.createdAt)}
              </div>
              {!isOwnProfile && friendRequestsEnabled && !isAlreadyFriend && (
                <button
                  onClick={sendFriendRequest}
                  disabled={friendRequestSent}
                  className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
                    friendRequestSent
                      ? 'bg-indigo-600/40 text-indigo-200 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {friendRequestSent ? 'Demande envoyée' : 'Ajouter en ami'}
                </button>
              )}
              {!isOwnProfile && !friendRequestsEnabled && (
                <div className="mt-4 px-4 py-2 bg-gray-600/20 text-gray-300 rounded-lg">
                  Demandes d'ami désactivées
                </div>
              )}
              {!isOwnProfile && isAlreadyFriend && (
                <div className="mt-4 px-4 py-2 bg-green-600/20 text-green-400 rounded-lg">
                  Déjà ami
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        {profile.userBadges && profile.userBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3a] p-6 mb-8"
          >
            <h3 className="text-xl font-bold mb-4">Badges</h3>
            <div className="flex flex-wrap gap-3">
              {[...profile.userBadges]
                .sort((a, b) => {
                  const aSelected = selectedBadgeIds.includes(a.badge.id) ? 1 : 0;
                  const bSelected = selectedBadgeIds.includes(b.badge.id) ? 1 : 0;
                  if (aSelected !== bSelected) return bSelected - aSelected;
                  return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
                })
                .map((ub) => {
                  const isSelected = selectedBadgeIds.includes(ub.badge.id);
                  return (
                    <div
                      key={ub.id}
                      className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${
                        isSelected
                          ? 'border-yellow-400/60 bg-yellow-400/10'
                          : 'border-[#2a2a3a] bg-[#12121a]'
                      }`}
                      title={ub.badge.name}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: ub.badge.color }}
                      >
                        {ub.badge.icon}
                      </div>
                      <div className="text-sm font-semibold">
                        {ub.badge.name}
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Solo Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3a] p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Stats Solo
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Meilleur Elo</span>
                <span className="font-semibold">{profile.bestElo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Série actuelle</span>
                <span className="font-semibold">{profile.currentStreak}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Meilleure série</span>
                <span className="font-semibold">{profile.bestStreak}</span>
              </div>
            </div>
          </motion.div>

          {/* Multiplayer Stats */}
          {profile.multiplayerGames !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3a] p-6"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Stats Multi
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Parties jouées</span>
                  <span className="font-semibold">{profile.multiplayerGames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Victoires</span>
                  <span className="font-semibold text-green-400">{profile.multiplayerWins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Défaites</span>
                  <span className="font-semibold text-red-400">{profile.multiplayerLosses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taux de victoire</span>
                  <span className="font-semibold text-blue-400">
                    {profile.multiplayerGames && profile.multiplayerWins ? 
                      Math.round((profile.multiplayerWins / profile.multiplayerGames) * 100) : 0}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3a] p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Activité
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Dernière connexion</span>
                <span className="font-semibold">
                  {profile.lastSeenAt ? formatTime(profile.lastSeenAt) : 'Jamais'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Statut</span>
                <span className={`font-semibold ${profile.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                  {profile.isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Game History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1e1e2e] rounded-2xl border border-[#2a2a3a] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Historique des parties
            </h3>
            <div className="flex gap-2">
              {(['all', 'solo', 'multiplayer'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab
                      ? 'bg-indigo-500 text-white'
                      : 'bg-[#2a2a3a] text-gray-400 hover:bg-[#3a3a4a]'
                  }`}
                >
                  {tab === 'all' ? 'Toutes' : tab === 'solo' ? 'Solo' : 'Multi'}
                </button>
              ))}
            </div>
          </div>

          {filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Aucune partie trouvée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="p-4 bg-[#12121a] rounded-xl border border-[#2a2a3a] hover:bg-[#2a2a3a] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        game.type === 'solo' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                      }`}>
                        {game.type === 'solo' ? 
                          <Target className="w-5 h-5 text-blue-400" /> : 
                          <Users className="w-5 h-5 text-purple-400" />
                        }
                      </div>
                      <div>
                        <div className="font-semibold">
                          {game.type === 'solo' ? 'Partie Solo' : `Contre ${game.opponent?.displayName || game.opponent?.username}`}
                        </div>
                        <div className="text-sm text-gray-400">
                          {game.score}/{game.totalQuestions} • {Math.round(game.accuracy)}% • {Math.round(game.timeSpent / 1000)}s
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        game.result === 'win' ? 'text-green-400' : 
                        game.result === 'loss' ? 'text-red-400' : 
                        'text-gray-400'
                      }`}>
                        {game.result === 'win' ? 'Victoire' : game.result === 'loss' ? 'Défaite' : 'Match nul'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(game.completedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
