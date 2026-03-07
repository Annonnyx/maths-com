'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import OnboardingFlow from '@/components/OnboardingFlow';
import { 
  Trophy, Target, Clock, TrendingUp, BookOpen, 
  Calculator, ChevronRight, Award, BarChart3,
  Zap, Star, History, Users, MessageCircle, Medal,
  GraduationCap, Calendar, Activity
} from 'lucide-react';
import { RANK_COLORS, RANK_BG_COLORS, RANK_CLASSES, RANK_THRESHOLDS, RankClass } from '@/lib/elo';
import { AdUnit } from '@/components/AdUnit';
import TeacherClassManager from '@/components/TeacherClassManager';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { profile, isLoading, error } = useUserProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Stats state
  const [statsPeriod, setStatsPeriod] = useState<'hour' | 'day' | 'week' | 'month' | 'year'>('week');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

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
  const stats = profile.soloStatistics;

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
              <span className="font-semibold">{user.soloRankClass}</span>
              <span className="text-muted-foreground">|</span>
              <span className="font-mono">{user.soloElo} Elo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Header Ad */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <AdUnit type="header" className="transform scale-90 opacity-80" />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Bonjour, {user.username || user.displayName || 'Mathématicien'} ! 👋</h1>
          <p className="text-muted-foreground">Prêt à améliorer tes capacités de calcul mental ?</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Link
            href="/test"
            className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl border border-indigo-500/30 hover:border-indigo-500/50 transition-all group"
          >
            <Zap className="w-8 h-8 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Test d'évaluation</h3>
            <p className="text-sm text-muted-foreground">Teste ton niveau</p>
          </Link>
          
          <Link
            href="/practice"
            className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl border border-green-500/30 hover:border-green-500/50 transition-all group"
          >
            <Target className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Entraînement</h3>
            <p className="text-sm text-muted-foreground">Libre</p>
          </Link>
          
          <Link
            href="/multiplayer"
            className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition-all group"
          >
            <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Multijoueur</h3>
            <p className="text-sm text-muted-foreground">Joueurs en ligne</p>
          </Link>
          
          <Link
            href="/friends"
            className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl border border-blue-500/30 hover:border-blue-500/50 transition-all group"
          >
            <MessageCircle className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Amis</h3>
            <p className="text-sm text-muted-foreground">Gérer</p>
          </Link>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rank Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-6 rounded-2xl border ${getRankColor(user.soloRankClass)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Classe actuelle</h2>
                  <p className="text-muted-foreground">Progresse pour débloquer de nouvelles opérations</p>
                </div>
                <div className="text-4xl font-bold">{user.soloRankClass}</div>
              </div>
              
              {/* Progress to next rank */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{user.soloElo} Elo</span>
                  <span>Prochain rang: {(() => {
                    const currentRankIndex = RANK_CLASSES.indexOf(user.soloRankClass as any);
                    const nextRank = currentRankIndex < RANK_CLASSES.length - 1 ? RANK_CLASSES[currentRankIndex + 1] : null;
                    return nextRank || 'Max';
                  })()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    style={{ width: `${(() => {
                      const rankClass = user.soloRankClass as RankClass;
                      const threshold = RANK_THRESHOLDS[rankClass];
                      const progress = Math.min(100, Math.max(0, ((user.soloElo - Number(threshold || 0)) / 100) * 100));
                      return `${progress}%`;
                    })()}` 
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-[#12121a] rounded-2xl border border-border"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <span className="text-muted-foreground">Statistiques</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    <span className="text-muted-foreground">Tests complétés</span>
                  </div>
                  <span className="font-bold">{stats?.totalTests || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="text-muted-foreground">Taux de réussite</span>
                  </div>
                  <span className="font-bold">
                    {stats ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-muted-foreground">Temps moyen</span>
                  </div>
                  <span className="font-bold">{stats ? Math.round(stats.averageTime) : 0}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    <span className="text-muted-foreground">Meilleure série</span>
                  </div>
                  <span className="font-bold">{user.soloBestStreak} 🔥</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Ad Sidebar */}
            <AdUnit type="sidebar" className="mb-6 transform scale-75 opacity-70" />
            
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-[#12121a] rounded-2xl border border-border"
            >
              <h2 className="text-xl font-bold mb-4">Activité récente</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Dernier test</span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats?.lastTestDate ? new Date(stats.lastTestDate).toLocaleDateString('fr-FR') : 'Jamais'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">Meilleur score</span>
                  </div>
                  <span className="text-sm font-medium">{stats?.bestScore || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Tests cette semaine</span>
                  </div>
                  <span className="text-sm font-medium">{stats?.testsThisWeek || 0}</span>
                </div>
              </div>
              <Link
                href="/history"
                className="mt-4 block text-center px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
              >
                Voir tout l'historique
              </Link>
            </motion.div>

            {/* Weak Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-[#12121a] rounded-2xl border border-border"
            >
              <h2 className="text-xl font-bold mb-4">Points à améliorer</h2>
              <div className="space-y-2">
                {['division', 'power', 'racine', 'factorisation'].slice(0, 2).map((point) => (
                  <div key={point} className="flex items-center gap-2 text-orange-400">
                    <Target className="w-4 h-4" />
                    <span className="capitalize">{point}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/practice"
                className="mt-4 block text-center px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all"
              >
                S&apos;entraîner
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Advanced Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          {/* Toggle Button */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => setShowAdvancedStats(!showAdvancedStats)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-xl border border-indigo-500/30 hover:border-indigo-500/50 transition-all group"
            >
              <BarChart3 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">
                {showAdvancedStats ? 'Masquer' : 'Voir'} les statistiques avancées
              </span>
              <ChevronRight className={`w-4 h-4 text-indigo-400 transition-transform ${showAdvancedStats ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Advanced Stats Content */}
          {showAdvancedStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a3a] p-6"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
                Statistiques avancées
              </h2>
              
              {/* Stats Period Selector */}
              <div className="flex gap-2 mb-6 flex-wrap justify-center">
                {[
                  { id: 'hour', label: 'Heure', icon: Clock },
                  { id: 'day', label: 'Jour', icon: Calendar },
                  { id: 'week', label: 'Semaine', icon: Calendar },
                  { id: 'month', label: 'Mois', icon: Calendar },
                  { id: 'year', label: 'Année', icon: Calendar }
                ].map(period => (
                  <button
                    key={period.id}
                    onClick={() => setStatsPeriod(period.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      statsPeriod === period.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <period.icon className="w-4 h-4 mr-2" />
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 bg-[#2a2a3a] rounded-xl border border-[#3a3a4a]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Évolution ELO</h3>
                  </div>
                  <div className="text-3xl font-bold text-primary">+125</div>
                  <div className="text-sm text-gray-400">Cette {statsPeriod}</div>
                  <div className="mt-4 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Activity className="w-8 h-8 text-gray-500" />
                    <span className="text-sm text-gray-500">Graphique à venir</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 bg-[#2a2a3a] rounded-xl border border-[#3a3a4a]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Précision</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-400">87.5%</div>
                  <div className="text-sm text-gray-400">Cette {statsPeriod}</div>
                  <div className="mt-4 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Activity className="w-8 h-8 text-gray-500" />
                    <span className="text-sm text-gray-500">Graphique à venir</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 bg-[#2a2a3a] rounded-xl border border-[#3a3a4a]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Niveau moyen</h3>
                  </div>
                  <div className="text-3xl font-bold text-purple-400">4.2</div>
                  <div className="text-sm text-gray-400">Cette {statsPeriod}</div>
                  <div className="mt-4 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Activity className="w-8 h-8 text-gray-500" />
                    <span className="text-sm text-gray-500">Graphique à venir</span>
                  </div>
                </motion.div>
              </div>

              {/* Future Expansion Note */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-blue-400">
                    <Star className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Cette section sera bientôt enrichie avec des graphiques interactifs et des analyses détaillées !
                    </span>
                  </div>
                  <Link
                    href="/dashboard/history"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all text-sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Historique complet
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Footer Ad */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <AdUnit type="footer" className="transform scale-85 opacity-75" />
      </div>
    </div>
  );
}
