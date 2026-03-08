'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  ArrowLeft, LineChart, Calendar, Activity, Trophy, Target, 
  TrendingUp, Clock, Zap, BarChart3, Award
} from 'lucide-react';
import { RANK_BG_COLORS, RANK_THRESHOLDS, RankClass, RANK_CLASSES } from '@/lib/elo';
import { AdUnit } from '@/components/AdUnit';
import { EloChart } from '@/components/EloChart';

export default function StatsPage() {
  const { data: session } = useSession();
  const { profile, isLoading } = useUserProfile();
  
  // Filtres globaux
  const [timePeriod, setTimePeriod] = useState<'1h' | '24h' | '7d' | '30d' | '3m' | 'all'>('7d');
  const [gameMode, setGameMode] = useState<'solo' | 'multiplayer' | 'both'>('solo');

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour voir tes statistiques</h1>
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  const user = profile.user;
  const stats = profile.statistics;
  
  const currentRank = gameMode === 'multiplayer' ? user.multiplayerRankClass : user.soloRankClass;
  const currentElo = gameMode === 'multiplayer' ? user.multiplayerElo : user.soloElo;

  const getRankColor = (rank: string | undefined | null) => {
    if (!rank) return 'bg-gray-500/20 border-gray-500';
    const tier = rank.charAt(0);
    return RANK_BG_COLORS[tier] || 'bg-gray-500/20 border-gray-500';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <LineChart className="w-6 h-6" />
              Statistiques détaillées
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* FILTRES GLOBAUX */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Filtres d'analyse
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filtre Période */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">Période d'analyse</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: '1h', label: '1h' },
                  { id: '24h', label: '24h' },
                  { id: '7d', label: '7j' },
                  { id: '30d', label: '30j' },
                  { id: '3m', label: '3 mois' },
                  { id: 'all', label: 'Tout' },
                ].map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setTimePeriod(period.id as typeof timePeriod)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timePeriod === period.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#1e1e2e] text-gray-400 hover:text-white hover:bg-[#2a2a3e]'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtre Mode */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Mode de jeu</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'solo', label: 'Solo', color: 'purple' },
                  { id: 'multiplayer', label: 'Multijoueur', color: 'blue' },
                  { id: 'both', label: 'Les deux', color: 'green' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setGameMode(mode.id as typeof gameMode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      gameMode === mode.id
                        ? `bg-${mode.color}-600 text-white`
                        : 'bg-[#1e1e2e] text-gray-400 hover:text-white hover:bg-[#2a2a3e]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Grand Graphique Principal - Évolution ELO */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Évolution de l'ELO
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">
                  Mode: <span className="text-white font-medium">{gameMode === 'solo' ? 'Solo' : gameMode === 'multiplayer' ? 'Multijoueur' : 'Les deux'}</span>
                </span>
                <span className="text-gray-400">
                  Période: <span className="text-white font-medium">
                    {timePeriod === '1h' ? '1h' : timePeriod === '24h' ? '24h' : timePeriod === '7d' ? '7j' : timePeriod === '30d' ? '30j' : timePeriod === '3m' ? '3 mois' : 'Tout'}
                  </span>
                </span>
              </div>
            </div>
            
            {/* Graphique ELO fonctionnel */}
            <EloChart 
              mode={gameMode}
              period={timePeriod}
              currentElo={currentElo}
              currentRank={currentRank || 'F-'}
            />
            
            {/* Indicateur de mode/rang actuel */}
            <div className="mt-4 flex items-center justify-end gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold">{currentElo}</div>
                <div className="text-xs text-gray-400">ELO actuel</div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg border text-center ${getRankColor(currentRank)}`}>
                <div className="text-sm font-bold">{currentRank}</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="p-5 bg-[#12121a] rounded-xl border border-[#2a2a3a]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-400 text-sm">Tests complétés</span>
            </div>
            <div className="text-3xl font-bold">{stats?.totalTests || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Cette {timePeriod}</div>
          </div>

          <div className="p-5 bg-[#12121a] rounded-xl border border-[#2a2a3a]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-gray-400 text-sm">Taux de réussite</span>
            </div>
            <div className="text-3xl font-bold">
              {stats ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Cette {timePeriod}</div>
          </div>

          <div className="p-5 bg-[#12121a] rounded-xl border border-[#2a2a3a]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Temps moyen</span>
            </div>
            <div className="text-3xl font-bold">{stats ? Math.round(stats.averageTime) : 0}s</div>
            <div className="text-sm text-gray-500 mt-1">Par question</div>
          </div>

          <div className="p-5 bg-[#12121a] rounded-xl border border-[#2a2a3a]">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-gray-400 text-sm">Meilleure série</span>
            </div>
            <div className="text-3xl font-bold">{user.soloBestStreak}</div>
            <div className="text-sm text-gray-500 mt-1">Questions d'affilée</div>
          </div>
        </motion.section>

        {/* Section Graphiques */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Performances par type
            </h3>
            <div className="h-48 bg-[#1e1e2e] rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Analyse détaillée à venir</p>
                <p className="text-sm">(Mode: {gameMode})</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Répartition par rang
            </h3>
            <div className="h-48 bg-[#1e1e2e] rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Distribution des rangs</p>
                <p className="text-sm">(Données à venir)</p>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer Ad */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <AdUnit type="footer" className="transform scale-85 opacity-75" />
      </div>
    </div>
  );
}
