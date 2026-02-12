'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useBadges } from '@/hooks/useBadges';
import { 
  Trophy, User, Settings, Bell, Shield, LogOut, 
  ChevronRight, Edit2, Check, X, RotateCcw, Users, Zap, Target, Crown, Medal,
  Palette, Image as ImageIcon, Star, Award
} from 'lucide-react';
import { RANK_COLORS, RANK_BG_COLORS } from '@/lib/elo';
import { useUserPreferences } from '@/hooks/useLocalStorage';
import { useTheme } from '@/contexts/ThemeContext';

// Mock user data - will be replaced with API calls
const DEFAULT_PREFERENCES = {
  soundEffects: true,
  animations: true,
  darkMode: true,
  emailNotifications: true
};

// Inner component that uses search params
function ProfileContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { profile, isLoading, error, refetch } = useUserProfile();
  const { badges, isLoading: badgesLoading } = useBadges(profile?.user?.id);
  
  // Get tab from URL parameter
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'banner' | 'settings' | 'admin'>(
    (urlTab === 'banner' || urlTab === 'achievements' || urlTab === 'settings') ? urlTab : 'overview'
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.user?.displayName || '');
  
  // Banner customization state (local until saved)
  const [selectedBannerGradient, setSelectedBannerGradient] = useState('from-purple-600 to-indigo-600');
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>([]);
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [hasBannerChanges, setHasBannerChanges] = useState(false);
  
  // Custom banners from admin
  const [customBanners, setCustomBanners] = useState<Array<{id: string, name: string, imageUrl: string, thumbnailUrl?: string, isPremium: boolean}>>([]);
  const [selectedCustomBanner, setSelectedCustomBanner] = useState<string | null>(null);
  const [activeBannerTab, setActiveBannerTab] = useState<'gradient' | 'custom'>('gradient');
  
  // Use real preferences hooks
  const { preferences: userPrefs, setPreferences: setUserPrefs } = useUserPreferences();
  const { theme, toggleTheme } = useTheme();

  // Initialize banner state from profile data
  useEffect(() => {
    if (profile?.user?.bannerUrl) {
      if (profile.user.bannerUrl.startsWith('gradient:')) {
        const gradient = profile.user.bannerUrl.replace('gradient:', '');
        setSelectedBannerGradient(gradient);
        setActiveBannerTab('gradient');
      } else {
        // It's a custom banner
        setSelectedCustomBanner(profile.user.bannerUrl);
        setActiveBannerTab('custom');
      }
    }
    if (profile?.user?.selectedBadgeIds) {
      try {
        const ids = JSON.parse(profile.user.selectedBadgeIds);
        setSelectedBadgeIds(ids);
      } catch {
        setSelectedBadgeIds([]);
      }
    }
  }, [profile?.user?.bannerUrl, profile?.user?.selectedBadgeIds]);

  // Load custom banners when banner tab is active - filter premium for non-admin users
  useEffect(() => {
    if (activeTab === 'banner') {
      fetch('/api/banners')
        .then(res => res.json())
        .then(data => {
          if (data.banners) {
            // Filter premium banners - only show to admin for now
            const isAdmin = session?.user?.email === 'noe.barneron@gmail.com';
            const userBannerUrl = profile?.user?.bannerUrl;
            
            const filteredBanners = data.banners.filter((banner: any) => {
              // Always show non-premium banners
              if (!banner.isPremium) return true;
              // Show premium banners only to admin
              if (isAdmin) return true;
              // Allow user to see their currently equipped premium banner
              if (userBannerUrl && banner.imageUrl === userBannerUrl) return true;
              return false;
            });
            
            setCustomBanners(filteredBanners);
          }
        })
        .catch(console.error);
    }
  }, [activeTab, session?.user?.email, profile?.user?.bannerUrl]);

  // Reset hasChanges when switching to banner tab
  useEffect(() => {
    if (activeTab === 'banner') {
      setHasBannerChanges(false);
    }
  }, [activeTab]);

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
            <Trophy className="w-6 h-6" />
            <span className="font-bold">Math.com</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Admin Crown Icon - Only for Ønyx */}
            {session?.user?.email === 'noe.barneron@gmail.com' && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 rounded-lg transition-colors"
                title="Panneau Admin"
              >
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-card hover:bg-muted border border-border rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Rafraîchir
            </button>
            <div className="text-right">
              <div className="text-sm font-semibold">{profile?.user?.username}</div>
              <div className="text-xs text-muted-foreground">{profile?.user?.elo} Elo</div>
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
            <div className="text-xs text-muted-foreground">Joueurs en ligne</div>
          </Link>
          <Link
            href="/friends"
            className="p-4 bg-card rounded-xl border border-border hover:border-muted transition-all group"
          >
            <Users className="w-6 h-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold">Amis</div>
            <div className="text-xs text-muted-foreground">Gérer</div>
          </Link>
          <Link
            href="/test"
            className="p-4 bg-card rounded-xl border border-border hover:border-muted transition-all group"
          >
            <Zap className="w-6 h-6 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold">Test</div>
            <div className="text-xs text-muted-foreground">S'entraîner</div>
          </Link>
          <Link
            href="/practice"
            className="p-4 bg-card rounded-xl border border-border hover:border-muted transition-all group"
          >
            <Target className="w-6 h-6 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold">Entraînement</div>
            <div className="text-xs text-muted-foreground">Libre</div>
          </Link>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 bg-card rounded-xl p-1 overflow-x-auto">
          {[
            { id: 'overview' as const, label: 'Profil', icon: User },
            { id: 'achievements' as const, label: 'Succès', icon: Medal },
            { id: 'banner' as const, label: 'Bannière', icon: Palette },
            { id: 'settings' as const, label: 'Paramètres', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Banner */}
            {profile?.user?.bannerUrl && (
              <div className="w-full h-32 rounded-2xl mb-4 overflow-hidden">
                <img 
                  src={profile?.user?.bannerUrl} 
                  alt="Bannière" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold">
              {profile?.user?.displayName?.charAt(0) || profile?.user?.username?.charAt(0) || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="px-3 py-1 bg-card border border-border rounded-lg focus:border-primary focus:outline-none transition-all"
                    />
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-1 text-green-400 hover:bg-green-500/20 rounded-lg"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        setDisplayName(profile?.user?.displayName || '');
                        setIsEditing(false);
                      }}
                      className="p-1 text-red-400 hover:bg-red-500/20 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-muted-foreground">@{profile?.user?.username}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Membre depuis {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className={`px-6 py-3 rounded-xl border text-center ${getRankColor(profile?.user?.rankClass)}`}>
              <p className="text-sm text-muted-foreground">Classe</p>
              <p className="text-2xl font-bold">{profile?.user?.rankClass}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground text-sm">Elo actuel</p>
              <p className="text-2xl font-bold text-primary">{profile?.user?.elo}</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground text-sm">Tests complétés</p>
              <p className="text-2xl font-bold">{stats?.totalTests || 0}</p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground text-sm">Précision</p>
              <p className="text-2xl font-bold text-green-400">
                {stats ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
              </p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground text-sm">Meilleure série</p>
              <p className="text-2xl font-bold text-orange-400">{profile?.user?.bestStreak} 🔥</p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h3 className="text-xl font-bold mb-4">Progression</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Vers {profile?.user?.bestRankClass}</span>
                  <span>{profile?.user?.elo} / {profile?.user?.bestElo + 100}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, Math.max(0, ((profile?.user?.elo - 600) / (profile?.user?.bestElo + 100 - 600)) * 100))}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h3 className="text-xl font-bold mb-4">Activité récente</h3>
            <div className="space-y-3">
              {[
                { action: 'Test complété', detail: 'Score: 90%', time: 'Il y a 2 heures' },
                { action: 'Test échoué', detail: 'Score: 65%', time: 'Il y a 1 heure' },
                { action: 'Test réussi', detail: 'Score: 85%', time: 'Il y a 30 min' },
                { action: 'Test parfait', detail: 'Score: 100%', time: 'Il y a 5 min' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-card transition-all">
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
                      <div className="text-xs text-muted-foreground">{activity.detail}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges / Succès */}
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h3 className="text-xl font-bold mb-4">Badges ({badges.length})</h3>
            {badgesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Chargement des badges...</p>
              </div>
            ) : badges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun badge encore débloqué</p>
                <p className="text-sm mt-2">Continue à t'entraîner pour gagner des badges !</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((userBadge) => (
                  <div 
                    key={userBadge.id} 
                    className="p-4 bg-muted rounded-xl border border-green-500/30"
                    style={{ borderColor: userBadge.badge.color + '40' }}
                  >
                    <div className="text-2xl mb-2 text-center" style={{ color: userBadge.badge.color }}>
                      {userBadge.badge.icon}
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{userBadge.badge.name}</div>
                      <div className="text-sm text-muted-foreground">{userBadge.badge.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Débloqué le {new Date(userBadge.earnedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 bg-card rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Medal className="w-8 h-8 text-yellow-400" />
                Tes Achievements
                <span className="text-lg font-normal text-muted-foreground">({badges.length})</span>
              </h2>
              
              {badgesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement de tes achievements...</p>
                </div>
              ) : badges.length === 0 ? (
                <div className="text-center py-12">
                  <Medal className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-3">Aucun achievement débloqué</h3>
                  <p className="text-muted-foreground mb-6">
                    Continue à t'entraîner pour débloquer des badges et montrer tes compétences !
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link
                      href="/test"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                    >
                      <Zap className="w-5 h-5" />
                      Test d'évaluation
                    </Link>
                    <Link
                      href="/practice"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-muted border border-border rounded-lg font-semibold transition-colors"
                    >
                      <Target className="w-5 h-5" />
                      Entraînement libre
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Achievement Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map((userBadge) => (
                      <motion.div
                        key={userBadge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-5 bg-muted rounded-xl border border-border hover:border-primary/50 transition-all group"
                        style={{ 
                          borderColor: userBadge.badge.color + '40',
                          boxShadow: userBadge.badge.isTemporary ? `0 0 20px ${userBadge.badge.color}20` : undefined
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: userBadge.badge.color }}
                          >
                            {userBadge.badge.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-white text-lg">
                                {userBadge.badge.name}
                              </h3>
                              {userBadge.badge.isTemporary && (
                                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                                  ⏰ Temporaire
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {userBadge.badge.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-1 bg-muted rounded-full text-muted-foreground">
                                  {userBadge.badge.category}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(userBadge.earnedAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Achievement Progress */}
                  <div className="p-6 bg-muted rounded-xl border border-border">
                    <h3 className="text-lg font-bold mb-4">Progrès des achievements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-card rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                          <span className="font-medium">Classe actuelle</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-400">{profile?.user?.rankClass}</div>
                        <div className="text-sm text-muted-foreground">Prochaine classe: {profile?.user?.bestRankClass}</div>
                      </div>
                      <div className="p-4 bg-card rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-green-400" />
                          <span className="font-medium">Tests complétés</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">{stats?.totalTests || 0}</div>
                        <div className="text-sm text-muted-foreground">Prochain palier: 100 tests</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Banner Tab - Banner Customization with Save Button */}
        {activeTab === 'banner' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Banner Preview - Shows local state */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Aperçu de ta bannière
                </h3>
                {hasBannerChanges && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                    Modifications non sauvegardées
                  </span>
                )}
              </div>
              
              {activeBannerTab === 'custom' && selectedCustomBanner ? (
                <div className="rounded-xl overflow-hidden relative h-32">
                  <img 
                    src={selectedCustomBanner} 
                    alt="Custom Banner" 
                    className="w-full h-full object-cover"
                  />
                  {/* Dark gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                  
                  {/* Avatar and info overlay */}
                  <div className="absolute inset-0 flex items-center gap-4 p-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                        {profile?.user?.displayName?.charAt(0) || profile?.user?.username?.charAt(0) || '?'}
                      </div>
                      {/* Top 1 Crowns */}
                      {badges.some(b => b.badge.id === 'top_1_solo') && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs shadow-lg" title="Top 1 Solo Mondial">
                          👑
                        </div>
                      )}
                      {badges.some(b => b.badge.id === 'top_1_multi') && (
                        <div className="absolute -bottom-1 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs shadow-lg" title="Top 1 Multi Mondial">
                          👑
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white drop-shadow-md">{profile?.user?.displayName || profile?.user?.username}</h3>
                      <p className="text-white/80 drop-shadow-md">{profile?.user?.rankClass} • {profile?.user?.elo} Elo</p>
                    </div>
                  </div>
                  
                  {/* Badges overlay - top right */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {selectedBadgeIds.map((badgeId) => {
                      const userBadge = badges.find(b => b.badge.id === badgeId);
                      if (!userBadge) return null;
                      return (
                        <div
                          key={badgeId}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg"
                          style={{ backgroundColor: userBadge.badge.color }}
                          title={userBadge.badge.name}
                        >
                          {userBadge.badge.icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className={`bg-gradient-to-r ${selectedBannerGradient} rounded-xl p-6 relative overflow-hidden`}>
                  {/* Badges on banner */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {selectedBadgeIds.map((badgeId) => {
                      const userBadge = badges.find(b => b.badge.id === badgeId);
                      if (!userBadge) return null;
                      return (
                        <div
                          key={badgeId}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg"
                          style={{ backgroundColor: userBadge.badge.color }}
                          title={userBadge.badge.name}
                        >
                          {userBadge.badge.icon}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                        {profile?.user?.displayName?.charAt(0) || profile?.user?.username?.charAt(0) || '?'}
                      </div>
                      {/* Top 1 Crowns */}
                      {badges.some(b => b.badge.id === 'top_1_solo') && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs shadow-lg" title="Top 1 Solo Mondial">
                          👑
                        </div>
                      )}
                      {badges.some(b => b.badge.id === 'top_1_multi') && (
                        <div className="absolute -bottom-1 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs shadow-lg" title="Top 1 Multi Mondial">
                          👑
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{profile?.user?.displayName || profile?.user?.username}</h3>
                      <p className="text-white/80">{profile?.user?.rankClass} • {profile?.user?.elo} Elo</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Banner Type Tabs */}
            <div className="flex gap-2 bg-card rounded-xl p-1">
              <button
                onClick={() => {
                  setActiveBannerTab('gradient');
                  setSelectedCustomBanner(null);
                  setHasBannerChanges(true);
                }}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  activeBannerTab === 'gradient'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Dégradés
              </button>
              <button
                onClick={() => {
                  setActiveBannerTab('custom');
                  setHasBannerChanges(true);
                }}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  activeBannerTab === 'custom'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Bannières perso ({customBanners.length})
              </button>
            </div>

            {/* Gradient Selection */}
            {activeBannerTab === 'gradient' && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Choisir un dégradé
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'default', name: 'Classique', gradient: 'from-purple-600 to-indigo-600' },
                    { id: 'gold', name: 'Or', gradient: 'from-yellow-500 to-orange-600' },
                    { id: 'fire', name: 'Feu', gradient: 'from-red-500 to-orange-500' },
                    { id: 'ocean', name: 'Océan', gradient: 'from-blue-500 to-cyan-500' },
                    { id: 'forest', name: 'Forêt', gradient: 'from-green-500 to-emerald-600' },
                    { id: 'dark', name: 'Sombre', gradient: 'from-gray-700 to-gray-900' },
                    { id: 'cosmic', name: 'Cosmique', gradient: 'from-indigo-500 via-purple-500 to-pink-500' },
                    { id: 'sunset', name: 'Soleil', gradient: 'from-orange-400 via-pink-500 to-purple-600' }
                  ].map((banner) => (
                    <button
                      key={banner.id}
                      onClick={() => {
                        setSelectedBannerGradient(banner.gradient);
                        setHasBannerChanges(true);
                      }}
                      className={`p-3 rounded-xl bg-gradient-to-r ${banner.gradient} transition-all ${
                        selectedBannerGradient === banner.gradient
                          ? 'ring-2 ring-white scale-105' 
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <p className="font-semibold text-sm text-white drop-shadow-md">{banner.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Banners Selection */}
            {activeBannerTab === 'custom' && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Bannières personnalisées
                </h3>
                
                {customBanners.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune bannière personnalisée disponible</p>
                    <p className="text-sm mt-2">L&apos;administrateur n&apos;a pas encore uploadé de bannières</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customBanners.map((banner) => (
                      <button
                        key={banner.id}
                        onClick={() => {
                          setSelectedCustomBanner(banner.imageUrl);
                          setHasBannerChanges(true);
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                          selectedCustomBanner === banner.imageUrl
                            ? 'border-purple-500 ring-2 ring-purple-500/50'
                            : 'border-border hover:border-muted'
                        }`}
                      >
                        <div className="aspect-video">
                          <img
                            src={banner.thumbnailUrl || banner.imageUrl}
                            alt={banner.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 bg-card">
                          <p className="font-semibold text-sm">{banner.name}</p>
                          {banner.isPremium && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                              Premium
                            </span>
                          )}
                        </div>
                        {selectedCustomBanner === banner.imageUrl && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Badge Selection */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Medal className="w-5 h-5 text-yellow-400" />
                Badges affichés
                <span className="text-sm font-normal text-muted-foreground">
                  ({selectedBadgeIds.length}/3)
                </span>
              </h3>
              
              {badges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tu n&apos;as pas encore de badges</p>
                  <p className="text-sm mt-2">Complète des accomplissements pour en gagner !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {badges.map((userBadge) => {
                    const isSelected = selectedBadgeIds.includes(userBadge.badge.id);
                    
                    return (
                      <button
                        key={userBadge.id}
                        onClick={() => {
                          let newSelectedIds;
                          if (isSelected) {
                            newSelectedIds = selectedBadgeIds.filter(id => id !== userBadge.badge.id);
                          } else if (selectedBadgeIds.length < 3) {
                            newSelectedIds = [...selectedBadgeIds, userBadge.badge.id];
                          } else {
                            return; // Max 3 badges
                          }
                          setSelectedBadgeIds(newSelectedIds);
                          setHasBannerChanges(true);
                        }}
                        disabled={!isSelected && selectedBadgeIds.length >= 3}
                        className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                          isSelected
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : selectedBadgeIds.length >= 3
                            ? 'border-border bg-card opacity-50 cursor-not-allowed'
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: userBadge.badge.color }}
                        >
                          {userBadge.badge.icon}
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold">{userBadge.badge.name}</p>
                          <p className="text-sm text-muted-foreground">{userBadge.badge.description}</p>
                        </div>
                        {isSelected && (
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setIsSavingBanner(true);
                  try {
                    const bannerUrl = activeBannerTab === 'custom' && selectedCustomBanner
                      ? selectedCustomBanner
                      : `gradient:${selectedBannerGradient}`;
                    
                    const response = await fetch('/api/badges', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        bannerUrl,
                        selectedBadgeIds: selectedBadgeIds
                      })
                    });
                    if (response.ok) {
                      setHasBannerChanges(false);
                      refetch();
                    }
                  } catch (error) {
                    console.error('Error saving banner:', error);
                  } finally {
                    setIsSavingBanner(false);
                  }
                }}
                disabled={!hasBannerChanges || isSavingBanner}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isSavingBanner ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Sauvegarder les modifications
                  </>
                )}
              </button>
              
              {hasBannerChanges && (
                <button
                  onClick={() => {
                    // Reset to original values
                    if (profile?.user?.bannerUrl) {
                      if (profile.user.bannerUrl.startsWith('gradient:')) {
                        const gradient = profile.user.bannerUrl.replace('gradient:', '');
                        setSelectedBannerGradient(gradient);
                        setActiveBannerTab('gradient');
                        setSelectedCustomBanner(null);
                      } else {
                        setSelectedCustomBanner(profile.user.bannerUrl);
                        setActiveBannerTab('custom');
                      }
                    }
                    if (profile?.user?.selectedBadgeIds) {
                      try {
                        const ids = JSON.parse(profile.user.selectedBadgeIds);
                        setSelectedBadgeIds(ids);
                      } catch {
                        setSelectedBadgeIds([]);
                      }
                    }
                    setHasBannerChanges(false);
                  }}
                  className="px-4 py-3 bg-card hover:bg-muted border border-border rounded-xl font-semibold transition-all"
                >
                  Annuler
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Settings Tab - Functional Preferences */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Appearance Settings */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" />
                Apparence
              </h3>
              <div className="space-y-4">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-card transition-all">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span>Mode sombre</span>
                      <p className="text-xs text-muted-foreground">Activer le thème sombre</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className={`w-12 h-6 rounded-full transition-all ${
                      theme === 'dark' ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Animations Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-card transition-all">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span>Animations</span>
                      <p className="text-xs text-muted-foreground">Activer les animations</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUserPrefs(prev => ({ ...prev, animations: !prev.animations }))}
                    className={`w-12 h-6 rounded-full transition-all ${
                      userPrefs.animations ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                      userPrefs.animations ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Sound Settings */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                Audio
              </h3>
              <div className="space-y-4">
                {/* Sound Effects Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-card transition-all">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span>Effets sonores</span>
                      <p className="text-xs text-muted-foreground">Sons lors des réponses</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUserPrefs(prev => ({ ...prev, soundEffects: !prev.soundEffects }))}
                    className={`w-12 h-6 rounded-full transition-all ${
                      userPrefs.soundEffects ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                      userPrefs.soundEffects ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Test Settings */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Test & Entraînement
              </h3>
              <div className="space-y-4">
                {/* Show Timer Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-card transition-all">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span>Afficher le timer</span>
                      <p className="text-xs text-muted-foreground">Chronomètre visible pendant les tests</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUserPrefs(prev => ({ ...prev, showTimer: !prev.showTimer }))}
                    className={`w-12 h-6 rounded-full transition-all ${
                      userPrefs.showTimer ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                      userPrefs.showTimer ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin tab removed - use /admin page instead */}
      </main>
    </div>
  );
}

// Main export with Suspense wrapper
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
