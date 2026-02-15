'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Trophy, Target, Clock, TrendingUp, BookOpen, 
  Calculator, ChevronRight, Award, BarChart3,
  Zap, Star, History, Users, MessageCircle, Medal
} from 'lucide-react';
import { RANK_COLORS, RANK_BG_COLORS, RANK_CLASSES, RANK_THRESHOLDS } from '@/lib/elo';
import { AdUnit } from '@/components/AdUnit';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { profile, isLoading, error } = useUserProfile();
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'history'>('overview');

  // Redirect to login if not authenticated (fallback if middleware fails)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  // Show nothing while checking auth to prevent flash of content
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading while fetching profile
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de ton profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-foreground text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
          <p className="mb-4 text-red-400">{error || 'Impossible de charger le profil'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const user = profile.user;
  const stats = profile.statistics;
  const recentTests = profile.recentTests || [];

  const getRankColor = (rank: string) => {
    const tier = rank.charAt(0);
    return RANK_BG_COLORS[tier] || 'bg-gray-500/20 border-gray-500';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
            <Trophy className="w-6 h-6" />
            <span className="font-bold">Math.com</span>
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
              <span className="font-semibold">{user.rankClass}</span>
              <span className="text-muted-foreground">|</span>
              <span className="font-mono">{user.elo} Elo</span>
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
            className="p-6 bg-card rounded-2xl border border-border hover:border-[#3a3a4a] transition-all group"
          >
            <Target className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Exercices libres</h3>
            <p className="text-sm text-muted-foreground">Sans impact sur l'Elo</p>
          </Link>
          
          <Link
            href="/courses"
            className="p-6 bg-card rounded-2xl border border-border hover:border-[#3a3a4a] transition-all group"
          >
            <BookOpen className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Cours</h3>
            <p className="text-sm text-muted-foreground">Apprends les techniques</p>
          </Link>
          
          <Link
            href="/history"
            className="p-6 bg-card rounded-2xl border border-border hover:border-[#3a3a4a] transition-all group"
          >
            <BarChart3 className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Historique</h3>
            <p className="text-sm text-muted-foreground">Revois tes tests</p>
          </Link>
          
          <Link
            href="/friends"
            className="p-6 bg-card rounded-2xl border border-border hover:border-green-500/50 transition-all group"
          >
            <Users className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Amis</h3>
            <p className="text-sm text-muted-foreground">Gère tes amis</p>
          </Link>
          
          <Link
            href="/messages"
            className="p-6 bg-card rounded-2xl border border-border hover:border-pink-500/50 transition-all group"
          >
            <MessageCircle className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Messages</h3>
            <p className="text-sm text-muted-foreground">Tes conversations</p>
          </Link>

          <Link
            href="/profile?tab=banner"
            className="p-6 bg-card rounded-2xl border border-border hover:border-yellow-500/50 transition-all group"
          >
            <Medal className="w-8 h-8 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Bannières</h3>
            <p className="text-sm text-muted-foreground">Customise ton profil</p>
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
              className={`p-6 rounded-2xl border ${getRankColor(user.rankClass)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Classe actuelle</h2>
                  <p className="text-muted-foreground">Progresse pour débloquer de nouvelles opérations</p>
                </div>
                <div className="text-4xl font-bold">{user.rankClass}</div>
              </div>
              
              {/* Progress to next rank */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{user.elo} Elo</span>
                  <span>Prochain rang: {(() => {
                    const currentRankIndex = RANK_CLASSES.indexOf(user.rankClass as any);
                    const nextRank = currentRankIndex < RANK_CLASSES.length - 1 ? RANK_CLASSES[currentRankIndex + 1] : null;
                    return nextRank || 'Max';
                  })()}</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-3">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    style={{ width: `${(() => {
                      const threshold = RANK_THRESHOLDS[user.rankClass as any];
                      if (!threshold || threshold.max === Infinity) return 100;
                      const range = threshold.max - threshold.min;
                      const progress = user.elo - threshold.min;
                      return Math.min(100, Math.max(0, (progress / range) * 100));
                    })()}%` }}
                  />
                </div>
              </div>

              {/* Unlocked Operations */}
              <div className="flex flex-wrap gap-2">
                {['addition', 'soustraction', 'multiplication'].map(op => (
                  <span key={op} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm capitalize">
                    ✓ {op}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-[#12121a] rounded-2xl border border-border"
            >
              <h2 className="text-xl font-bold mb-4">Statistiques</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-400" />
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
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-muted-foreground">Meilleure série</span>
                  </div>
                  <span className="font-bold">{user.bestStreak}</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Tests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-[#12121a] rounded-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Tests récents</h2>
                <Link href="/history" className="text-sm text-indigo-400 hover:text-indigo-300">
                  Voir tout
                </Link>
              </div>
              <div className="space-y-3">
                {recentTests.slice(0, 5).map((test: any) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 bg-card rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        test.score >= 80 ? 'bg-green-500/20' : test.score >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                      }`}>
                        <span className={`font-bold ${
                          test.score >= 80 ? 'text-green-400' : test.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {test.score}%
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{test.correctAnswers}/{test.totalQuestions} correct</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(test.completedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        test.eloChange > 0 ? 'text-green-400' : test.eloChange < 0 ? 'text-red-400' : 'text-muted-foreground'
                      }`}>
                        {test.eloChange > 0 ? '+' : ''}{test.eloChange}
                      </div>
                      <p className="text-sm text-muted-foreground">Elo</p>
                    </div>
                  </div>
                ))}
                {recentTests.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">Aucun test encore</p>
                )}
              </div>
            </motion.div>

            {/* Recent Multiplayer Games */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-[#12121a] rounded-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Parties multijoueur récentes
                </h2>
                <Link href="/multiplayer/history" className="text-sm text-indigo-400 hover:text-indigo-300">
                  Voir tout
                </Link>
              </div>
              <div className="space-y-3">
                {(profile?.recentGames || []).slice(0, 5).map((game: any) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 bg-card rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        game.status === 'finished' ? 'bg-blue-500/20' : 'bg-yellow-500/20'
                      }`}>
                        <span className={`font-bold ${
                          game.status === 'finished' ? 'text-blue-400' : 'text-yellow-400'
                        }`}>
                          {game.status === 'finished' ? '✓' : '⏳'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">
                          {game.player1?.username || 'Joueur 1'} vs {game.player2?.username || 'En attente'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(game.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {' · '}
                          <span className={game.gameType === 'ranked' ? 'text-orange-400' : 'text-blue-400'}>
                            {game.gameType === 'ranked' ? 'Classé' : 'Amical'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {game.status === 'finished' ? (
                        <>
                          <div className="font-bold text-foreground">
                            {game.player1Score} - {game.player2Score}
                          </div>
                          <p className="text-sm text-muted-foreground">Score</p>
                        </>
                      ) : (
                        <Link
                          href={`/multiplayer/game/${game.id}`}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                        >
                          Continuer
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                {(profile?.recentGames || []).length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-3">Aucune partie multijoueur encore</p>
                    <Link
                      href="/multiplayer"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Jouer
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Ad Sidebar */}
            <AdUnit type="sidebar" className="mb-6 transform scale-75 opacity-70" />
            
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
      </main>

      {/* Footer Ad */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <AdUnit type="footer" className="transform scale-85 opacity-75" />
      </div>
    </div>
  );
}
