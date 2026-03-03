'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, Play, X, Settings, ChevronRight, Clock, 
  Trophy, Target, Zap, Swords, UserPlus, GraduationCap,
  SkipForward, Square, ArrowLeft
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface GameSession {
  id: string;
  code: string;
  hostId: string;
  status: string;
  maxPlayers: number;
  currentQuestionIndex: number;
  createdAt: string;
}

interface Player {
  id: string;
  userId: string;
  sessionId: string;
  score: number;
  isReady: boolean;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    multiplayerElo: number;
    multiplayerRankClass: string;
  };
}

interface Question {
  id: string;
  question: string;
  answer: number;
  options: number[];
  difficulty: string;
  timeLimit: number;
}

export default function GameLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const sessionId = params.sessionId as string;

  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hostParticipating, setHostParticipating] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Récupérer la session de jeu
        const sessionResponse = await fetch(`/api/multiplayer/game/${sessionId}`);
        if (!sessionResponse.ok) {
          setError('Session non trouvée');
          return;
        }
        const sessionData = await sessionResponse.json();
        setGameSession(sessionData.session);
        setPlayers(sessionData.players || []);

        // Vérifier si l'utilisateur est l'hôte
        setIsHost(session?.user?.id === sessionData.session.hostId);

        // Récupérer les questions
        const questionsResponse = await fetch(`/api/game/question/${sessionId}`);
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          setQuestions(questionsData.questions || []);
        }

        // S'abonner aux updates en temps réel
        const channel = supabase
          .channel(`game_session_${sessionId}`)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'game_players' },
            (payload: any) => {
              if (payload.eventType === 'INSERT') {
                setPlayers(prev => [...prev, payload.new]);
              } else if (payload.eventType === 'UPDATE') {
                setPlayers(prev => 
                  prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
                );
              } else if (payload.eventType === 'DELETE') {
                setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
              }
            }
          )
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'game_sessions' },
            (payload: any) => {
              if (payload.eventType === 'UPDATE') {
                setGameSession(prev => prev ? { ...prev, ...payload.new } : null);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        setError('Erreur de chargement');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchGameData();
    }
  }, [sessionId, session?.user?.id]);

  const startGame = async () => {
    if (!gameSession) return;

    try {
      const response = await fetch(`/api/game/group/session/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hostParticipating,
          questionCount: questions.length 
        })
      });

      if (response.ok) {
        setGameStarted(true);
        router.push(`/multiplayer/game/${sessionId}`);
      } else {
        setError('Erreur lors du lancement');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const nextQuestion = async () => {
    if (!gameSession || currentQuestionIndex >= questions.length - 1) return;

    try {
      const response = await fetch(`/api/game/group/${sessionId}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIndex: currentQuestionIndex + 1 })
      });

      if (response.ok) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (err) {
      setError('Erreur lors du passage à la question suivante');
    }
  };

  const cancelGame = async () => {
    if (!gameSession) return;

    try {
      const response = await fetch(`/api/multiplayer/game/session/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/multiplayer');
      }
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    }
  };

  const removePlayer = async (playerId: string) => {
    try {
      const response = await fetch(`/api/multiplayer/game/session/player/${playerId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        setError('Erreur lors de la suppression du joueur');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !gameSession) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Erreur</h1>
          <p className="text-gray-400 mb-4">{error || 'Session non trouvée'}</p>
          <Link href="/multiplayer" className="text-indigo-400 hover:text-indigo-300">
            Retour au multijoueur
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/multiplayer" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Lobby - {gameSession.code}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
              {players.length}/{gameSession.maxPlayers} joueurs
            </div>
            {isHost && (
              <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                Hôte
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des joueurs */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#12121a] rounded-2xl border border-gray-800 p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Joueurs ({players.length})
              </h2>
              
              <div className="space-y-3">
                {players.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-xl border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {player.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {player.user.displayName || player.user.username}
                        </div>
                        <div className="text-sm text-gray-400">
                          {player.user.multiplayerElo} • {player.user.multiplayerRankClass}
                        </div>
                      </div>
                      {player.userId === gameSession.hostId && (
                        <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          Hôte
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {player.isReady && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      {isHost && player.userId !== session?.user?.id && (
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {players.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>En attente de joueurs...</p>
                  <p className="text-sm mt-2">Partagez le code : {gameSession.code}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Contrôles de l'hôte */}
          {isHost && (
            <div className="space-y-6">
              {/* Paramètres */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#12121a] rounded-2xl border border-gray-800 p-6"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Paramètres
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Participer au jeu</label>
                    <button
                      onClick={() => setHostParticipating(!hostParticipating)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        hostParticipating ? 'bg-indigo-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        hostParticipating ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Questions : {questions.length}
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#12121a] rounded-2xl border border-gray-800 p-6"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-green-400" />
                  Actions
                </h3>
                
                <div className="space-y-3">
                  {!gameStarted ? (
                    <button
                      onClick={startGame}
                      disabled={players.length < 1}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      {players.length < 1 ? 'Attente de joueurs...' : 'Lancer la partie'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex >= questions.length - 1}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <SkipForward className="w-5 h-5" />
                        {currentQuestionIndex >= questions.length - 1 ? 'Dernière question' : 'Question suivante'}
                      </button>
                      
                      <button
                        onClick={() => router.push(`/multiplayer/game/${sessionId}`)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Target className="w-5 h-5" />
                        Voir la partie
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={cancelGame}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Square className="w-5 h-5" />
                    Annuler la partie
                  </button>
                </div>
              </motion.div>

              {/* Statistiques */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#12121a] rounded-2xl border border-gray-800 p-6"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Statistiques
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Code</span>
                    <span className="font-mono">{gameSession.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joueurs</span>
                    <span>{players.length}/{gameSession.maxPlayers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Questions</span>
                    <span>{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Question actuelle</span>
                    <span>{currentQuestionIndex + 1}/{questions.length}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
