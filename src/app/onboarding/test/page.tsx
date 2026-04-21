'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  Brain, Trophy, Target, Clock, CheckCircle, XCircle,
  ArrowRight, Calculator, Sparkles, Star, Send
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { Exercise, OperationType, FrenchClass } from '@/lib/french-classes';
import { generateTest, validateAnswer } from '@/lib/exercises';
import { calculateDiagnosticElo, DiagnosticResult } from '@/lib/elo';
import { getClassFromElo, formatClassName } from '@/lib/french-classes';

interface OnboardingState {
  questions: Exercise[];
  currentIndex: number;
  answers: string[];
  timePerQuestion: number[];
  startTime: number;
  isComplete: boolean;
  finalElo?: number;
  schoolClass?: string;
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
    isComplete: false
  });
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  // Générer le test diagnostic avec questions à différents niveaux
  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const generateDiagnosticTest = async () => {
      try {
        // Test diagnostique : 3 questions à 5 niveaux différents (15 total)
        // Permet d'évaluer précisément où se situe l'utilisateur
        const eloLevels = [400, 800, 1200, 1600, 2000]; // CP-CE1, CM1-CM2, 6e-5e, 3e-2de, Terminale+
        const questionsPerLevel = 3;
        
        let allQuestions: Exercise[] = [];
        
        eloLevels.forEach(elo => {
          const levelQuestions = generateTest(elo, questionsPerLevel);
          allQuestions = [...allQuestions, ...levelQuestions];
        });
        
        // Mélanger les questions pour ne pas avoir de pattern évident
        allQuestions = allQuestions.sort(() => Math.random() - 0.5);
        
        setState(prev => ({ ...prev, questions: allQuestions, startTime: Date.now() }));
        setIsGenerating(false);
      } catch (error) {
        console.error('Error generating onboarding test:', error);
        setIsGenerating(false);
      }
    };

    generateDiagnosticTest();
  }, [session, router]);

  const currentQuestion = state.questions[state.currentIndex];

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentAnswer.trim() || !currentQuestion) return;

    const questionStartTime = Date.now() - (state.timePerQuestion.reduce((a, b) => a + b, 0) + state.startTime);
    const timeTaken = Date.now() - questionStartTime;
    
    const correct = validateAnswer(currentQuestion as any, currentAnswer.trim());
    setIsCorrect(correct);
    setShowFeedback(true);
    
    playSound(correct ? 'correct' : 'incorrect');

    // Mettre à jour l'état
    const newAnswers = [...state.answers, currentAnswer.trim()];
    const newTimes = [...state.timePerQuestion, timeTaken];

    setTimeout(() => {
      if (state.currentIndex >= state.questions.length - 1) {
        // Test terminé - mettre à jour le state d'abord puis calculer les résultats
        setState(prev => ({ ...prev, answers: newAnswers, timePerQuestion: newTimes }));
        completeOnboarding(newAnswers, newTimes);
      } else {
        // Passer à la question suivante
        setState(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          answers: newAnswers,
          timePerQuestion: newTimes
        }));
        setCurrentAnswer('');
        setShowFeedback(false);
      }
    }, 1500);
  }, [currentAnswer, currentQuestion, state, playSound]);

  const completeOnboarding = async (finalAnswers: string[], finalTimes: number[]) => {
    try {
      // Construire les résultats diagnostiques avec le niveau ELO de chaque question
      const diagnosticResults: DiagnosticResult[] = finalAnswers.map((answer, index) => {
        const question = state.questions[index];
        // Déterminer le niveau ELO de la question à partir de sa classe
        const classToElo: Record<string, number> = {
          'CP': 400, 'CE1': 400, 'CE2': 800, 'CM1': 800, 'CM2': 1200,
          '6e': 1200, '5e': 1600, '4e': 1600, '3e': 2000, '2de': 2000,
          '1re': 2000, 'Tle': 2000, 'Sup1': 2000, 'Sup2': 2000, 'Sup3': 2000, 'Pro': 2000
        };
        const questionElo = classToElo[question?.className || 'CM2'] || 1200;
        
        return {
          levelElo: questionElo,
          isCorrect: validateAnswer(question as any, answer),
          timeTaken: Math.round(finalTimes[index] / 1000) // Convertir ms en secondes
        };
      });
      
      // Calculer l'ELO avec l'algorithme diagnostique
      const finalElo = calculateDiagnosticElo(diagnosticResults);
      
      // Déterminer la classe scolaire
      const schoolClass = getClassFromElo(finalElo);
      
      // Sauvegarder les résultats
      const response = await fetch('/api/users/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soloElo: finalElo,
          soloClass: schoolClass,
          hasCompletedOnboarding: true
        })
      });

      if (response.ok) {
        setState(prev => ({ ...prev, isComplete: true, answers: finalAnswers, timePerQuestion: finalTimes }));
        playSound('achievement' as any); // Temporaire, à corriger selon les types disponibles
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleContinue = () => {
    // Forcer le rafraîchissement complet pour mettre à jour la session
    window.location.href = '/dashboard';
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
    const finalElo = state.finalElo || 400;
    const schoolClass = state.schoolClass || getClassFromElo(finalElo);

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
              
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                {currentQuestion.question}
              </div>
              
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
                    className={`text-center p-3 sm:p-4 rounded-xl w-full max-w-xs mx-auto overflow-hidden ${
                      isCorrect 
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle className="w-5 h-5 flex-shrink-0" />
                          <span className="break-words">Correct !</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 flex-shrink-0" />
                          <span className="break-words">Incorrect</span>
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
