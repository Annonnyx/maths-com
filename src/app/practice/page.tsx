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
import { FrenchClass, FRENCH_CLASSES, CLASS_INFO, getUnlockedClasses } from '@/lib/french-classes';
import { useSession } from 'next-auth/react';
import { RankClass } from '@/lib/elo';

const OPERATIONS: { type: OperationType; label: string; icon: string; color: string }[] = [
  { type: 'addition', label: 'Addition', icon: '+', color: 'from-blue-500/20 to-blue-600/20' },
  { type: 'subtraction', label: 'Soustraction', icon: '-', color: 'from-green-500/20 to-green-600/20' },
  { type: 'multiplication', label: 'Multiplication', icon: '×', color: 'from-purple-500/20 to-purple-600/20' },
  { type: 'division', label: 'Division', icon: '÷', color: 'from-orange-500/20 to-orange-600/20' },
  { type: 'power', label: 'Puissance', icon: '^', color: 'from-red-500/20 to-red-600/20' },
  { type: 'root', label: 'Racine', icon: '√', color: 'from-cyan-500/20 to-cyan-600/20' },
  { type: 'factorization', label: 'Factorisation', icon: '∑', color: 'from-pink-500/20 to-pink-600/20' },
  { type: 'geometry', label: 'Géométrie', icon: '◈', color: 'from-yellow-500/20 to-yellow-600/20' },
];

// Map French class to difficulty level (1-10)
const CLASS_TO_DIFFICULTY: Record<FrenchClass, number> = {
  'CP': 1,
  'CE1': 2,
  'CE2': 3,
  'CM1': 4,
  'CM2': 5,
  '6e': 6,
  '5e': 7,
  '4e': 8,
  '3e': 9,
  '2de': 9,
  '1re': 10,
  'Tle': 10,
  'Sup1': 10,
  'Sup2': 10,
  'Sup3': 10,
  'Pro': 10
};

export default function PracticePage() {
  const { data: session } = useSession();
  const [selectedOperation, setSelectedOperation] = useState<OperationType>('addition');
  const [selectedClass, setSelectedClass] = useState<FrenchClass>('CP');
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [showSettings, setShowSettings] = useState(true);
  const { playSound } = useSound();
  const [excludeGeometry, setExcludeGeometry] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('excludeGeometry') === 'true';
    }
    return false;
  });

  // Get available operations for a class (geometry excluded if setting is on)
  const getOperationsForClass = (className: FrenchClass, excludeGeo: boolean): OperationType[] => {
    const baseOps: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
    const advancedOps: OperationType[] = ['power', 'root', 'factorization', 'percentage', 'fraction'];
    
    const classIndex = FRENCH_CLASSES.indexOf(className);
    
    let ops: OperationType[] = [];
    
    // CP-CM2: basics only
    if (classIndex <= 4) {
      ops = ['addition', 'subtraction'];
      if (classIndex >= 2) ops.push('multiplication');
      if (classIndex >= 4) ops.push('division');
    }
    // Collège: basics + some advanced + geometry
    else if (classIndex <= 8) {
      ops = [...baseOps, 'percentage', 'fraction'];
      // Add geometry for 6e and above (unless excluded)
      if (!excludeGeo && classIndex >= 6) {
        ops.push('geometry');
      }
    }
    // Lycée and above: all operations including geometry
    else {
      ops = [...baseOps, ...advancedOps];
      if (!excludeGeo) {
        ops.push('geometry');
      }
    }
    
    return ops;
  };

  // Get unlocked classes based on user's rank
  const userRank = (session?.user as any)?.rankClass as RankClass || 'F-';
  const unlockedClasses = getUnlockedClasses(userRank);

  const generateNewExercise = () => {
    playSound('tick');
    const difficulty = CLASS_TO_DIFFICULTY[selectedClass];
    
    // Get available operations for this class
    const availableOps = getOperationsForClass(selectedClass, excludeGeometry);
    const randomOp = availableOps[Math.floor(Math.random() * availableOps.length)];
    setSelectedOperation(randomOp);
    
    const exercise = generateExercise(randomOp, difficulty);
    setCurrentExercise(exercise);
    setInputValue('');
    setFeedback(null);
  };

  useEffect(() => {
    if (!showSettings) {
      generateNewExercise();
    }
  }, [selectedOperation, selectedClass, showSettings]);

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
              <span className="font-bold">maths-app.com</span>
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
              <p className="text-sm text-muted-foreground mt-1">
                Choisis ta classe pour générer des exercices adaptés
              </p>

              {/* Class Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Classe</h2>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {unlockedClasses.map((className) => (
                    <button
                      key={className}
                      onClick={() => {
                        playSound('click');
                        setSelectedClass(className);
                      }}
                      className={`py-3 rounded-lg font-semibold transition-all ${
                        selectedClass === className
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                          : 'bg-card hover:bg-border'
                      }`}
                    >
                      {className}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {CLASS_INFO[selectedClass].description}
                </p>
                {unlockedClasses.length < FRENCH_CLASSES.length && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    💡 Monte en rang pour débloquer plus de classes !
                  </p>
                )}
              </div>

              {/* Geometry Toggle */}
              <div className="mb-8 p-4 bg-card rounded-xl border border-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeGeometry}
                    onChange={(e) => {
                      setExcludeGeometry(e.target.checked);
                      localStorage.setItem('excludeGeometry', e.target.checked.toString());
                    }}
                    className="w-5 h-5 rounded border-border bg-background text-indigo-500 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="font-medium">Exclure la géométrie</p>
                    <p className="text-sm text-muted-foreground">
                      Ne pas inclure les exercices de géométrie (formes, périmètres, aires)
                    </p>
                  </div>
                </label>
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
                  <span>Changer de classe</span>
                </button>
                <div className="text-sm text-muted-foreground">
                  Classe {selectedClass}
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
