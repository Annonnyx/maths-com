'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useBadges } from '@/hooks/useBadges';
import { 
  Trophy, User, Settings, Bell, Shield, LogOut, 
  ChevronRight, Edit2, Check, X, RotateCcw, Users, Zap, Target, Crown
} from 'lucide-react';
import { RANK_COLORS, RANK_BG_COLORS } from '@/lib/elo';

// Mock user data - will be replaced with API calls
const DEFAULT_PREFERENCES = {
  soundEffects: true,
  animations: true,
  darkMode: true,
  emailNotifications: true
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const { profile, isLoading, error, refetch } = useUserProfile();
  const { badges, isLoading: badgesLoading } = useBadges(profile?.user?.id);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'achievements'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.user?.displayName || '');

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour voir ton profil</h1>
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement de ton profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
          <p className="mb-4 text-red-400">{error}</p>
          <button 
            onClick={refetch}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors mr-2"
          >
            Réessayer
          </button>
          <Link href="/dashboard" className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  const user = profile.user;
  const stats = profile.statistics;

  const getRankColor = (rank: string) => {
    const tier = rank.charAt(0);
    return RANK_BG_COLORS[tier] || 'bg-gray-500/20 border-gray-500';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
            <Trophy className="w-6 h-6" />
            <span className="font-bold">Math.com</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Admin Button - Only for Ønyx */}
            {session?.user?.email === 'noe.barneron@gmail.com' && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 rounded-lg transition-colors"
              >
                <Crown className="w-4 h-4" />
                Admin
              </Link>
            )}
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg transition-colors border border-[#2a2a3a]"
            >
              <RotateCcw className="w-4 h-4" />
              Rafraîchir
            </button>
            <div className="text-right">
              <div className="text-sm font-semibold">{user.username}</div>
              <div className="text-xs text-gray-400">{user.elo} Elo</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/multiplayer"
            className="p-4 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all group"
          >
            <Users className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold">Multijoueur</div>
            <div className="text-xs text-gray-400">Joueurs en ligne</div>
          </Link>
          <Link
            href="/friends"
            className="p-4 bg-[#1e1e2e] rounded-xl border border-[#2a2a3a] hover:border-[#3a3a4a] transition-all group"
          >
            <Users className="w-6 h-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold">Amis</div>
            <div className="text-xs text-gray-400">Gérer</div>
          </Link>
          <Link
            href="/test"
            className="p-4 bg-[#1e1e2e] rounded-xl border border-[#2a2a3a] hover:border-[#3a2a3a] transition-all group"
          >
            <Zap className="w-6 h-6 text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold">Test</div>
            <div className="text-xs text-gray-400">S'entraîner</div>
          </Link>
          <Link
            href="/practice"
            className="p-4 bg-[#1e1e2e] rounded-xl border border-[#2a2a3a] hover:border-[#3a2a4a] transition-all group"
          >
            <Target className="w-6 h-6 text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold">Entraînement</div>
            <div className="text-xs text-gray-400">Libre</div>
          </Link>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Banner */}
          {user.bannerUrl && (
            <div className="w-full h-32 rounded-2xl mb-4 overflow-hidden">
              <img 
                src={user.bannerUrl} 
                alt="Bannière" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold">
              {user.displayName?.charAt(0) || user.username.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="px-3 py-1 bg-[#1e1e2e] border border-[#2a2a3a] rounded-lg focus:border-indigo-500 focus:outline-none transition-all"
                    />
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-1 text-green-400 hover:bg-green-500/20 rounded-lg rounded-lg"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        setDisplayName(user.displayName || '');
                        setIsEditing(false);
                      }}
                      className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#1e1e2e] rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-400">@{user.username}</p>
              <p className="text-sm text-gray-500 mt-1">
                Membre depuis {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className={`px-6 py-3 rounded-xl border text-center ${getRankColor(user.rankClass)}`}>
              <p className="text-sm text-gray-400">Classe</p>
              <p className="text-2xl font-bold">{user.rankClass}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#12121a] rounded-xl border border-[#2a2a3a]">
              <p className="text-gray-400 text-sm">Elo actuel</p>
              <p className="text-2xl font-bold text-indigo-400">{user.elo}</p>
            </div>
            <div className="p-4 bg-[#12121a] rounded-xl border border-[#2a2a3a]">
              <p className="text-gray-400 text-sm">Tests complétés</p>
              <p className="text-2xl font-bold">{stats?.totalTests || 0}</p>
            </div>
            <div className="p-4 bg-[#12121a] rounded-xl border border-[#2a2a3a]">
              <p className="text-gray-400 text-sm">Précision</p>
              <p className="text-2xl font-bold text-green-400">
                {stats ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
              </p>
            </div>
            <div className="p-4 bg-[#12121a] rounded-xl border border-[#2a2a3a]">
              <p className="text-gray-400 text-sm">Meilleure série</p>
              <p className="text-2xl font-bold text-orange-400">{user.bestStreak} 🔥</p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]">
            <h3 className="text-xl font-bold mb-4">Progression</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Vers {user.bestRankClass}</span>
                  <span>{user.elo} / {user.bestElo + 100}</span>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, Math.max(0, ((user.elo - 600) / (user.bestElo + 100 - 600)) * 100))}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]">
            <h3 className="text-xl font-bold mb-4">Activité récente</h3>
            <div className="space-y-3">
              {[
                { action: 'Test complété', detail: 'Score: 90%', time: 'Il y a 2 heures' },
                { action: 'Test échoué', detail: 'Score: 65%', time: 'Il y a 1 heure' },
                { action: 'Test réussi', detail: 'Score: 85%', time: 'Il y a 30 min' },
                { action: 'Test parfait', detail: 'Score: 100%', time: 'Il y a 5 min' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#1e1e2e] rounded-lg hover:bg-[#2a2a3a] transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.action.includes('parfait') ? 'bg-green-500/20' : activity.action.includes('échoué') ? 'bg-red-500/20' : 'bg-yellow-500/20'
                    }`}>
                      <span className="text-xs font-bold">
                        {activity.action.includes('parfait') ? '✓' : activity.action.includes('échoué') ? '✗' : '⚡'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{activity.action}</div>
                      <div className="text-xs text-gray-500">{activity.detail}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges / Succès */}
          <div className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]">
            <h3 className="text-xl font-bold mb-4">Badges ({badges.length})</h3>
            {badgesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Chargement des badges...</p>
              </div>
            ) : badges.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Aucun badge encore débloqué</p>
                <p className="text-sm mt-2">Continue à t'entraîner pour gagner des badges !</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((userBadge) => (
                  <div 
                    key={userBadge.id} 
                    className="p-4 bg-[#1e1e2e] rounded-xl border border-green-500/30"
                    style={{ borderColor: userBadge.badge.color + '40' }}
                  >
                    <div className="text-2xl mb-2 text-center" style={{ color: userBadge.badge.color }}>
                      {userBadge.badge.icon}
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{userBadge.badge.name}</div>
                      <div className="text-sm text-gray-400">{userBadge.badge.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Débloqué le {new Date(userBadge.earnedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Banner Configuration */}
            <div className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Configuration de la bannière (Combat)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">URL de la bannière</label>
                  <input
                    type="text"
                    defaultValue={user.bannerUrl || ''}
                    placeholder="https://exemple.com/ma-banniere.jpg"
                    className="w-full px-4 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white"
                    onBlur={(e) => {
                      // TODO: Save banner URL via API
                      fetch('/api/badges', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bannerUrl: e.target.value })
                      });
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cette bannière s'affichera avant chaque combat, style Clash Royale
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Badges affichés (max 3)</label>
                  <div className="flex gap-2 flex-wrap">
                    {badges.slice(0, 3).map((userBadge) => (
                      <div 
                        key={userBadge.id}
                        className="flex items-center gap-2 px-3 py-2 bg-[#1e1e2e] rounded-lg border border-[#3a3a4a]"
                        style={{ borderColor: userBadge.badge.color + '40' }}
                      >
                        <span style={{ color: userBadge.badge.color }}>{userBadge.badge.icon}</span>
                        <span className="text-sm">{userBadge.badge.name}</span>
                      </div>
                    ))}
                    {badges.length === 0 && (
                      <p className="text-sm text-gray-500">Débloque des badges pour les afficher sur ta bannière !</p>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 bg-[#0a0a0f] rounded-xl border border-[#3a3a4a]">
                  <p className="text-sm text-gray-400 mb-3">Aperçu bannière de combat :</p>
                  <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
                    {user.bannerUrl ? (
                      <img 
                        src={user.bannerUrl} 
                        alt="Bannière" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-between px-6 bg-gradient-to-r from-black/60 via-transparent to-black/60">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                          {user.displayName?.charAt(0) || user.username.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{user.displayName || user.username}</p>
                          <p className="text-sm text-purple-400">{user.rankClass} • {user.elo} Elo</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {badges.slice(0, 3).map((userBadge) => (
                          <div 
                            key={userBadge.id}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                            style={{ backgroundColor: userBadge.badge.color + '30' }}
                          >
                            {userBadge.badge.icon}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-6">
              <h3 className="text-xl font-bold mb-6">Paramètres</h3>
              <div className="space-y-6">
                {[
                  { key: 'soundEffects', label: 'Effets sonores', icon: Bell, pref: 'soundEffects' },
                  { key: 'animations', label: 'Animations', icon: Zap, pref: 'animations' },
                  { key: 'darkMode', label: 'Mode sombre', icon: Shield, pref: 'darkMode' },
                  { key: 'emailNotifications', label: 'Notifications email', icon: Settings, pref: 'emailNotifications' }
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between p-3 bg-[#1e1e2e] rounded-lg hover:bg-[#2a2a3a] transition-all">
                    <div className="flex items-center gap-3">
                      <pref.icon className="w-5 h-5 text-gray-400" />
                      <span>{pref.label}</span>
                    </div>
                    <button 
                      className={`w-12 h-6 rounded-full transition-all ${
                        DEFAULT_PREFERENCES[pref.key as keyof typeof DEFAULT_PREFERENCES] === true ? 'bg-indigo-500' : 'bg-[#2a2a3a]'
                      }`}
                    >
                      <div className={`w-full h-full rounded-full transition-all ${
                        DEFAULT_PREFERENCES[pref.key as keyof typeof DEFAULT_PREFERENCES] === true ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
