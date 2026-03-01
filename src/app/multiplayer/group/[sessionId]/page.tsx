'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Trophy, Clock, Users, Zap, CheckCircle, XCircle, Timer } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GameSession {
  id: string;
  code: string;
  host_id: string;
  status: 'waiting' | 'active' | 'finished';
  max_players: number;
  current_question_index: number;
  created_at: Date;
  updated_at: Date;
}

interface Player {
  id: string;
  session_id: string;
  user_id: string;
  score: number;
  joined_at: Date;
  is_ready: boolean;
  updated_at: Date;
  user: {
    username: string;
    displayName?: string;
  };
}

interface Question {
  id: string;
  question: string;
  answer: string;
  type: string;
  difficulty: number;
  order: number;
}

function GameContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [finalScores, setFinalScores] = useState<Player[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    // Charger les informations de la session
    fetch(`/api/game/kahoot/session/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setGameSession(data.session);
        setPlayers(data.players || []);
      })
      .catch(err => console.error('Error loading game session:', err));

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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  useEffect(() => {
    if (gameSession?.status === 'active' && !currentQuestion) {
      // Charger la question actuelle
      fetch(`/api/game/kahoot/question/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setCurrentQuestion(data.question);
          setTimeLeft(30);
          setHasAnswered(false);
          setSelectedAnswer('');
        })
        .catch(err => console.error('Error loading question:', err));
    }
  }, [gameSession?.status, currentQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, gameStatus]);

  const handleAnswer = async (answer: string) => {
    if (hasAnswered || !currentQuestion) return;

    setHasAnswered(true);
    setSelectedAnswer(answer);

    try {
      const response = await fetch('/api/game/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answer,
          questionId: currentQuestion.id,
          isCorrect: answer === currentQuestion.answer
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour le score du joueur
        setPlayers(prev => 
          prev.map(p => 
            p.user_id === session?.user?.id 
              ? { ...p, score: p.score + data.points }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const startGame = async () => {
    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        setGameStatus('playing');
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const nextQuestion = () => {
    // Logique pour passer à la question suivante
    setCurrentQuestion(null);
    setTimeLeft(30);
    setHasAnswered(false);
    setSelectedAnswer('');
  };

  const finishGame = () => {
    setGameStatus('finished');
    // Trier les joueurs par score
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    setFinalScores(sortedPlayers);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour jouer</h1>
          <a href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold text-white transition-colors">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  if (gameStatus === 'finished') {
    return (
      <div className="min-h-screen bg-background text-white p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Partie terminée !</h1>
            <p className="text-xl text-muted-foreground mb-8">Classement final</p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {finalScores.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-xl border-2 ${
                    index === 0 ? 'border-yellow-400 bg-yellow-400/20' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                      {player.user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {player.user.displayName || player.user.username}
                      </h3>
                      {index === 0 && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Trophy className="w-5 h-5" />
                          <span className="text-sm font-medium">Vainqueur</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {player.score}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      points
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/multiplayer')}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Retour au multijoueur
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Partie Kahoot</h1>
              <p className="text-muted-foreground">Code: {gameSession?.code}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{session?.user?.username || 'Joueur'}</div>
              <div className="text-lg font-bold text-primary">
                {players.find(p => p.user_id === session?.user?.id)?.score || 0} pts
              </div>
            </div>
          </div>
        </div>

        {/* Écran d'attente */}
        {gameStatus === 'waiting' && gameSession?.host_id === session?.user?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 bg-card rounded-2xl border border-border"
          >
            <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">En attente des joueurs...</h2>
            <p className="text-muted-foreground mb-6">
              {players.length} / {gameSession.max_players} joueurs connectés
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {players.map((player) => (
                <div key={player.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {player.user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{player.user.displayName || player.user.username}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {player.is_ready ? '✅ Prêt' : '⏳ En attente'}
                  </div>
                </div>
              ))}
            </div>

            {players.length >= 2 && (
              <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Zap className="w-5 h-5" />
                Lancer la partie
              </button>
            )}
          </motion.div>
        )}

        {/* Écran de jeu */}
        {gameStatus === 'playing' && currentQuestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Timer */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
                timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                <Timer className="w-6 h-6 text-white" />
                <span className="text-2xl font-bold text-white">{timeLeft}s</span>
              </div>
            </div>

            {/* Question */}
            <div className="bg-card rounded-2xl border border-border p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-6">Question {(gameSession?.current_question_index || 0) + 1}</h2>
                <div className="text-4xl font-medium mb-8 p-6 bg-muted rounded-xl">
                  {currentQuestion.question}
                </div>
              </div>

              {/* Réponses */}
              <div className="grid grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={hasAnswered}
                    className={`p-6 rounded-xl border-2 font-semibold text-lg transition-all ${
                      selectedAnswer === option
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-card hover:border-primary/50 hover:bg-primary/10'
                    } ${hasAnswered ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {hasAnswered && (
              <div className="text-center mt-6">
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg ${
                  selectedAnswer === currentQuestion.answer ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {selectedAnswer === currentQuestion.answer ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-white" />
                      <span className="text-white font-semibold">Correct !</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-white" />
                      <span className="text-white font-semibold">Incorrect !</span>
                    </>
                  )}
                </div>
              </div>
            )}
            </motion.div>
        )}

        {/* Joueurs en cours de partie */}
        {gameStatus === 'playing' && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Classement en direct
            </h3>
            <div className="space-y-2">
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      player.user_id === session?.user?.id ? 'bg-primary/20 border-primary/50' : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {player.user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{player.user.displayName || player.user.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{player.score}</span>
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
