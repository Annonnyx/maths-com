'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Trophy, Clock, Users, Zap, CheckCircle, XCircle, Timer } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

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
  sessionId: string;
  session_id?: string;
  userId: string;
  user_id?: string;
  score: number;
  joinedAt?: Date;
  joined_at?: Date;
  isReady?: boolean;
  is_ready?: boolean;
  updatedAt?: Date;
  updated_at?: Date;
  user: {
    id: string;
    username: string;
    displayName?: string;
    multiplayerElo?: number;
    multiplayerClass?: string;
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

  const supabase = getSupabase();

  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [finalScores, setFinalScores] = useState<Player[]>([]);

  // Load game session data
  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      try {
        // Use the unified session endpoint
        const res = await fetch(`/api/multiplayer/game/session/${sessionId}`);
        const data = await res.json();
        
        if (data.session) {
          setGameSession(data.session);
          setPlayers(data.players || []);
          setCurrentQuestionIndex(data.session.currentQuestionIndex || 0);
          
          if (data.session.status === 'active') {
            setGameStatus('playing');
            // Load questions from DB
            const qRes = await fetch(`/api/game/group/question/${sessionId}`);
            if (qRes.ok) {
              const qData = await qRes.json();
              const qs = qData.questions || [];
              setQuestions(qs);
              if (qs.length > 0) {
                const idx = data.session.currentQuestionIndex || 0;
                setCurrentQuestion(qs[idx] || qs[0]);
              }
            }
          } else if (data.session.status === 'finished') {
            setGameStatus('finished');
            const sorted = (data.players || []).sort((a: Player, b: Player) => b.score - a.score);
            setFinalScores(sorted);
          }
        }
      } catch (err) {
        console.error('Error loading game session:', err);
      }
    };
    
    loadSession();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`game_group_${sessionId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'game_players' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            // Re-fetch to get user data
            fetch(`/api/multiplayer/game/session/${sessionId}`)
              .then(r => r.json())
              .then(d => setPlayers(d.players || []))
              .catch(() => {});
          } else if (payload.eventType === 'UPDATE') {
            setPlayers(prev => 
              prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
            );
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions' },
        (payload: any) => {
          const newStatus = payload.new.status;
          const newIndex = payload.new.current_question_index;
          
          if (newStatus === 'active' && gameStatus === 'waiting') {
            setGameStatus('playing');
            // Load questions when game starts
            fetch(`/api/game/group/question/${sessionId}`)
              .then(r => r.json())
              .then(qData => {
                const qs = qData.questions || [];
                setQuestions(qs);
                if (qs.length > 0) {
                  setCurrentQuestion(qs[newIndex || 0]);
                  setCurrentQuestionIndex(newIndex || 0);
                  setTimeLeft(30);
                  setHasAnswered(false);
                  setSelectedAnswer('');
                }
              })
              .catch(() => {});
          } else if (newStatus === 'active' && newIndex !== undefined) {
            // Host advanced to next question
            setCurrentQuestionIndex(newIndex);
            if (questions[newIndex]) {
              setCurrentQuestion(questions[newIndex]);
              setTimeLeft(30);
              setHasAnswered(false);
              setSelectedAnswer('');
            }
          } else if (newStatus === 'finished') {
            setGameStatus('finished');
            const sorted = [...players].sort((a, b) => b.score - a.score);
            setFinalScores(sorted);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && gameStatus === 'playing' && currentQuestion) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, gameStatus, currentQuestion]);

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
        setPlayers(prev => 
          prev.map(p => 
            p.userId === session?.user?.id 
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
      const response = await fetch(`/api/game/group/session/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setGameStatus('playing');
        const qs = data.questions || [];
        setQuestions(qs);
        if (qs.length > 0) {
          setCurrentQuestion(qs[0]);
          setCurrentQuestionIndex(0);
          setTimeLeft(30);
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const nextQuestion = async () => {
    try {
      const response = await fetch(`/api/game/group/${sessionId}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIndex: currentQuestionIndex + 1 })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.gameFinished) {
          setGameStatus('finished');
          const sorted = [...players].sort((a, b) => b.score - a.score);
          setFinalScores(sorted);
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
          if (questions[currentQuestionIndex + 1]) {
            setCurrentQuestion(questions[currentQuestionIndex + 1]);
          } else if (data.nextQuestion) {
            setCurrentQuestion(data.nextQuestion);
          }
          setTimeLeft(30);
          setHasAnswered(false);
          setSelectedAnswer('');
        }
      }
    } catch (error) {
      console.error('Error advancing question:', error);
    }
  };

  const finishGame = () => {
    setGameStatus('finished');
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
        {gameStatus === 'waiting' && gameSession?.host_id === (session?.user as any)?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 bg-card rounded-2xl border border-border"
          >
            <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">En attente des joueurs...</h2>
            <p className="text-muted-foreground mb-6">
              {players.length} / {gameSession?.max_players} joueurs connectés
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

            {players.length >= 1 && (
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
                <h2 className="text-3xl font-bold mb-6">Question {currentQuestionIndex + 1}</h2>
                <div className="text-4xl font-medium mb-8 p-6 bg-muted rounded-xl">
                  {currentQuestion.question}
                </div>
              </div>

              {/* Réponse */}
              <div className="max-w-md mx-auto">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (selectedAnswer.trim()) handleAnswer(selectedAnswer.trim());
                }}>
                  <input
                    type="text"
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={hasAnswered}
                    placeholder="Ta réponse..."
                    className="w-full px-6 py-4 text-2xl text-center bg-muted border-2 border-border rounded-xl focus:outline-none focus:border-primary disabled:opacity-50"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={hasAnswered || !selectedAnswer.trim()}
                    className="w-full mt-4 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl font-semibold text-lg transition-all"
                  >
                    {hasAnswered ? 'Réponse envoyée' : 'Valider'}
                  </button>
                </form>
              </div>
            </div>

            {/* Feedback */}
            {hasAnswered && currentQuestion && (
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
                      <span className="text-white font-semibold">Incorrect ! Réponse : {currentQuestion.answer}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Host controls - next question */}
            {hasAnswered && gameSession?.host_id === (session?.user as any)?.id && (
              <div className="text-center mt-4">
                <button
                  onClick={nextQuestion}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Question suivante
                </button>
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
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      player.userId === (session?.user as any)?.id ? 'bg-primary/20 border-primary/50' : 'bg-muted'
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
