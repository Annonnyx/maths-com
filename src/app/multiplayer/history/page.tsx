'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Trophy, ArrowLeft, Eye, Zap
} from 'lucide-react';

export default function MultiplayerHistoryPage() {
  const { data: session } = useSession();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch('/api/multiplayer/history')
      .then(res => res.json())
      .then(data => {
        setGames(data.games || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/multiplayer" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Link>
            <h1 className="text-xl font-bold">Historique Multijoueur</h1>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">{games.length} parties</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {games.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Aucune partie jouée
            </h3>
            <Link
              href="/multiplayer"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Commencer
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {games.map((game: any, index: number) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#1e1e2e] rounded-2xl border border-[#3a3a4a] p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">{new Date(game.createdAt).toLocaleDateString('fr-FR')}</p>
                    <p className="font-semibold">{game.player1?.username} vs {game.player2?.username || 'En attente'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{game.player1Score} - {game.player2Score}</p>
                    <p className="text-sm text-gray-400">{game.status}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
