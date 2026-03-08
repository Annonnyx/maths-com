'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import OnboardingFlow from '@/components/OnboardingFlow';
import { 
  Trophy, Target, Clock, TrendingUp, Zap, Users, MessageCircle,
  Award, BarChart3, History, GraduationCap, Sparkles, LineChart,
  UserCircle, ChevronRight, Loader2, Flame
} from 'lucide-react';
import { RANK_COLORS, RANK_BG_COLORS, RANK_CLASSES, RANK_THRESHOLDS, RankClass } from '@/lib/elo';
import { AdUnit } from '@/components/AdUnit';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { profile, isLoading, error } = useUserProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Toggle pour le rang
  const [gameMode, setGameMode] = useState<'solo' | 'multiplayer'>('solo');
  const [loadingPreviews, setLoadingPreviews] = useState(true);

  // Check if user needs onboarding
  useEffect(() => {
    // Ne montrer l'onboarding que si TOUS les deux indiquent que ce n'est pas complété
    const needsOnboarding = session?.user && (
      !(session.user as any).hasCompletedOnboarding && 
      (!profile?.user || !profile.user.hasCompletedOnboarding)
    );
    
    if (needsOnboarding) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [session, profile]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Navigate to onboarding test page
    router.push('/onboarding/test');
  };

  const handleOnboardingSkip = async () => {
    // Marquer l'onboarding comme terminé sans faire le test
    try {
      const response = await fetch('/api/users/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (response.ok) {
        setShowOnboarding(false);
        // Refresh profile data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error marking onboarding as complete:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement du dashboard...</p>
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
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />;
  }

  const user = profile.user;
  const stats = profile.statistics;

  // Déterminer les stats à afficher selon le mode
  const currentRank = gameMode === 'multiplayer' ? user.multiplayerRankClass : user.soloRankClass;
  const currentElo = gameMode === 'multiplayer' ? user.multiplayerElo : user.soloElo;
  
  const getRankColor = (rank: string | undefined | null) => {
    if (!rank) return 'bg-gray-500/20 border-gray-500';
    const tier = rank.charAt(0);
    return RANK_BG_COLORS[tier] || 'bg-gray-500/20 border-gray-500';
  };

  // Mini sparkline component
  const Sparkline = ({ data, color = 'text-purple-400' }: { data: number[], color?: string }) => {
    if (!data.length) return <div className="h-10 w-full bg-muted/30 rounded" />;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 80 - 10;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg className="h-10 w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Skeleton loader pour les previews
  const PreviewSkeleton = () => (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-muted/50 rounded w-3/4" />
      <div className="h-4 bg-muted/50 rounded w-1/2" />
      <div className="h-16 bg-muted/30 rounded mt-3" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
            <Trophy className="w-6 h-6" />
            <span className="font-bold">maths-app.com</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/friends" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Amis">
              <Users className="w-5 h-5" />
            </Link>
            <Link href="/messages" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Messages">
              <MessageCircle className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">{currentRank}</span>
              <span className="text-muted-foreground">|</span>
              <span className="font-mono">{currentElo} Elo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Header Ad */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <AdUnit type="header" className="transform scale-90 opacity-80" />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user.username || user.displayName || 'Mathématicien'} !
          </h1>
          <p className="text-muted-foreground">Prêt à améliorer tes capacités de calcul mental ?</p>
        </motion.div>

        {/* SECTION HAUTE — Rang et ELO avec Toggle */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl border mb-8 ${getRankColor(currentRank)}`}
        >
          {/* Toggle Solo/Multijoueur */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex bg-black/20 rounded-lg p-1">
              <button
                onClick={() => setGameMode('solo')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  gameMode === 'solo'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Solo
              </button>
              <button
                onClick={() => setGameMode('multiplayer')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  gameMode === 'multiplayer'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Multijoueur
              </button>
            </div>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>

          {/* Affichage du rang */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                Rang actuel : {currentRank}
              </h2>
              <p className="text-muted-foreground">
                {gameMode === 'solo' ? 'Progression en mode solo' : 'Progression en multijoueur'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{currentElo}</div>
              <div className="text-sm text-muted-foreground">ELO</div>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{currentElo} Elo</span>
              <span>
                Prochain rang: {(() => {
                  const currentRankIndex = RANK_CLASSES.indexOf(currentRank as any);
                  const nextRank = currentRankIndex < RANK_CLASSES.length - 1 ? RANK_CLASSES[currentRankIndex + 1] : null;
                  return nextRank || 'Max';
                })()}
              </span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${(() => {
                  const rankClass = currentRank as RankClass;
                  const threshold = RANK_THRESHOLDS[rankClass];
                  const progress = Math.min(100, Math.max(0, ((currentElo - Number(threshold || 0)) / 100) * 100));
                  return `${progress}%`;
                })()}` }}
              />
            </div>
          </div>
        </motion.section>

        {/* TESTS RAPIDES — Icônes courtes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-muted-foreground">Tests rapides</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: '➕', label: 'Additions', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', href: '/test?type=addition' },
              { icon: '✖️', label: 'Multiplications', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', href: '/test?type=multiplication' },
              { icon: '➗', label: 'Divisions', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', href: '/test?type=division' },
              { icon: '🔢', label: 'Mental', color: 'bg-green-500/20 text-green-400 border-green-500/30', href: '/practice' },
              { icon: '⚡', label: 'Rapide', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', href: '/test?mode=quick' },
              { icon: '🎯', label: 'Streak', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', href: '/test?mode=streak' },
            ].map((test) => (
              <Link
                key={test.label}
                href={test.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${test.color} hover:opacity-80 transition-all text-sm font-medium`}
              >
                <span className="text-lg">{test.icon}</span>
                <span>{test.label}</span>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* SECTION PRINCIPALE — 7 Boutons avec Previews */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* BOUTON 1 — Tests */}
          <Link href="/test" className="group">
            <div className="h-full p-5 bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold">Tests</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              
              {loadingPreviews ? (
                <PreviewSkeleton />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dernier score</span>
                    <span className="font-medium">
                      {stats?.lastScore ? `${stats.lastScore}%` : 'Aucun'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cette semaine</span>
                    <span className="font-medium">{stats?.testsThisWeek || 0} tests</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2a2a3a]">
                    <Sparkline data={[85, 92, 78, 88, 95]} color="text-indigo-400" />
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* BOUTON 2 — Multijoueur */}
          <Link href="/multiplayer" className="group">
            <div className="h-full p-5 bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold">Multijoueur</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              
              {loadingPreviews ? (
                <PreviewSkeleton />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rang actuel</span>
                    <span className="font-medium text-purple-400">{user.multiplayerRankClass}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ELO Multijoueur</span>
                    <span className="font-medium">{user.multiplayerElo}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2a2a3a] flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-400">En ligne</span>
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* BOUTON 3 — Social */}
          <Link href="/friends" className="group">
            <div className="h-full p-5 bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] hover:border-blue-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold">Social</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              
              {loadingPreviews ? (
                <PreviewSkeleton />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amis</span>
                    <span className="font-medium">Gérer vos amis</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Messages</span>
                    <span className="font-medium text-xs">Voir les conversations</span>
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* BOUTON 4 — Bannière */}
          <Link href="/profile" className="group">
            <div className="h-full p-5 bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] hover:border-pink-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <UserCircle className="w-5 h-5 text-pink-400" />
                </div>
                <h3 className="font-semibold">Profil & Bannière</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              
              {loadingPreviews ? (
                <PreviewSkeleton />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Personnalisation</span>
                    <span className="font-medium">Avatar & bannière</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2a2a3a]">
                    {user.bannerUrl ? (
                      <div className="h-12 rounded bg-gradient-to-r from-purple-600 to-pink-600" />
                    ) : (
                      <div className="h-12 rounded bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
                        Bannière par défaut
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* BOUTON 5 — Statistiques */}
          <Link href="/stats" className="group">
            <div className="h-full p-5 bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] hover:border-green-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <LineChart className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="font-semibold">Statistiques</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              
              {loadingPreviews ? (
                <PreviewSkeleton />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taux de réussite</span>
                    <span className="font-medium">
                      {stats ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Meilleure série</span>
                    <span className="font-medium flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {user.soloBestStreak}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2a2a3a]">
                    <Sparkline data={[1200, 1250, 1230, 1280, 1300, 1320, 1350]} color="text-green-400" />
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* BOUTON 6 — Historique */}
          <Link href="/history" className="group">
            <div className="h-full p-5 bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] hover:border-yellow-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <History className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold">Historique</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              
              {loadingPreviews ? (
                <PreviewSkeleton />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dernier test</span>
                    <span className="font-medium text-xs">
                      {stats?.lastTestDate 
                        ? new Date(stats.lastTestDate).toLocaleDateString('fr-FR')
                        : 'Jamais'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tests complétés</span>
                    <span className="font-medium">{stats?.totalTests || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* BOUTON 7 — Mes Classes */}
          <Link href="/classes" className="group">
            <div className="h-full p-5 bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] hover:border-cyan-500/50 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold">Mes Classes</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              
              {loadingPreviews ? (
                <PreviewSkeleton />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gérer les classes</span>
                    <span className="font-medium">Rejoindre / Créer</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#2a2a3a] flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Classes publiques et privées
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Link>
        </motion.section>
      </main>

      {/* Footer Ad */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <AdUnit type="footer" className="transform scale-85 opacity-75" />
      </div>
    </div>
  );
}
