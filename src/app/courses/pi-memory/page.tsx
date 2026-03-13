'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Calculator, 
  Award, 
  Brain, 
  Target, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Zap,
  Sparkles,
  Infinity,
  PieChart,
  Eye,
  EyeOff
} from 'lucide-react';

const PI_DECIMALS = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679";

export default function PiMemoryPage() {
  const [gameMode, setGameMode] = useState<'menu' | 'hidden' | 'reveal'>('menu');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [bestScore, setBestScore] = useState<{ time: number; errors: number } | null>(null);
  const [showStats, setShowStats] = useState(false);

  const difficultySettings = {
    easy: { decimals: 10, name: 'Facile', color: 'from-green-500 to-emerald-600' },
    medium: { decimals: 25, name: 'Moyen', color: 'from-blue-500 to-indigo-600' },
    hard: { decimals: 50, name: 'Difficile', color: 'from-purple-500 to-pink-600' }
  };

  const targetDecimals = PI_DECIMALS.substring(2, difficultySettings[difficulty].decimals + 2);

  useEffect(() => {
    const saved = localStorage.getItem('pi-memory-best');
    if (saved) {
      setBestScore(JSON.parse(saved));
    }
  }, []);

  const startGame = (mode: 'hidden' | 'reveal') => {
    setGameMode(mode);
    setUserInput('');
    setCurrentIndex(0);
    setErrors(0);
    setStartTime(Date.now());
    setEndTime(0);
    setShowHint(false);
  };

  const handleInput = useCallback((value: string) => {
    if (gameMode === 'menu') return;

    const newInput = value.replace(/[^0-9]/g, '');
    
    if (gameMode === 'reveal') {
      // In reveal mode, show decimals progressively as user types
      if (newInput.length > userInput.length) {
        // User added a character
        const expectedChar = targetDecimals[currentIndex];
        const actualChar = newInput[newInput.length - 1];
        
        if (actualChar === expectedChar) {
          // Correct character, advance and show next
          setUserInput(newInput);
          setCurrentIndex(prev => prev + 1);
          
          // Celebrate if we reach the end
          if (currentIndex + 1 >= targetDecimals.length) {
            endGame();
          }
        } else {
          // Wrong character, don't advance
          setErrors(prev => prev + 1);
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          
          // Show error feedback
          const input = document.getElementById('pi-input') as HTMLInputElement;
          if (input) {
            input.classList.add('bg-red-500/20');
            setTimeout(() => input.classList.remove('bg-red-500/20'), 300);
          }
        }
      } else {
        // User deleted character
        setUserInput(newInput);
        setCurrentIndex(newInput.length);
      }
    } else {
      // Hidden mode - original logic
      setUserInput(newInput);

      if (newInput.length > currentIndex) {
        // L'utilisateur a ajouté un chiffre
        const expectedChar = targetDecimals[currentIndex];
        const actualChar = newInput[currentIndex];
        
        if (actualChar !== expectedChar) {
          setErrors(prev => prev + 1);
          // Vibration feedback si disponible
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          
          // Effacer le dernier caractère incorrect
          setUserInput(newInput.slice(0, -1));
          
          // Montrer brièvement l'erreur
          const input = document.getElementById('pi-input') as HTMLInputElement;
          if (input) {
            input.classList.add('bg-red-500/20');
            setTimeout(() => input.classList.remove('bg-red-500/20'), 300);
          }
        } else {
          setCurrentIndex(prev => prev + 1);
          
          // Célébrer si on atteint la fin
          if (currentIndex + 1 === targetDecimals.length) {
            endGame();
          }
        }
      } else if (newInput.length < currentIndex) {
        // L'utilisateur a effacé
        setCurrentIndex(newInput.length);
      }
    }
  }, [gameMode, currentIndex, targetDecimals, userInput]);

  const endGame = () => {
    setEndTime(Date.now());
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    if (!bestScore || timeTaken < bestScore.time || (timeTaken === bestScore.time && errors < bestScore.errors)) {
      setBestScore({ time: timeTaken, errors });
      localStorage.setItem('pi-memory-best', JSON.stringify({ time: timeTaken, errors }));
    }
    
    setShowStats(true);
  };

  const resetGame = () => {
    setGameMode('menu');
    setUserInput('');
    setCurrentIndex(0);
    setErrors(0);
    setStartTime(0);
    setEndTime(0);
    setShowHint(false);
    setShowStats(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = () => {
    if (errors === 0) return 'text-green-400';
    if (errors <= 2) return 'text-yellow-400';
    if (errors <= 5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreMessage = () => {
    if (errors === 0) return 'Parfait !';
    if (errors <= 2) return 'Excellent !';
    if (errors <= 5) return 'Très bien !';
    if (errors <= 10) return 'Bien !';
    return 'À améliorer';
  };

  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity as any, ease: "linear" }}
              className="inline-block mb-6"
            >
              <PieChart className="w-16 h-16 text-purple-400" />
            </motion.div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Défi π (Pi)
            </h1>
            <p className="text-xl text-purple-200 mb-8">
              Maîtrise les décimales du nombre le plus fascinant des mathématiques
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
              <div className="text-6xl font-mono mb-2">
                3.<span className="text-purple-300">1415926535...</span>
              </div>
              <p className="text-purple-200">
                Apprends et mémorise les décimales de Pi avec nos modes d'entraînement
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <EyeOff className="w-8 h-8 text-blue-400" />
                <h3 className="text-2xl font-bold">Mode Caché</h3>
              </div>
              <p className="text-blue-200 mb-4">
                Les décimales sont masquées. Écris-les de mémoire et détecte tes erreurs instantanément !
              </p>
              <ul className="text-sm text-blue-300 space-y-1 mb-6">
                <li>• Correction immédiate en cas d'erreur</li>
                <li>• Compteur d'erreurs précis</li>
                <li>• Idéal pour la mémorisation</li>
              </ul>
              <button
                onClick={() => startGame('hidden')}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-semibold transition-all"
              >
                Commencer le Mode Caché
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-8 h-8 text-purple-400" />
                <h3 className="text-2xl font-bold">Mode Révélation</h3>
              </div>
              <p className="text-purple-200 mb-4">
                Les décimales s'affichent progressivement. Teste ta vitesse de frappe !
              </p>
              <ul className="text-sm text-purple-300 space-y-1 mb-6">
                <li>• Les décimales apparaissent une par une</li>
                <li>• Chronomètre précis</li>
                <li>• Parfait pour la vitesse</li>
              </ul>
              <button
                onClick={() => startGame('reveal')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg font-semibold transition-all"
              >
                Commencer le Mode Révélation
              </button>
            </motion.div>
          </div>

          {/* Sélection de la difficulté */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-center">Difficulté</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(difficultySettings).map(([key, settings]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key as 'easy' | 'medium' | 'hard')}
                  className={`p-4 rounded-lg border transition-all ${
                    difficulty === key
                      ? 'bg-gradient-to-r ' + settings.color + ' border-white/50'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}
                >
                  <div className="font-bold">{settings.name}</div>
                  <div className="text-sm opacity-75">{settings.decimals} décimales</div>
                </button>
              ))}
            </div>
          </div>

          {/* Meilleur score */}
          {bestScore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-500/30 mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="font-bold">Meilleur Score</h3>
                    <p className="text-sm text-yellow-200">
                      {formatTime(bestScore.time)} • {bestScore.errors} erreur{bestScore.errors > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg"
                >
                  <Brain className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          <div className="text-center">
            <Link 
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Retour aux cours
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header du jeu */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <PieChart className="w-12 h-12 text-purple-400" />
            <h1 className="text-3xl font-bold">Défi π - Mode {gameMode === 'hidden' ? 'Caché' : 'Révélation'}</h1>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(Math.floor((Date.now() - startTime) / 1000))}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>{errors} erreur{errors > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{currentIndex}/{targetDecimals.length}</span>
            </div>
          </div>
        </div>

        {/* Zone de jeu principale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-6"
        >
          {/* Affichage de Pi */}
          <div className="text-center mb-8">
            <div className="text-4xl font-mono mb-4">
              3.
              {gameMode === 'hidden' ? (
                <>
                  <span className="text-purple-300">{userInput}</span>
                  <span className="text-purple-500/30 animate-pulse">{'_'.repeat(Math.max(0, targetDecimals.length - userInput.length))}</span>
                </>
              ) : (
                <>
                  {/* Progressive reveal mode - show what user has typed correctly */}
                  <span className="text-purple-300">{userInput}</span>
                  {/* Show next target character faintly */}
                  {currentIndex < targetDecimals.length && (
                    <span className="text-purple-500/30 animate-pulse">
                      {targetDecimals[currentIndex]}
                    </span>
                  )}
                  {/* Show remaining characters very faintly */}
                  <span className="text-purple-500/10">
                    {targetDecimals.substring(currentIndex + 1)}
                  </span>
                </>
              )}
            </div>
            
            {gameMode === 'hidden' && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
              >
                {showHint ? 'Masquer' : 'Montrer'} l'indice
              </button>
            )}
            
            {showHint && gameMode === 'hidden' && currentIndex < targetDecimals.length && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-2xl font-mono text-purple-400"
              >
                Prochain chiffre: <span className="text-purple-300 font-bold">{targetDecimals[currentIndex]}</span>
              </motion.div>
            )}
            
            {/* Progressive display for reveal mode */}
            {gameMode === 'reveal' && (
              <div className="mt-4 text-sm text-purple-300">
                <p>Progression: {currentIndex}/{targetDecimals.length} décimales</p>
                <div className="w-full bg-purple-900/30 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentIndex / targetDecimals.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Champ de saisie */}
          <div className="max-w-md mx-auto mb-6">
            <input
              id="pi-input"
              type="text"
              value={userInput}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Écris les décimales..."
              className="w-full p-4 bg-white/20 border border-white/30 rounded-lg text-center text-2xl font-mono focus:outline-none focus:border-purple-400 transition-all"
              autoFocus
              disabled={showStats}
            />
          </div>

          {/* Contrôles */}
          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-all"
            >
              Abandonner
            </button>
            {gameMode === 'hidden' && (
              <button
                onClick={() => {
                  setUserInput(targetDecimals);
                  setCurrentIndex(targetDecimals.length);
                  endGame();
                }}
                className="px-6 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-lg transition-all"
              >
                Voir la solution
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats de fin */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20"
          >
            <div className="text-center">
              <div className="mb-6">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Défi Terminé !</h2>
                <div className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>
                  {getScoreMessage()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{formatTime(Math.floor((endTime - startTime) / 1000))}</div>
                  <div className="text-sm text-blue-200">Temps total</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{errors}</div>
                  <div className="text-sm text-red-200">Erreur{errors > 1 ? 's' : ''}</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{targetDecimals.length}</div>
                  <div className="text-sm text-green-200">Décimales</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => startGame(gameMode)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg font-semibold transition-all"
                >
                  Recommencer
                </button>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all"
                >
                  Menu principal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
