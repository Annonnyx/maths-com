'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Trophy, ArrowLeft, TrendingUp, TrendingDown, 
  Target, Clock, Users, Star, Zap
} from 'lucide-react';
import { MultiplayerGame } from '@/lib/multiplayer';
import { TIME_CONTROLS } from '@/lib/multiplayer';

export default function MultiplayerResultPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [game, setGame] = useState<MultiplayerGame | null>(null);
  const [eloChange, setEloChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const gameId = params.id as string;

  useEffect(() => {
    if (!gameId || !session) return;

    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/multiplayer/game/${gameId}/result`);
        if (!response.ok) {
          throw new Error('Result not found');
        }
        const resultData = await response.json();
        setGame(resultData.game);
        
        // Set Elo change based on player
        const isPlayer1 = resultData.game.player1?.id === session?.user?.id;
        setEloChange(isPlayer1 ? resultData.player1EloChange : resultData.player2EloChange);
      } catch (error) {
        setError('Impossible de charger les résultats');
        console.error('Error fetching result:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [gameId, session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => router.push('/multiplayer')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-colors"
          >
            Retour au lobby
          </button>
        </div>
      </div>
    );
  }

  const isPlayer1 = game.player1?.id === session?.user?.id;
  const opponent = isPlayer1 ? game.player2 : game.player1;
  const playerScore = isPlayer1 ? game.player1Score : game.player2Score;
  const opponentScore = isPlayer1 ? game.player2Score : game.player1Score;
  const isWinner = game.winner === session?.user?.id;
  const isDraw = game.winner === null;

  const accuracy = game.questions ? Math.round((playerScore / game.questions.length) * 100) : 0;
  const timeControlConfig = TIME_CONTROLS[game.timeControl as keyof typeof TIME_CONTROLS];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/multiplayer')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour au lobby</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">Résultats de la partie</h1>
            <p className="text-gray-400">{timeControlConfig?.name} • {game.gameType === 'ranked' ? 'Classé' : 'Amical'}</p>
          </div>

          <button
            onClick={() => router.push('/multiplayer')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl font-semibold transition-all"
          >
            Rejouer
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Result Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 p-8 text-center ${
            isDraw 
              ? 'bg-gray-500/20 border-gray-500/30 text-gray-300'
              : isWinner 
                ? 'bg-green-500/20 border-green-500/30 text-green-300'
                : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-4"
          >
            {isDraw ? '🤝' : isWinner ? '🏆' : '😔'}
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-2">
            {isDraw ? 'Match nul !' : isWinner ? 'Victoire !' : 'Défaite...'}
          </h2>
          
          <p className="text-xl opacity-80">
            {playerScore} - {opponentScore}
          </p>
        </motion.div>

        {/* Score Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-2xl border border-purple-500/30 p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Ta performance
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Score</span>
                <span className="text-2xl font-bold">{playerScore}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Précision</span>
                <span className="font-semibold">{accuracy}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Questions</span>
                <span className="font-semibold">{game.questions?.length || 0}</span>
              </div>
              
              {game.gameType === 'ranked' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Changement Elo</span>
                  <div className={`flex items-center gap-1 font-semibold ${
                    eloChange > 0 ? 'text-green-400' : eloChange < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {eloChange > 0 ? <TrendingUp className="w-4 h-4" /> : eloChange < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                    {eloChange > 0 ? '+' : ''}{eloChange}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Opponent Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              {opponent?.username || 'Adversaire'}
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Score</span>
                <span className="text-2xl font-bold">{opponentScore}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Précision</span>
                <span className="font-semibold">
                  {game.questions ? Math.round((opponentScore / game.questions.length) * 100) : 0}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Classement</span>
                <span className="font-semibold">{opponent?.multiplayerRankClass || 'F-'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Elo multijoueur</span>
                <span className="font-semibold">{opponent?.multiplayerElo || 400}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Game Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Statistiques de la partie
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">{timeControlConfig?.icon}</div>
              <div className="text-sm text-gray-400">Temps de jeu</div>
              <div className="font-semibold">{timeControlConfig?.name}</div>
            </div>
            
            <div className="text-center">
              <Clock className="w-6 h-6 mx-auto mb-1 text-blue-400" />
              <div className="text-sm text-gray-400">Durée</div>
              <div className="font-semibold">
                {game.startedAt && game.finishedAt ? (
                  (() => {
                    const duration = Math.round((new Date(game.finishedAt).getTime() - new Date(game.startedAt).getTime()) / 1000);
                    const minutes = Math.floor(duration / 60);
                    const seconds = duration % 60;
                    return `${minutes}:${seconds.toString().padStart(2, '0')} min`;
                  })()
                ) : (
                  'N/A'
                )}
              </div>
            </div>
            
            <div className="text-center">
              <Target className="w-6 h-6 mx-auto mb-1 text-green-400" />
              <div className="text-sm text-gray-400">Total réponses</div>
              <div className="font-semibold">{(playerScore + opponentScore)} / {(game.questions?.length || 0) * 2}</div>
            </div>
            
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
              <div className="text-sm text-gray-400">Type</div>
              <div className="font-semibold">{game.gameType === 'ranked' ? 'Classé' : 'Amical'}</div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => router.push('/multiplayer')}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Nouvelle partie
          </button>
          
          <button
            onClick={() => router.push('/multiplayer')}
            className="px-8 py-4 bg-[#1e1e2e] hover:bg-[#2a2a3a] border border-[#2a2a3a] rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Retour au lobby
          </button>
        </motion.div>
      </main>
    </div>
  );
}
