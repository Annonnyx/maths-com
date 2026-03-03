'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GameSession {
  id: string;
  code: string;
  host_id: string;
  status: 'waiting' | 'active' | 'finished';
  max_players: number;
  created_at: Date;
  current_players?: number;
}

interface Player {
  id: string;
  user_id: string;
  score: number;
  joined_at: Date;
  is_ready: boolean;
  user: {
    username: string;
    displayName?: string;
  };
}

function JoinGameContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameCode = searchParams.get('code');

  const [joinCode, setJoinCode] = useState(gameCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (!gameCode) return;

    const fetchGameSession = async () => {
      try {
        const response = await fetch(`/api/game/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: gameCode })
        });

        if (response.ok) {
          const data = await response.json();
          setGameSession(data.session);
          setIsJoined(true);
          
          // S'abonner aux updates en temps réel
          const channel = supabase
            .channel(`game_session_${data.session.id}`)
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'game_players' },
              (payload: any) => {
                if (payload.eventType === 'INSERT') {
                  setPlayers(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'UPDATE') {
                  setPlayers(prev => 
                    prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
                  );
                }
              }
            )
            .subscribe();

          return () => {
            supabase.removeChannel(channel);
          };
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Code invalide');
        }
      } catch (err) {
        setError('Erreur de connexion');
      }
    };

    fetchGameSession();
  }, [gameCode]);

  const handleJoinGame = async () => {
    if (!joinCode || joinCode.length !== 6) {
      setError('Le code doit contenir exactement 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode })
      });

      if (response.ok) {
        const data = await response.json();
        setGameSession(data.session);
        setIsJoined(true);
        
        // Rediriger vers la page multiplayer avec l'ID de session
        router.push(`/multiplayer?session=${data.session.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Code invalide');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour rejoindre une partie</h1>
          <a href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold text-white transition-colors">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Rejoindre une partie</h1>
            <p className="text-muted-foreground">Entrez le code de 6 caractères pour rejoindre la partie</p>
          </div>

          {gameCode ? (
            // Mode avec code pré-rempli
            <div className="space-y-6">
              {gameSession && (
                <div className="p-6 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h2 className="text-xl font-semibold text-green-400 mb-2">Partie trouvée !</h2>
                  <p className="text-muted-foreground">Code: <span className="font-mono font-bold">{gameCode}</span></p>
                  <p className="text-sm text-muted-foreground">
                    Hôte: {gameSession.host_id} • {players.length} joueurs
                  </p>
                </div>
              )}

              {isJoined && gameSession && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-xl">
                    <h3 className="font-semibold mb-3">Joueurs connectés ({players.length})</h3>
                    <div className="space-y-2">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-card rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                              {player.user.username.charAt(0).toUpperCase()}
                            </div>
                            <span>{player.user.displayName || player.user.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{player.score || 0} pts</span>
                            {player.is_ready && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/multiplayer/game/${gameSession.id}`)}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Aller à la partie
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Mode manuel
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Code de la partie</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-center text-2xl font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-400 mb-2" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleJoinGame}
                disabled={loading || joinCode.length !== 6}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  'Rejoindre la partie'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Pas de code ?{' '}
                  <a href="/multiplayer" className="text-purple-400 hover:text-purple-300 underline">
                    Retour au multijoueur
                  </a>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function JoinGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    }>
      <JoinGameContent />
    </Suspense>
  );
}
