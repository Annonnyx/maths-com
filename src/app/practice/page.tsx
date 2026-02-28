'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Trophy, Target, ArrowLeft, CheckCircle, XCircle, 
  RotateCcw, Calculator, Settings2, BookOpen, Clock
} from 'lucide-react';
import { generateExercise, Exercise, OperationType, validateAnswer } from '@/lib/exercises';
import { useSound } from '@/components/SoundProvider';
import { HomePageSideAds } from '@/components/ResponsiveSideAd';
import { FrenchClass, FRENCH_CLASSES, CLASS_INFO, getUnlockedClasses } from '@/lib/french-classes';
import { useSession } from 'next-auth/react';
import { RankClass } from '@/lib/elo';

// Types pour le mode ciblé
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  relatedTypes: OperationType[];
  difficulty: number;
}

interface CoursePracticeSession {
  courseId: string;
  courseTitle: string;
  questions: Exercise[];
  currentIndex: number;
  correctAnswers: number;
  startTime: number;
  isCompleted: boolean;
}

interface Stats {
  correct: number;
  total: number;
  streak: number;
}

interface Feedback {
  isCorrect: boolean;
  message: string;
}

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

function PracticePage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id');
  
  const [selectedOperation, setSelectedOperation] = useState<OperationType>('addition');
  const [difficulty, setDifficulty] = useState(5);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, streak: 0 });
  const [selectedClass, setSelectedClass] = useState<FrenchClass>('6e');
  const [showSettings, setShowSettings] = useState(false);
  const [timeLimit, setTimeLimit] = useState(0); // 0 = no limit
  
  // États pour le mode ciblé
  const [course, setCourse] = useState<Course | null>(null);
  const [courseSession, setCourseSession] = useState<CoursePracticeSession | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  
  const { playSound } = useSound();
  const [excludeGeometry, setExcludeGeometry] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('excludeGeometry') === 'true';
    }
    return false;
  });

  // Get available operations for a class (geometry excluded if setting is on)
  const getOperationsForClass = (className: FrenchClass, excludeGeo: boolean): OperationType[] => {
    const classIndex = FRENCH_CLASSES.indexOf(className);
    let operations = OPERATIONS.map(op => op.type);
    
    // Filter based on class level
    if (classIndex <= 4) { // CP to CM2
      operations = operations.filter(op => 
        ['addition', 'subtraction', 'multiplication'].includes(op)
      );
    } else if (classIndex <= 7) { // 6e to 5e
      operations = operations.filter(op => 
        !['power', 'root', 'factorization', 'delta', 'quadratic'].includes(op)
      );
    }
    
    if (excludeGeo) {
      operations = operations.filter(op => op !== 'geometry');
    }
    
    return operations;
  };

  // Charger les détails du cours si mode ciblé
  useEffect(() => {
    if (courseId) {
      loadCourseDetails(courseId);
    }
  }, [courseId]);

  const loadCourseDetails = async (id: string) => {
    setIsLoadingCourse(true);
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
        
        // Démarrer une session ciblée
        startCourseSession(courseData);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setIsLoadingCourse(false);
    }
  };

  const startCourseSession = (courseData: Course) => {
    const questions: Exercise[] = [];
    const baseDifficulty = courseData.difficulty || 5;
    
    // Générer 10 questions basées sur les types du cours
    for (let i = 0; i < 10; i++) {
      const operationType = courseData.relatedTypes[
        Math.floor(Math.random() * courseData.relatedTypes.length)
      ];
      const questionDifficulty = Math.max(1, Math.min(10, baseDifficulty + Math.floor(Math.random() * 3) - 1));
      questions.push(generateExercise(operationType, questionDifficulty));
    }

    setCourseSession({
      courseId: courseData.id,
      courseTitle: courseData.title,
      questions,
      currentIndex: 0,
      correctAnswers: 0,
      startTime: Date.now(),
      isCompleted: false
    });

    setCurrentExercise(questions[0]);
    setInputValue('');
    setFeedback(null);
  };

  // Mode libre : générer un nouvel exercice
  const generateNewExercise = () => {
    if (courseSession) {
      // Mode ciblé : passer à la question suivante
      const nextIndex = courseSession.currentIndex + 1;
      if (nextIndex < courseSession.questions.length) {
        setCourseSession({
          ...courseSession,
          currentIndex: nextIndex
        });
        setCurrentExercise(courseSession.questions[nextIndex]);
      } else {
        // Session terminée
        completeCourseSession();
      }
    } else {
      // Mode libre
      const difficulty = CLASS_TO_DIFFICULTY[selectedClass];
      const availableOps = getOperationsForClass(selectedClass, excludeGeometry);
      const randomOp = availableOps[Math.floor(Math.random() * availableOps.length)];
      setSelectedOperation(randomOp);
      
      const exercise = generateExercise(randomOp, difficulty);
      setCurrentExercise(exercise);
    }
    
    setInputValue('');
    setFeedback(null);
  };

  const completeCourseSession = async () => {
    if (!courseSession || !session?.user) return;

    const score = Math.round((courseSession.correctAnswers / courseSession.questions.length) * 100);
    const timeSpent = Math.round((Date.now() - courseSession.startTime) / 1000);

    try {
      await fetch('/api/course-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          courseId: courseSession.courseId,
          score,
          questionsCount: courseSession.questions.length,
          correctAnswers: courseSession.correctAnswers,
          timeSpentSeconds: timeSpent,
          difficultyLevel: difficulty
        })
      });
    } catch (error) {
      console.error('Error saving course practice:', error);
    }

    setCourseSession({
      ...courseSession,
      isCompleted: true
    });
  };

  useEffect(() => {
    if (!showSettings && !courseSession) {
      generateNewExercise();
    }
  }, [selectedOperation, selectedClass, showSettings]);

  const submitAnswer = () => {
    if (!currentExercise || !inputValue.trim()) return;

    const isCorrect = validateAnswer(currentExercise, inputValue);
    playSound(isCorrect ? 'correct' : 'incorrect');
    
    if (courseSession) {
      // Mode ciblé : mettre à jour les réponses correctes
      setCourseSession({
        ...courseSession,
        correctAnswers: courseSession.correctAnswers + (isCorrect ? 1 : 0)
      });
    }

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

  const isCourseMode = !!courseId && !!course;

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
            {isCourseMode ? (
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span className="text-muted-foreground">Entraînement : {course?.title}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Exercices libres</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {courseSession && (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-lg">
                <span className="text-sm">Question {courseSession.currentIndex + 1}/{courseSession.questions.length}</span>
              </div>
            )}
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
          {courseSession?.isCompleted ? (
            // Session terminée
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl border border-purple-500/30">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Session terminée !</h2>
                <p className="text-lg mb-4">
                  Score : {Math.round((courseSession.correctAnswers / courseSession.questions.length) * 100)}%
                </p>
                <p className="text-muted-foreground mb-6">
                  {courseSession.correctAnswers}/{courseSession.questions.length} réponses correctes
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => course && startCourseSession(course)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                  >
                    Continuer
                  </button>
                  <Link
                    href={course ? `/courses/${course.slug}` : '/courses'}
                    className="px-6 py-3 bg-card hover:bg-border rounded-lg font-medium transition-colors"
                  >
                    Retour au cours
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : isLoadingCourse ? (
            // Chargement du cours
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement du cours...</p>
            </motion.div>
          ) : currentExercise ? (
            // Exercice en cours
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-500/30 mb-4">
                    <span className="text-indigo-400 font-medium">
                      {OPERATIONS.find(op => op.type === currentExercise.type)?.label || currentExercise.type}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-purple-400">Niveau {currentExercise.difficulty}</span>
                  </div>
                </div>

                <div className="bg-[#12121a] rounded-2xl border border-border p-8 mb-6">
                  <div className="text-center mb-8">
                    <div className="text-4xl font-bold text-white mb-2">
                      {currentExercise.question}
                    </div>
                    <div className="text-gray-400">
                      {currentExercise.explanation && (
                        <p className="text-sm mt-2">{currentExercise.explanation}</p>
                      )}
                    </div>
                  </div>

                  <div className="max-w-xs mx-auto">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ta réponse..."
                      className="w-full px-4 py-3 bg-card border border-border rounded-lg text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      autoFocus
                      disabled={!!feedback}
                    />
                  </div>

                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 p-4 rounded-lg text-center ${
                        feedback.isCorrect 
                          ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                          : 'bg-red-500/20 border border-red-500/30 text-red-400'
                      }`}
                    >
                      {feedback.message}
                    </motion.div>
                  )}

                  <div className="flex gap-4 justify-center mt-6">
                    {!feedback ? (
                      <button
                        onClick={submitAnswer}
                        disabled={!inputValue.trim()}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
                      >
                        Valider
                      </button>
                    ) : (
                      <button
                        onClick={generateNewExercise}
                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition-all"
                      >
                        {courseSession && courseSession.currentIndex < courseSession.questions.length - 1 
                          ? 'Question suivante' 
                          : courseSession 
                            ? 'Terminer la session'
                            : 'Nouvel exercice'
                        }
                      </button>
                    )}
                  </div>
                </div>

                {!isCourseMode && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Settings2 className="w-4 h-4" />
                      Changer les paramètres
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            // Paramètres (mode libre uniquement)
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

              {/* Class Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Classe</h2>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {FRENCH_CLASSES.map((className) => (
                    <button
                      key={className}
                      onClick={() => setSelectedClass(className)}
                      className={`p-3 rounded-lg font-medium transition-all ${
                        selectedClass === className
                          ? 'bg-indigo-600 text-white'
                          : 'bg-card hover:bg-border text-muted-foreground'
                      }`}
                    >
                      {className}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-semibold transition-all"
                >
                  Commencer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <HomePageSideAds />
    </div>
  );
}

function PracticePageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    }>
      <PracticePage />
    </Suspense>
  );
}

export default PracticePageWithSuspense;
