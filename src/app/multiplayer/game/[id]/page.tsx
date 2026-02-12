'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Clock, Trophy, Zap, Target, User, ArrowLeft, 
  Send, CheckCircle, XCircle, Timer, ArrowRight
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { PlayerBanner, VersusBanner } from '@/components/PlayerBanner';
import { MultiplayerGame, MultiplayerQuestion } from '@/lib/multiplayer';
import { TIME_CONTROLS } from '@/lib/multiplayer';

export default function MultiplayerGamePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { playSound } = useSound();
  
  const [game, setGame] = useState<MultiplayerGame | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MultiplayerQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTimeLeft, setTotalTimeLeft] = useState(180);
  const [isGameActive, setIsGameActive] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [abandoned, setAbandoned] = useState(false);
  const [opponentAbandoned, setOpponentAbandoned] = useState(false);
  const [showBanners, setShowBanners] = useState(true);
  const [player1Profile, setPlayer1Profile] = useState<any>(null);
  const [player2Profile, setPlayer2Profile] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const gameId = params.id as string;

  // Calculate player info early
  const isPlayer1 = game?.player1?.id === session?.user?.id;
  const opponent = isPlayer1 ? game?.player2 : game?.player1;
  const playerScore = isPlayer1 ? game?.player1Score : game?.player2Score;
  const opponentScore = isPlayer1 ? game?.player2Score : game?.player1Score;

  // Load game data
  useEffect(() => {
    if (!gameId) return;

    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/multiplayer/game/${gameId}`);
        const gameData = await response.json();
        
        if (response.ok) {
          setGame(gameData);
          if (gameData.questions && gameData.questions.length > 0) {
            setCurrentQuestion(gameData.questions[0]);
            setTimeLeft(TIME_CONTROLS[gameData.timeControl as keyof typeof TIME_CONTROLS].averageTimePerQuestion);
            setTotalTimeLeft(TIME_CONTROLS[gameData.timeControl as keyof typeof TIME_CONTROLS].timeLimit);
            setIsGameActive(true);
          }
        } else {
          setError(gameData.error || 'Partie non trouvée');
        }
      } catch (error) {
        console.error('Error fetching game:', error);
        setError('Erreur lors du chargement de la partie');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  // Timer effect
  useEffect(() => {
    if (!isGameActive || hasFinished || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up, move to next question
          moveToNextQuestion();
          return TIME_CONTROLS[game?.timeControl as keyof typeof TIME_CONTROLS]?.averageTimePerQuestion || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, hasFinished, currentQuestion, game?.timeControl]);

  // Total timer effect
  useEffect(() => {
    if (!isGameActive) return;

    const totalTimer = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          // Total time's up, end game
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(totalTimer);
  }, [isGameActive]);

  // Auto-focus effect
  useEffect(() => {
    if (inputRef.current && isGameActive && !answeredQuestions.has(currentQuestionIndex)) {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, isGameActive, answeredQuestions]);

  // Check if game should end
  useEffect(() => {
    if (!game || !isGameActive) return;

    const playerFinished = answeredQuestions.size >= (game.questions?.length || 0);
    const opponentFinishedCheck = opponentProgress >= (game.questions?.length || 0);

    console.log('Game end check:', {
      playerFinished,
      opponentFinishedCheck,
      answeredQuestionsSize: answeredQuestions.size,
      totalQuestions: game.questions?.length,
      opponentProgress,
      totalTimeLeft
    });

    // End game if:
    // 1. Both players finished
    // 2. Time is up
    // 3. One player finished and the other abandoned
    if ((playerFinished && opponentFinishedCheck) || 
        totalTimeLeft <= 0 || 
        (abandoned && opponentFinishedCheck) ||
        (opponentAbandoned && playerFinished)) {
      console.log('Game should end now!');
      setOpponentFinished(true);
      endGame();
    } else if (playerFinished && !abandoned) {
      console.log('Player finished, waiting for opponent');
      setHasFinished(true);
    }
  }, [answeredQuestions.size, opponentProgress, game, isGameActive, totalTimeLeft, abandoned, opponentAbandoned]);

  // Helper function for navigation logic
  const hasNextUnanswered = () => {
    if (!game) return false;
    let nextIndex = currentQuestionIndex + 1;
    while (nextIndex < (game.questions?.length || 0) && answeredQuestions.has(nextIndex)) {
      nextIndex++;
    }
    return nextIndex < (game.questions?.length || 0);
  };

  const moveToNextQuestion = () => {
    if (!game) return;
    
    // Find next unanswered question
    let nextIndex = currentQuestionIndex + 1;
    while (nextIndex < (game.questions?.length || 0) && answeredQuestions.has(nextIndex)) {
      nextIndex++;
    }
    
    if (nextIndex < (game.questions?.length || 0)) {
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(game.questions![nextIndex]);
      setUserAnswer('');
      setTimeLeft(TIME_CONTROLS[game.timeControl as keyof typeof TIME_CONTROLS].averageTimePerQuestion);
    } else {
      // Player has answered all questions
      console.log('Player has answered all questions');
      setHasFinished(true);
    }
  };

  // Poll for opponent progress
  useEffect(() => {
    if (!isGameActive || !game) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/multiplayer/game/${gameId}`);
        const gameData = await response.json();
        
        if (gameData.questions) {
          // Count opponent's answered questions
          const opponentAnsweredCount = gameData.questions.filter((q: { player1Answer: string | null; player2Answer: string | null }) => {
            const isPlayer1 = game.player1?.id === session?.user?.id;
            return isPlayer1 ? q.player2Answer !== null : q.player1Answer !== null;
          }).length;
          
          console.log('Opponent progress update:', opponentAnsweredCount);
          setOpponentProgress(opponentAnsweredCount);
          
          // Check if opponent finished
          if (opponentAnsweredCount >= (game.questions?.length || 0)) {
            console.log('Opponent has finished all questions!');
            setOpponentFinished(true);
          }
        }
        
        // Check if game is already finished on server
        if (gameData.status === 'finished') {
          console.log('Game is already finished on server, redirecting...');
          router.push(`/multiplayer/result/${gameId}`);
        }
      } catch (error) {
        console.error('Error polling opponent progress:', error);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [isGameActive, game, gameId, session?.user?.id, currentQuestion]);

  const handleAbandon = async () => {
    if (!game) return;
    
    try {
      setAbandoned(true);
      setIsGameActive(false);
      
      // Mark game as abandoned
      await fetch(`/api/multiplayer/game/${gameId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abandoned: true })
      });
      
      playSound('incorrect');
      router.push('/multiplayer');
    } catch (error) {
      console.error('Error abandoning game:', error);
      setError('Erreur lors de l\'abandon');
    }
  };

  // Handle page leave detection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isGameActive && !abandoned && !hasFinished) {
        e.preventDefault();
        e.returnValue = '';
        handleAbandon();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGameActive, abandoned, hasFinished]);

  const submitAnswer = async (answer: string) => {
    if (!game || !currentQuestion || hasFinished || abandoned) return;

    // Check if already answered this question
    if (answeredQuestions.has(currentQuestionIndex)) {
      return; // Already answered, can't submit again
    }

    try {
      const response = await fetch(`/api/multiplayer/game/${gameId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer,
          timeTaken: 30 - timeLeft // Time spent on this question
        })
      });

      if (response.ok) {
        playSound(answer === currentQuestion.answer ? 'correct' : 'incorrect');
        setUserAnswer('');
        
        // Mark this question as answered
        setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex));
        
        // Auto-move to next question after a short delay
        setTimeout(() => {
          moveToNextQuestion();
        }, 500);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer.trim()) {
      submitAnswer(userAnswer.trim());
    }
  };

  const endGame = useCallback(async () => {
    if (!game) return;
    
    console.log('Ending game...');
    setIsGameActive(false);
    
    try {
      // Call finish API
      const response = await fetch(`/api/multiplayer/game/${gameId}/finish`, {
        method: 'POST'
      });
      
      if (response.ok) {
        console.log('Game finished successfully, redirecting to results...');
        // Redirect to results page
        router.push(`/multiplayer/result/${gameId}`);
      } else {
        console.error('Failed to finish game:', response.statusText);
        setError('Erreur lors de la fin de partie');
      }
    } catch (error) {
      console.error('Error ending game:', error);
      setError('Erreur lors de la fin de partie');
    }
  }, [game, gameId, router]);

  // Fetch user profiles for banners
  useEffect(() => {
    if (game?.player1?.id && game?.player2?.id) {
      // Fetch profiles for banner data
      Promise.all([
        fetch(`/api/profile?userId=${game.player1.id}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/profile?userId=${game.player2.id}`).then(r => r.ok ? r.json() : null)
      ]).then(([p1, p2]) => {
        if (p1) setPlayer1Profile(p1);
        if (p2) setPlayer2Profile(p2);
      });
    }
  }, [game?.player1?.id, game?.player2?.id]);

  // Hide banners after 3 seconds
  useEffect(() => {
    if (showBanners) {
      const timer = setTimeout(() => {
        setShowBanners(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showBanners]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement de la partie...</p>
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

  // Show banners at game start
  if (showBanners && player1Profile && player2Profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-7xl px-8"
        >
          <VersusBanner 
            player1={{
              username: player1Profile.user.username,
              displayName: player1Profile.user.displayName,
              elo: player1Profile.user.multiplayerElo,
              rankClass: player1Profile.user.multiplayerRankClass,
              bannerUrl: player1Profile.user.bannerUrl,
              selectedBadgeIds: player1Profile.user.selectedBadgeIds,
              isOnline: true
            }}
            player2={{
              username: player2Profile.user.username,
              displayName: player2Profile.user.displayName,
              elo: player2Profile.user.multiplayerElo,
              rankClass: player2Profile.user.multiplayerRankClass,
              bannerUrl: player2Profile.user.bannerUrl,
              selectedBadgeIds: player2Profile.user.selectedBadgeIds,
              isOnline: true
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/multiplayer')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold">{game.player1?.username}</div>
              <div className="text-2xl font-bold">{game.player1Score}</div>
            </div>

            {/* VS */}
            <div className="text-gray-500 font-bold text-xl">VS</div>

            {/* Player 2 */}
            <div className={`text-center ${!isPlayer1 ? 'text-purple-400' : 'text-gray-400'}`}>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4" />
                <span className="font-semibold">{game.player2?.username || 'En attente...'}</span>
              </div>
              <div className="text-2xl font-bold">{game.player2Score || 0}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-400">Temps total</div>
              <div className="text-xl font-bold">{formatTime(totalTimeLeft)}</div>
            </div>
            <button
              onClick={handleAbandon}
              disabled={!isGameActive || hasFinished || abandoned}
              className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
            >
              <XCircle className="w-4 h-4" />
              Abandonner
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Opponent Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progression adversaire</span>
            <span className="text-sm font-semibold">{opponentProgress}/{game.questions?.length || 0}</span>
          </div>
          <div className="w-full bg-[#2a2a3a] rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${(opponentProgress / (game.questions?.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        {!hasFinished && currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1e1e2e] to-[#2a2a3a] rounded-2xl border border-[#3a3a4a] p-8 mb-6"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-400">Question {currentQuestionIndex + 1}/{game.questions?.length}</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className={`font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">{currentQuestion.question}</h2>
              {answeredQuestions.has(currentQuestionIndex) && (
                <div className="text-green-400 font-semibold">Question déjà répondue</div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Ta réponse..."
                  disabled={!isGameActive || answeredQuestions.has(currentQuestionIndex)}
                  className="flex-1 px-4 py-3 bg-[#0a0a0f] border border-[#3a3a4a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!isGameActive || !userAnswer.trim() || answeredQuestions.has(currentQuestionIndex)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {answeredQuestions.has(currentQuestionIndex) ? 'Déjà répondu' : 'Valider'}
                </button>
              </div>
            </form>
            
            {/* Skip button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={moveToNextQuestion}
                disabled={!hasNextUnanswered() || answeredQuestions.has(currentQuestionIndex)}
                className="px-6 py-3 bg-[#1e1e2e] hover:bg-[#2a2a3a] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                {answeredQuestions.has(currentQuestionIndex) ? 'Question passée' : 'Passer'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Finished waiting screen */}
        {hasFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 p-8 text-center"
          >
            <div className="mb-4">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Félicitations !</h2>
              <p className="text-gray-300 mb-6">
                Tu as terminé toutes les questions ! Attends que ton adversaire finisse...
              </p>
              <div className="text-sm text-gray-400">
                {opponentFinished ? 'Les deux joueurs ont terminé' : 'En attente de l\'adversaire...'}
              </div>
            </div>
            <div className="w-16 h-16 border-4 border-green-500/30 rounded-full border-t-transparent animate-spin mx-auto"></div>
          </motion.div>
        )}

        {/* Answer Status */}
        <div className="mt-6">
          <div className="text-sm text-gray-400 mb-2">Questions répondues</div>
          <div className="flex gap-2 flex-wrap">
            {game.questions?.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  answeredQuestions.has(index)
                    ? 'bg-green-500 text-white'
                    : index === currentQuestionIndex
                    ? 'bg-purple-500 text-white'
                    : 'bg-[#2a2a3a] text-gray-500'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
