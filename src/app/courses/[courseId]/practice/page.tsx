'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Target, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { COURSES_BY_CLASS } from '@/lib/courses-data';
import { FrenchClass } from '@/lib/french-classes';

interface Question {
  problem: string;
  solution: string;
  explanation: string;
  skill?: string;
}

interface CoursePracticeState {
  questions: Question[];
  currentIndex: number;
  userAnswers: string[];
  correctAnswers: number;
  startTime: number;
  endTime?: number;
  isCompleted: boolean;
}

export default function CoursePracticePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const courseId = params.courseId;
  
  // Trouver le cours correspondant
  const course = Object.values(COURSES_BY_CLASS).find(c => c.id === courseId);
  
  if (!course) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cours non trouvé</h1>
          <Link href="/courses" className="text-indigo-400 hover:text-indigo-300">
            Retour aux cours
          </Link>
        </div>
      </div>
    );
  }

  const [practiceState, setPracticeState] = useState<CoursePracticeState>({
    questions: [],
    currentIndex: 0,
    userAnswers: [],
    correctAnswers: 0,
    startTime: Date.now(),
    isCompleted: false
  });

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Générer les questions au chargement
  useEffect(() => {
    generateQuestions();
  }, [course]);

  const generateQuestions = () => {
    const allQuestions: Question[] = [];
    
    // Extraire toutes les questions des sections du cours
    course.sections.forEach(section => {
      if (section.examples) {
        section.examples.forEach(example => {
          allQuestions.push({
            problem: example.problem,
            solution: example.solution,
            explanation: example.explanation,
            skill: section.title
          });
        });
      }
    });

    // Mélanger et prendre 20 questions maximum
    const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, Math.min(20, allQuestions.length));
    
    setPracticeState(prev => ({
      ...prev,
      questions: shuffled
    }));
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim() || showFeedback) return;

    const currentQuestion = practiceState.questions[practiceState.currentIndex];
    const correct = currentAnswer.trim() === currentQuestion.solution;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    const newCorrectAnswers = correct ? practiceState.correctAnswers + 1 : practiceState.correctAnswers;
    const newUserAnswers = [...practiceState.userAnswers, currentAnswer.trim()];
    
    setTimeout(() => {
      if (practiceState.currentIndex < practiceState.questions.length - 1) {
        // Passer à la question suivante
        setPracticeState(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          correctAnswers: newCorrectAnswers,
          userAnswers: newUserAnswers
        }));
        setCurrentAnswer('');
        setShowFeedback(false);
      } else {
        // Terminer l'exercice
        setPracticeState(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          correctAnswers: newCorrectAnswers,
          userAnswers: newUserAnswers,
          endTime: Date.now(),
          isCompleted: true
        }));
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showFeedback) {
      handleSubmitAnswer();
    }
  };

  const calculateScore = () => {
    const percentage = (practiceState.correctAnswers / practiceState.questions.length) * 100;
    if (percentage >= 90) return { grade: 'A', color: 'text-green-400', message: 'Excellent !' };
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-400', message: 'Très bien !' };
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-400', message: 'Bien !' };
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-400', message: 'Peut mieux faire' };
    return { grade: 'F', color: 'text-red-400', message: 'À revoir' };
  };

  const calculateTime = () => {
    const endTime = practiceState.endTime || Date.now();
    const timeTaken = Math.floor((endTime - practiceState.startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (practiceState.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Chargement des questions...</p>
        </div>
      </div>
    );
  }

  if (practiceState.isCompleted) {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-background text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">Exercice terminé !</h1>
              <div className={`text-6xl font-bold mb-4 ${score.color}`}>
                {score.grade}
              </div>
              <p className="text-2xl text-gray-400 mb-2">{score.message}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{practiceState.correctAnswers}/{practiceState.questions.length}</div>
                <div className="text-gray-400">Réponses correctes</div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{calculateTime()}</div>
                <div className="text-gray-400">Temps total</div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {Math.round((practiceState.correctAnswers / practiceState.questions.length) * 100)}%
                </div>
                <div className="text-gray-400">Score final</div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
              <h2 className="text-xl font-semibold mb-4">Récapitulatif des réponses</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {practiceState.questions.map((question, index) => {
                  const userAnswer = practiceState.userAnswers[index];
                  const isCorrect = userAnswer === question.solution;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{question.problem}</div>
                        <div className="text-sm text-gray-400">
                          Ta réponse: {userAnswer} | Solution: {question.solution}
                        </div>
                      </div>
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-all"
              >
                Recommencer
              </button>
              <Link href="/courses" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-all">
                Retour aux cours
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = practiceState.questions[practiceState.currentIndex];
  const progress = ((practiceState.currentIndex + 1) / practiceState.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href={`/courses/${course.className.toLowerCase()}`} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
            <ArrowLeft className="w-5 h-5" />
            <span>{course.title}</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Question {practiceState.currentIndex + 1} / {practiceState.questions.length}
            </div>
            <div className="text-sm text-gray-400">
              Score: {practiceState.correctAnswers}/{practiceState.userAnswers.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={practiceState.currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-4">{currentQuestion.problem}</h2>
            {currentQuestion.skill && (
              <div className="text-sm text-gray-400">{currentQuestion.skill}</div>
            )}
          </div>

          <div className="max-w-md mx-auto">
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ta réponse..."
              className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg text-center text-2xl font-bold focus:outline-none focus:border-indigo-500"
              disabled={showFeedback}
              autoFocus
            />
            
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-lg text-center ${
                  isCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                  <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? 'Correct !' : 'Incorrect'}
                  </span>
                </div>
                {!isCorrect && (
                  <div className="text-sm text-gray-300">
                    La bonne réponse était: <span className="font-bold">{currentQuestion.solution}</span>
                  </div>
                )}
                <div className="text-sm text-gray-400 mt-2">
                  {currentQuestion.explanation}
                </div>
              </motion.div>
            )}

            {!showFeedback && (
              <button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim()}
                className="w-full mt-4 p-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
              >
                Valider
              </button>
            )}
          </div>
        </motion.div>

        {/* Tips */}
        {course.sections[practiceState.currentIndex]?.tips && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold mb-3 text-indigo-400">💡 Astuces</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {course.sections[practiceState.currentIndex].tips?.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
