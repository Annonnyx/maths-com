'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Brain, Trophy, Target, Clock, CheckCircle, 
  ArrowRight, Calculator, Sparkles, Star, Send
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { Exercise, generateAdaptiveOnboardingTest, validateAnswer } from '@/lib/exercises';
import { calculateInitialElo } from '@/lib/elo';
import { getClassFromElo, formatClassName } from '@/lib/french-classes';
import { getClassFromDifficulty } from '@/lib/french-classes';

interface OnboardingState {
  questions: Exercise[];
  currentIndex: number;
  answers: string[];
  timePerQuestion: number[];
  startTime: number;
  currentLevel: number; // 1-10 adaptatif
  correctStreak: number;
  isComplete: boolean;
}

export default function OnboardingTestPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { playSound } = useSound();
  
  const [state, setState] = useState<OnboardingState>({
    questions: [],
    currentIndex: 0,
    answers: [],
    timePerQuestion: [],
    startTime: Date.now(),
    currentLevel: 5, // Commence au milieu (CE2)
    correctStreak: 0,
    isComplete: false
  });
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  // Générer le test initial
  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const generateInitialTest = async () => {
      try {
        const questions = await generateAdaptiveOnboardingTest(5); // 5 questions initiales
        setState(prev => ({ ...prev, questions, startTime: Date.now() }));
        setIsGenerating(false);
      } catch (error) {
        console.error('Error generating onboarding test:', error);
        setIsGenerating(false);
      }
    };

    generateInitialTest();
  }, [session, router]);

  const currentQuestion = state.questions[state.currentIndex];

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentAnswer.trim() || !currentQuestion) return;

    const questionStartTime = Date.now() - (state.timePerQuestion.reduce((a, b) => a + b, 0) + state.startTime);
    const timeTaken = Date.now() - questionStartTime;
    
    const correct = validateAnswer(currentQuestion, currentAnswer.trim());
    setIsCorrect(correct);
    setShowFeedback(true);
    
    playSound(correct ? 'correct' : 'incorrect');

    // Mettre à jour l'état
    const newAnswers = [...state.answers, currentAnswer.trim()];
    const newTimes = [...state.timePerQuestion, timeTaken];
    const newStreak = correct ? state.correctStreak + 1 : 0;
    
    // Adapter le niveau pour la prochaine question
    let newLevel = state.currentLevel;
    if (correct && newStreak >= 2) {
      newLevel = Math.min(10, state.currentLevel + 1); // Augmenter la difficulté
    } else if (!correct && state.correctStreak === 0) {
      newLevel = Math.max(1, state.currentLevel - 1); // Baisser la difficulté
    }

    setTimeout(() => {
      if (state.currentIndex >= state.questions.length - 1) {
        // Test terminé - calculer les résultats
        completeOnboarding(newAnswers, newTimes);
      } else {
        // Passer à la question suivante
        setState(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          answers: newAnswers,
          timePerQuestion: newTimes,
          currentLevel: newLevel,
          correctStreak: newStreak
        }));
        setCurrentAnswer('');
        setShowFeedback(false);
      }
    }, 1500);
  }, [currentAnswer, currentQuestion, state, playSound]);

  const completeOnboarding = async (finalAnswers: string[], finalTimes: number[]) => {
    try {
      // Calculer les performances
      const correctCount = finalAnswers.filter((answer, index) => 
        validateAnswer(state.questions[index], answer)
      ).length;
      
      const accuracy = correctCount / finalAnswers.length;
      const avgTime = finalTimes.reduce((a, b) => a + b, 0) / finalTimes.length;
      
      // Calculer l'ELO initial basé sur la performance et le niveau atteint
      const baseElo = calculateInitialElo(state.currentLevel, accuracy, avgTime);
      
      // Déterminer la classe scolaire
      const schoolClass = getClassFromElo(baseElo);
      
      // Sauvegarder les résultats
      const response = await fetch('/api/users/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soloElo: baseElo,
          soloRankClass: schoolClass,
          hasCompletedOnboarding: true
        })
      });

      if (response.ok) {
        setState(prev => ({ ...prev, isComplete: true }));
        playSound('achievement' as any); // Temporaire, à corriger selon les types disponibles
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
        <p className="ml-4 text-lg">Préparation de votre test de positionnement...</p>
      </div>
    );
  }

  if (state.isComplete) {
    const finalElo = state.answers.reduce((acc, answer, index) => {
      return acc + (validateAnswer(state.questions[index], answer) ? 50 : -25);
    }, 400);
    
    const schoolClass = getClassFromElo(finalElo);

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Test terminé !</h1>
          
          <div className="space-y-4 mb-6">
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Votre niveau</p>
              <p className="text-2xl font-bold text-primary">{formatClassName(schoolClass)}</p>
            </div>
            
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Points ELO</p>
              <p className="text-2xl font-bold text-purple-400">{finalElo}</p>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Les exercices seront maintenant adaptés à votre niveau pour vous faire progresser !
          </p>
          
          <button
            onClick={handleContinue}
            className="w-full py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            Commencer à s'entraîner
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Test de positionnement</h1>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>Question {state.currentIndex + 1}/{state.questions.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>Niveau {state.currentLevel}/10</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <motion.div
              className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((state.currentIndex + 1) / state.questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <motion.div
            key={state.currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl border border-border p-8"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm mb-4">
                <Calculator className="w-4 h-4" />
                <span>{currentQuestion.type}</span>
              </div>
              
              <div className="text-4xl font-bold mb-2">
                {currentQuestion.question}
              </div>
              
              {currentQuestion.explanation && (
                <p className="text-muted-foreground text-sm mt-2">
                  {currentQuestion.explanation}
                </p>
              )}
            </div>

            {/* Answer input */}
            <div className="space-y-4">
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                placeholder="Votre réponse..."
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-center text-2xl font-bold focus:border-primary focus:outline-none transition-all"
                autoFocus
                disabled={showFeedback}
              />
              
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`text-center p-4 rounded-xl ${
                      isCorrect 
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Correct !</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm">La réponse était : {currentQuestion.answer}</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || showFeedback}
                className="w-full py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {showFeedback ? (
                  state.currentIndex < state.questions.length - 1 ? 'Question suivante...' : 'Terminer le test'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Valider
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
