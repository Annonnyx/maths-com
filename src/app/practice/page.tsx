'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Trophy, Target, ArrowLeft, CheckCircle, XCircle, 
  RotateCcw, Calculator, Settings2
} from 'lucide-react';
import { generateExercise, Exercise, OperationType, validateAnswer } from '@/lib/exercises';
import { useSound } from '@/components/SoundProvider';
import { HomePageSideAds } from '@/components/ResponsiveSideAd';

const OPERATIONS: { type: OperationType; label: string; icon: string; color: string }[] = [
  { type: 'addition', label: 'Addition', icon: '+', color: 'from-blue-500/20 to-blue-600/20' },
  { type: 'subtraction', label: 'Soustraction', icon: '-', color: 'from-green-500/20 to-green-600/20' },
  { type: 'multiplication', label: 'Multiplication', icon: '×', color: 'from-purple-500/20 to-purple-600/20' },
  { type: 'division', label: 'Division', icon: '÷', color: 'from-orange-500/20 to-orange-600/20' },
  { type: 'power', label: 'Puissance', icon: '^', color: 'from-red-500/20 to-red-600/20' },
  { type: 'root', label: 'Racine', icon: '√', color: 'from-cyan-500/20 to-cyan-600/20' },
  { type: 'factorization', label: 'Factorisation', icon: '∑', color: 'from-pink-500/20 to-pink-600/20' },
];

export default function PracticePage() {
  const [selectedOperation, setSelectedOperation] = useState<OperationType>('addition');
  const [difficulty, setDifficulty] = useState(3);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [showSettings, setShowSettings] = useState(true);
  const { playSound } = useSound();

  const generateNewExercise = () => {
    playSound('tick');
    const exercise = generateExercise(selectedOperation, difficulty);
    setCurrentExercise(exercise);
    setInputValue('');
    setFeedback(null);
  };

  useEffect(() => {
    if (!showSettings) {
      generateNewExercise();
    }
  }, [selectedOperation, difficulty, showSettings]);

  const submitAnswer = () => {
    if (!currentExercise || !inputValue.trim()) return;

    const isCorrect = validateAnswer(currentExercise, inputValue);
    playSound(isCorrect ? 'correct' : 'incorrect');
    setFeedback({
      isCorrect,
      message: isCorrect 
        ? '✓ Correct !' 
        : `✗ Mauvaise réponse. La réponse était ${currentExercise.answer}`
    });

    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (feedback) {
        generateNewExercise();
      } else {
        submitAnswer();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
              <Trophy className="w-6 h-6" />
              <span className="font-bold">Math.com</span>
            </Link>
            <span className="text-gray-500">|</span>
            <span className="text-muted-foreground">Exercices libres</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg">
              <Target className="w-5 h-5 text-green-400" />
              <span className="font-semibold">{stats.correct}/{stats.total}</span>
              {stats.streak > 0 && (
                <span className="text-orange-400">({stats.streak} 🔥)</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-2 mb-8">
                <Link href="/" className="text-muted-foreground hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold">Configuration des exercices</h1>
              </div>

              {/* Operation Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Type d'opération</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {OPERATIONS.map((op) => (
                    <button
                      key={op.type}
                      onClick={() => {
                        playSound('click');
                        setSelectedOperation(op.type);
                      }}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedOperation === op.type
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-border bg-card hover:border-[#3a3a4a]'
                      }`}
                    >
                      <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${op.color} flex items-center justify-center text-xl font-bold`}>
                        {op.icon}
                      </div>
                      <p className="text-sm font-medium">{op.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Difficulté</h2>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        playSound('click');
                        setDifficulty(level);
                      }}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                        difficulty === level
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                          : 'bg-card hover:bg-border'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {difficulty <= 3 ? 'Facile - Nombres petits, calculs rapides' :
                   difficulty <= 6 ? 'Moyen - Nombres moyens, quelques retenues' :
                   difficulty <= 8 ? 'Difficile - Grands nombres, calculs complexes' :
                   'Expert - Nombres très grands, mental calculation avancé'}
                </p>
              </div>

              {/* Start Button */}
              <button
                onClick={() => {
                  playSound('click');
                  setShowSettings(false);
                }}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all glow-primary"
              >
                Commencer l'entraînement
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => {
                    playSound('click');
                    setShowSettings(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg hover:bg-border transition-all"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Paramètres</span>
                </button>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="capitalize">{OPERATIONS.find(o => o.type === selectedOperation)?.label}</span>
                  <span>|</span>
                  <span>Difficulté {difficulty}</span>
                </div>
              </div>

              {/* Exercise Card */}
              {currentExercise && (
                <div className="text-center mb-12">
                  <motion.div
                    key={currentExercise.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8"
                  >
                    <div className="p-8 bg-[#12121a] rounded-2xl border border-border">
                      <h2 className="text-5xl md:text-6xl font-bold font-mono">
                        {currentExercise.question}
                      </h2>
                    </div>
                  </motion.div>

                  {/* Input */}
                  <div className="flex flex-col items-center gap-6">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ta réponse..."
                      className="w-full max-w-xs px-6 py-4 bg-card border-2 border-border rounded-xl text-center text-2xl font-mono focus:border-indigo-500 focus:outline-none transition-all"
                      autoFocus
                      disabled={!!feedback}
                    />
                    
                    {!feedback ? (
                      <button
                        onClick={submitAnswer}
                        disabled={!inputValue.trim()}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all glow-primary"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Valider
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl ${
                          feedback.isCorrect 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : 'bg-red-500/20 border border-red-500/30'
                        }`}
                      >
                        <p className={`text-lg font-semibold ${
                          feedback.isCorrect ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {feedback.message}
                        </p>
                        {currentExercise.explanation && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {currentExercise.explanation}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {feedback && (
                      <button
                        onClick={generateNewExercise}
                        className="flex items-center gap-2 px-8 py-3 bg-card hover:bg-border rounded-xl font-semibold transition-all border border-border"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Exercice suivant
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-12 p-6 bg-[#12121a] rounded-2xl border border-border">
                <h3 className="text-lg font-semibold mb-4">Statistiques de la session</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-400">{stats.correct}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-400">{stats.total - stats.correct}</p>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-indigo-400">
                      {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Taux de réussite</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Side Ads - Desktop/Tablet Only */}
      <HomePageSideAds />
    </div>
  );
}
