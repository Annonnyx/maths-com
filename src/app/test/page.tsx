'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Clock, Trophy, Zap, Target, User, ArrowLeft, 
  Send, CheckCircle, XCircle, Timer, RotateCcw,
  TrendingUp, TrendingDown, Award, Brain, Calculator,
  Link, BarChart3, ArrowRight
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { Exercise, generateTest, generateEvaluationTest, generateFocusedTest, getOperationTypesForCourse, validateAnswer } from '@/lib/exercises';
import { calculateAdvancedEloChange, getPerformanceTier, getRankFromElo, RANK_COLORS, RANK_BG_COLORS } from '@/lib/elo';
import { HomePageSideAds } from '@/components/ResponsiveSideAd';

type TestMode = 'competitive' | 'training' | null;

interface TestState {
  questions: Exercise[];
  currentIndex: number;
  answers: string[];
  timePerQuestion: number[];
  startTime: number;
  isComplete: boolean;
  showAnswer?: boolean;
  attempts?: number[];
}

interface PerformanceBreakdown {
  speedBonus: number;
  accuracyBonus: number;
  difficultyBonus: number;
  streakBonus: number;
  baseChange: number;
}

function TestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { playSound } = useSound();
  const courseType = searchParams.get('type');
  
  const [testMode, setTestMode] = useState<TestMode>(null);
  const [testState, setTestState] = useState<TestState | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [testTitle, setTestTitle] = useState('Test');
  
  const [detailedResults, setDetailedResults] = useState<{
    correct: number;
    total: number;
    score: number;
    eloChange: number;
    performance: PerformanceBreakdown;
    tier: { tier: string; color: string; message: string };
    results: {
      question: Exercise;
      userAnswer: string;
      isCorrect: boolean;
      timeTaken: number;
      attempts?: number;
    }[];
  } | null>(null);
  
  const [eloUpdated, setEloUpdated] = useState(false);

  const generateQuestions = useCallback((mode: TestMode) => {
    let questions: Exercise[];
    let title = 'Test';
    
    // Get user Elo from session, default to 400
    const userElo = (session?.user as any)?.elo || 400;
    
    // Check for custom error questions from URL
    const errorsParam = searchParams.get('errors');
    if (errorsParam) {
      try {
        const errorQuestions = JSON.parse(decodeURIComponent(errorsParam));
        questions = errorQuestions.map((eq: any, index: number) => ({
          id: `error-${index}`,
          type: eq.type,
          difficulty: eq.difficulty,
          question: eq.question,
          answer: eq.answer,
          explanation: undefined
        }));
        title = 'Entraînement - Erreurs à corriger';
      } catch (error) {
        console.error('Invalid error questions format:', error);
        // Fallback to normal generation
        questions = mode === 'competitive' ? generateTest(userElo, 20) : generateEvaluationTest(20);
        title = mode === 'competitive' ? 'Test Compétitif' : 'Test d\'entraînement';
      }
    } else if (courseType) {
      const operationTypes = getOperationTypesForCourse(courseType);
      if (operationTypes) {
        const difficulty = mode === 'competitive' 
          ? Math.min(10, Math.max(3, Math.floor(operationTypes.length * 2)))
          : Math.min(6, Math.max(2, Math.floor(operationTypes.length * 1.5)));
        questions = generateFocusedTest(operationTypes, difficulty, 20, userElo);
        title = `Test - ${courseType}`;
      } else {
        questions = mode === 'competitive' ? generateTest(userElo, 20) : generateEvaluationTest(20);
        title = mode === 'competitive' ? 'Test Compétitif' : 'Test d\'entraînement';
      }
    } else {
      // Normal test generation
      questions = mode === 'competitive' ? generateTest(userElo, 20) : generateEvaluationTest(20);
      title = mode === 'competitive' ? 'Test Compétitif' : 'Test d\'entraînement';
    }
    
    return { questions, title };
  }, [session, searchParams, courseType]);

  const startTest = useCallback((mode: TestMode) => {
    if (!mode) return;
    playSound('click');
    
    const { questions, title } = generateQuestions(mode);
    
    setTestState({
      questions,
      currentIndex: 0,
      answers: new Array(questions.length).fill(''),
      timePerQuestion: new Array(questions.length).fill(0),
      startTime: Date.now(),
      isComplete: false,
      showAnswer: false,
      attempts: new Array(questions.length).fill(0)
    });
    setTestMode(mode);
    setTestTitle(title);
    setInputValue('');
    setElapsedTime(0);
    setShowResults(false);
    setDetailedResults(null);
  }, [generateQuestions]);

  useEffect(() => {
    if (!testState || testState.isComplete || testMode !== 'competitive') return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - testState.startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [testState, testMode]);

  const submitAnswer = () => {
    if (!testState || !inputValue.trim()) return;

    const currentQ = testState.questions[testState.currentIndex];
    const isCorrect = validateAnswer(currentQ, inputValue.trim());
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    const questionStartTime = testState.timePerQuestion[testState.currentIndex] 
      ? testState.startTime + testState.timePerQuestion.slice(0, testState.currentIndex).reduce((a, b) => a + b, 0) * 1000
      : testState.startTime;
    
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    
    const newAnswers = [...testState.answers];
    newAnswers[testState.currentIndex] = inputValue.trim();
    
    const newTimePerQuestion = [...testState.timePerQuestion];
    newTimePerQuestion[testState.currentIndex] = timeTaken;
    
    const newAttempts = testMode === 'training' 
      ? [...(testState.attempts || [])]
      : undefined;
    if (newAttempts) {
      newAttempts[testState.currentIndex] = (newAttempts[testState.currentIndex] || 0) + 1;
    }

    if (testMode === 'training' && !isCorrect) {
      setTestState({
        ...testState,
        answers: newAnswers,
        timePerQuestion: newTimePerQuestion,
        attempts: newAttempts,
        showAnswer: true
      });
    } else {
      if (testState.currentIndex < testState.questions.length - 1) {
        setTestState({
          ...testState,
          answers: newAnswers,
          timePerQuestion: newTimePerQuestion,
          attempts: newAttempts,
          showAnswer: false,
          currentIndex: testState.currentIndex + 1
        });
        setInputValue('');
      } else {
        setTestState({
          ...testState,
          answers: newAnswers,
          timePerQuestion: newTimePerQuestion,
          attempts: newAttempts,
          isComplete: true
        });
        calculateAndShowResults(newAnswers, newTimePerQuestion, newAttempts);
      }
    }
  };

  const continueToNext = () => {
    if (!testState) return;
    playSound('tick');
    
    if (testState.currentIndex < testState.questions.length - 1) {
      setTestState({
        ...testState,
        showAnswer: false,
        currentIndex: testState.currentIndex + 1
      });
      setInputValue('');
    } else {
      setTestState({
        ...testState,
        isComplete: true
      });
      calculateAndShowResults(testState.answers, testState.timePerQuestion, testState.attempts);
    }
  };

  const calculateAndShowResults = (
    answers: string[], 
    timePerQuestion: number[], 
    attempts?: number[]
  ) => {
    if (!testState) return;
    
    let correct = 0;
    const results = testState.questions.map((q, i) => {
      const isCorrect = validateAnswer(q, answers[i]);
      if (isCorrect) correct++;
      return {
        question: q,
        userAnswer: answers[i],
        isCorrect,
        timeTaken: timePerQuestion[i] || 0,
        attempts: attempts?.[i] || 1
      };
    });
    
    const score = Math.round((correct / testState.questions.length) * 100);
    
    let eloChange = 0;
    let performance: PerformanceBreakdown = {
      speedBonus: 0,
      accuracyBonus: 0,
      difficultyBonus: 0,
      streakBonus: 0,
      baseChange: 0
    };
    let tier = { tier: 'F', color: 'text-red-400', message: 'À réviser...' };
    
    if (testMode === 'competitive') {
      // Get user Elo from profile or session
      const userElo = (session?.user as any)?.elo || 400;
      
      const eloResult = calculateAdvancedEloChange({
        correctAnswers: correct,
        totalQuestions: testState.questions.length,
        totalTimeSeconds: timePerQuestion.reduce((a, b) => a + b, 0),
        questionTimes: timePerQuestion,
        difficulties: testState.questions.map(q => q.difficulty),
        currentElo: userElo,
        streak: 0
      });
      
      eloChange = eloResult.eloChange;
      performance = eloResult.performance;
      tier = getPerformanceTier(eloChange);
    }
    
    setDetailedResults({
      correct,
      total: testState.questions.length,
      score,
      eloChange,
      performance,
      tier,
      results
    });
    setShowResults(true);
    
    // Save results to database for competitive mode
    if (testMode === 'competitive') {
      saveTestResults();
    }
  };

  const saveTestResults = async () => {
    if (!testState || !testMode) return;

    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: testState.questions,
          answers: testState.answers,
          timePerQuestion: testState.timePerQuestion,
          testMode,
          elapsedTime,
          courseType
        }),
      });

      if (!response.ok) {
        console.error('Failed to save test results');
        return;
      }

      const data = await response.json();
      console.log('Test results saved:', data);
      
      // Force session refresh to get updated Elo
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
        });
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log('Session refreshed with new Elo:', refreshData.user.elo);
          setEloUpdated(true);
        }
      } catch (refreshError) {
        console.error('Failed to refresh session:', refreshError);
      }
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (testMode === 'training' && testState?.showAnswer) {
        continueToNext();
      } else {
        submitAnswer();
      }
    }
  };

  const resetToModeSelection = () => {
    playSound('click');
    setTestMode(null);
    setTestState(null);
    setShowResults(false);
    setDetailedResults(null);
    setInputValue('');
    setElapsedTime(0);
  };

  // MODE SELECTION SCREEN
  if (!testMode) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
              <Trophy className="w-6 h-6" />
              <span className="font-bold">Math.com</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Choisis ton mode</h1>
            <p className="text-xl text-gray-400">
              Sélectionne le mode qui correspond à ton objectif
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Competitive Mode */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startTest('competitive')}
              className="p-8 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/50 hover:border-red-400 transition-all group text-left"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Mode Compétitif</h2>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-red-400" />
                  Chronométré - sois rapide!
                </li>
                <li className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-400" />
                  Gagne ou perds de l'Elo
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-red-400" />
                  Bonus vitesse + difficulté
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-2 text-red-400 font-semibold">
                <span>Lancer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Training Mode */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startTest('training')}
              className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 border-2 border-blue-500/50 hover:border-blue-400 transition-all group text-left"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Mode Entraînement</h2>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  Voir les erreurs immédiatement
                </li>
                <li className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-400" />
                  Apprends à ton rythme
                </li>
                <li className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-blue-400" />
                  Sans impact sur l'Elo
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-2 text-blue-400 font-semibold">
                <span>Lancer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </main>
      </div>
    );
  }

  // LOADING STATE
  if (!testState) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  // TEST SCREEN
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={resetToModeSelection}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
            <span className="text-gray-500">|</span>
            <span className="font-semibold flex items-center gap-2">
              {testMode === 'competitive' ? (
                <>
                  <Zap className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">Compétitif</span>
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400">Entraînement</span>
                </>
              )}
            </span>
            {courseType && (
              <>
                <span className="text-gray-500 hidden sm:inline">|</span>
                <span className="text-sm text-gray-400 hidden sm:inline">
                  {testTitle.split(' - ')[1]}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {testMode === 'competitive' && (
              <div className="flex items-center gap-2 text-red-400">
                <Timer className="w-5 h-5" />
                <span className="font-mono text-lg">
                  {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                </span>
              </div>
            )}
            <div className="px-3 py-1 bg-[#1e1e2e] rounded-lg text-sm">
              {testState.currentIndex + 1} / {testState.questions.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-[#1e1e2e] h-1">
        <motion.div
          className={`h-full ${testMode === 'competitive' 
            ? 'bg-gradient-to-r from-red-500 to-orange-500' 
            : 'bg-gradient-to-r from-blue-500 to-teal-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${((testState.currentIndex + 1) / testState.questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Question Card */}
              <div className="text-center mb-12">
                <motion.div
                  key={testState.currentIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-gray-500 text-sm uppercase tracking-wider">
                      Question {testState.currentIndex + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      testState.questions[testState.currentIndex].difficulty >= 8 
                        ? 'bg-red-500/20 text-red-400' 
                        : testState.questions[testState.currentIndex].difficulty >= 5 
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                    }`}>
                      Niv. {testState.questions[testState.currentIndex].difficulty}
                    </span>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-bold font-mono">
                    {testState.questions[testState.currentIndex].question}
                  </h2>
                </motion.div>

                {/* Training Mode: Show Answer Section */}
                {testMode === 'training' && testState.showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-red-400 mb-3">
                      <XCircle className="w-6 h-6" />
                      <span className="font-semibold">Pas tout à fait...</span>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Ta réponse: <span className="text-red-400 font-bold">{inputValue}</span>
                    </p>
                    <p className="text-gray-300 mb-4">
                      Réponse correcte: <span className="text-green-400 font-bold">
                        {testState.questions[testState.currentIndex].answer}
                      </span>
                    </p>
                    {testState.questions[testState.currentIndex].explanation && (
                      <p className="text-sm text-gray-400">
                        {testState.questions[testState.currentIndex].explanation}
                      </p>
                    )}
                    <button
                      onClick={continueToNext}
                      className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl font-semibold transition-all mx-auto"
                    >
                      Continuer
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {/* Input */}
                {!(testMode === 'training' && testState.showAnswer) && (
                  <div className="flex flex-col items-center gap-6">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ta réponse..."
                      className={`w-full max-w-xs px-6 py-4 bg-[#1e1e2e] border-2 rounded-xl text-center text-2xl font-mono focus:outline-none transition-all ${
                        testMode === 'competitive'
                          ? 'border-[#2a2a3a] focus:border-red-500'
                          : 'border-[#2a2a3a] focus:border-blue-500'
                      }`}
                      autoFocus
                    />
                    
                    <button
                      onClick={submitAnswer}
                      disabled={!inputValue.trim()}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        testMode === 'competitive'
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                          : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600'
                      }`}
                    >
                      Valider
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-2">
                {testState.questions.map((q, i) => {
                  const isAnswered = testState.answers[i] !== '';
                  const isCorrect = isAnswered && validateAnswer(q, testState.answers[i]);
                  
                  return (
                    <button
                      key={i}
                      onClick={() => testMode === 'training' && setTestState({ ...testState, currentIndex: i })}
                      disabled={testMode === 'competitive'}
                      className={`h-2 rounded-full transition-all ${
                        i === testState.currentIndex
                          ? `w-6 ${testMode === 'competitive' ? 'bg-red-500' : 'bg-blue-500'}`
                          : isAnswered
                            ? isCorrect
                              ? 'w-2 bg-green-500'
                              : 'w-2 bg-red-500'
                            : 'w-2 bg-[#2a2a3a]'
                      }`}
                    />
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              {detailedResults && (
                <>
                  {/* Results Header */}
                  <div className="text-center mb-12">
                    {eloUpdated && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl"
                      >
                        <div className="flex items-center justify-center gap-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Elo mis à jour avec succès!</span>
                        </div>
                        <div className="text-sm text-green-300 mt-1">
                          Clique sur "Rafraîchir l'Elo" pour voir les nouvelles statistiques
                        </div>
                      </motion.div>
                    )}
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ${
                        detailedResults.score >= 80
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                          : detailedResults.score >= 50
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
                          : 'bg-gradient-to-br from-red-500/20 to-pink-500/20'
                      }`}
                    >
                      <span className="text-4xl font-bold">{detailedResults.score}%</span>
                    </motion.div>
                    
                    <h2 className="text-3xl font-bold mb-2">
                      {detailedResults.score >= 90
                        ? '🎉 Excellent !'
                        : detailedResults.score >= 70
                        ? '👏 Très bien !'
                        : detailedResults.score >= 50
                        ? '💪 Continue ainsi !'
                        : '📚 Tu peux mieux faire'}
                    </h2>
                    <p className="text-gray-400 mb-4">
                      {detailedResults.correct} / {detailedResults.total} bonnes réponses
                    </p>
                    
                    {/* Performance Tier Badge */}
                    {testMode === 'competitive' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex flex-col items-center gap-2"
                      >
                        <div className={`px-6 py-3 rounded-xl font-bold text-2xl ${detailedResults.tier.color} bg-[#1e1e2e] border border-[#2a2a3a]`}>
                          Rang {detailedResults.tier.tier}
                        </div>
                        <span className="text-gray-400">{detailedResults.tier.message}</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Competitive Mode: Elo Breakdown */}
                  {testMode === 'competitive' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-8 p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]"
                    >
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                        Détail des points Elo
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-xl">
                          <span className="text-gray-400">Score de base ({detailedResults.correct}/{detailedResults.total})</span>
                          <span className={`font-semibold ${detailedResults.performance.baseChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {detailedResults.performance.baseChange >= 0 ? '+' : ''}{detailedResults.performance.baseChange}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-xl">
                          <span className="text-gray-400">Bonus de vitesse</span>
                          <span className={`font-semibold ${detailedResults.performance.speedBonus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {detailedResults.performance.speedBonus >= 0 ? '+' : ''}{detailedResults.performance.speedBonus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-xl">
                          <span className="text-gray-400">Bonus difficulté</span>
                          <span className="font-semibold text-green-400">+{detailedResults.performance.difficultyBonus}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-xl">
                          <span className="text-gray-400">Bonus précision (questions difficiles)</span>
                          <span className="font-semibold text-green-400">+{detailedResults.performance.accuracyBonus}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-xl">
                          <span className="text-gray-400">Bonus série</span>
                          <span className="font-semibold text-green-400">+{detailedResults.performance.streakBonus}</span>
                        </div>
                        <div className="border-t border-[#2a2a3a] pt-3">
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl">
                            <span className="font-semibold">Total Elo</span>
                            <span className={`font-bold text-xl ${detailedResults.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {detailedResults.eloChange >= 0 ? '+' : ''}{detailedResults.eloChange}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Questions Review */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold mb-4">Récapitulatif des questions</h3>
                    {detailedResults.results.map((result, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`p-4 rounded-xl border ${
                          result.isCorrect
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {result.isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-500" />
                            )}
                            <div>
                              <p className="font-mono text-lg">{result.question.question}</p>
                              {!result.isCorrect && (
                                <p className="text-sm text-gray-400 mt-1">
                                  Ta réponse: <span className="text-red-400">{result.userAnswer || '-'}</span>
                                  {' → '}
                                  Réponse: <span className="text-green-400">{result.question.answer}</span>
                                </p>
                              )}
                              {testMode === 'training' && result.attempts && result.attempts > 1 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {result.attempts} tentatives
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500">{result.timeTaken}s</span>
                            <span className="ml-2 px-2 py-0.5 bg-[#1a1a2e] rounded text-xs text-gray-400">
                              Niv.{result.question.difficulty}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => startTest(testMode!)}
                      className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                        testMode === 'competitive'
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                          : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600'
                      }`}
                    >
                      <RotateCcw className="w-5 h-5" />
                      Rejouer
                    </button>
                    <button
                      onClick={() => startTest(testMode === 'competitive' ? 'training' : 'competitive')}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-xl font-semibold transition-all border border-[#2a2a3a]"
                    >
                      {testMode === 'competitive' ? (
                        <>
                          <Target className="w-5 h-5 text-blue-400" />
                          Passer en entraînement
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 text-red-400" />
                          Passer en compétitif
                        </>
                      )}
                    </button>
                    <Link
                      href="/history"
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-xl font-semibold transition-all border border-[#2a2a3a]"
                    >
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      Voir l'historique
                    </Link>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-xl font-semibold transition-all border border-[#2a2a3a]"
                    >
                      <RotateCcw className="w-5 h-5 text-purple-400" />
                      Rafraîchir l'Elo
                    </button>
                    <Link
                      href="/"
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-xl font-semibold transition-all border border-[#2a2a3a]"
                    >
                      Retour à l'accueil
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Side Ads - Desktop/Tablet Only */}
      <HomePageSideAds />
    </div>
  );
}

function TestPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </div>
    }>
      <TestPage />
    </Suspense>
  );
}

export default TestPageWrapper;
