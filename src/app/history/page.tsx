'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Target, Trophy, TrendingUp, Eye, CheckCircle, XCircle, RotateCcw, Play } from 'lucide-react';
import Link from 'next/link';
import { getRankFromElo, RANK_COLORS, RANK_BG_COLORS } from '@/lib/elo';

interface Test {
  id: string;
  completedAt: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeTaken: number;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  isPerfect: boolean;
  isStreakTest: boolean;
  questions: {
    id: string;
    type: string;
    difficulty: number;
    question: string;
    answer: string;
    userAnswer: string;
    isCorrect: boolean;
    timeTaken: number;
    order: number;
  }[];
}

export default function TestHistoryPage() {
  const { data: session } = useSession();
  const { profile } = useUserProfile();
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  const createErrorPractice = () => {
    if (!selectedTest) return;
    
    const errorQuestions = selectedTest.questions.filter(q => !q.isCorrect);
    const testParams = new URLSearchParams();
    
    // Create a custom test with only the error questions
    testParams.set('mode', 'training');
    testParams.set('errors', JSON.stringify(errorQuestions.map(q => ({
      type: q.type,
      difficulty: q.difficulty,
      question: q.question,
      answer: q.answer
    }))));
    
    window.open(`/test?${testParams.toString()}`, '_blank');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour voir ton historique</h1>
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement de ton profil...</p>
        </div>
      </div>
    );
  }

  const tests = profile.recentTests || [];

  const filteredQuestions = selectedTest?.questions.filter(q => 
    showErrorsOnly ? !q.isCorrect : true
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Historique des Tests</h1>
              <p className="text-purple-300">Revois tes performances et tes erreurs</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: RANK_COLORS[profile.user.rankClass] }}>
              {profile.user.elo} Elo
            </div>
            <div className="text-sm text-purple-300">{profile.user.rankClass}</div>
          </div>
        </div>

        {/* Test List */}
        {!selectedTest && (
          <div className="grid gap-4">
            {tests.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <Target className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-semibold mb-2">Aucun test encore</h3>
                <p className="text-purple-300 mb-4">Fais ton premier test pour voir ton historique</p>
                <Link href="/test" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors">
                  <Target className="w-5 h-5" />
                  Commencer un test
                </Link>
              </div>
            ) : (
              tests.map((test: Test, index: number) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer border border-white/10"
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                      <div className="text-center min-w-[60px]">
                        <div className="text-2xl font-bold">{test.score}%</div>
                        <div className="text-sm text-purple-300">{test.correctAnswers}/{test.totalQuestions}</div>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-semibold flex items-center gap-1 sm:gap-2">
                          {test.eloChange > 0 ? (
                            <TrendingUp className="w-5 h-5 text-green-400" />
                          ) : test.eloChange < 0 ? (
                            <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
                          ) : null}
                          {test.eloChange > 0 ? '+' : ''}{test.eloChange}
                        </div>
                        <div className="text-sm text-purple-300">Elo</div>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-semibold flex items-center gap-1 sm:gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          {Math.floor(test.timeTaken / 60)}:{(test.timeTaken % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-sm text-purple-300">Temps</div>
                      </div>
                    </div>
                    <div className="text-right sm:text-right text-left w-full sm:w-auto">
                      <div className="text-sm text-purple-300">
                        {new Date(test.completedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {test.isPerfect && (
                        <div className="flex items-center gap-1 text-yellow-400 mt-1">
                          <Trophy className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">Parfait!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Test Details */}
        {selectedTest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Test Header */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedTest(null)}
                  className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à l'historique
                </button>
                <div className="flex items-center gap-4">
                  {selectedTest.questions.some(q => !q.isCorrect) && (
                    <button
                      onClick={createErrorPractice}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                    >
                      <Play className="w-4 h-4" />
                      Refaire les erreurs
                    </button>
                  )}
                  <button
                    onClick={() => setShowErrorsOnly(!showErrorsOnly)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      showErrorsOnly 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    {showErrorsOnly ? 'Toutes les questions' : 'Erreurs uniquement'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedTest.score}%</div>
                  <div className="text-sm text-purple-300">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    {selectedTest.eloChange > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : selectedTest.eloChange < 0 ? (
                      <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
                    ) : null}
                    {selectedTest.eloChange > 0 ? '+' : ''}{selectedTest.eloChange}
                  </div>
                  <div className="text-sm text-purple-300">Elo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Clock className="w-5 h-5" />
                    {Math.floor(selectedTest.timeTaken / 60)}:{(selectedTest.timeTaken % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-purple-300">Temps</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {selectedTest.questions.filter(q => !q.isCorrect).length}
                  </div>
                  <div className="text-sm text-purple-300">Erreurs</div>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold mb-4">
                {showErrorsOnly ? 'Erreurs' : 'Toutes les questions'} ({filteredQuestions.length})
              </h3>
              
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p className="text-green-400">Aucune erreur à afficher!</p>
                </div>
              ) : (
                filteredQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border ${
                      question.isCorrect 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-purple-300">#{question.order + 1}</span>
                          <span className="text-xs px-2 py-1 bg-white/10 rounded">
                            {question.type} • Niv.{question.difficulty}
                          </span>
                          <span className="text-xs text-purple-300">
                            {question.timeTaken / 1000}s
                          </span>
                        </div>
                        
                        <div className="text-lg font-mono mb-3">{question.question}</div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-purple-300">Ta réponse: </span>
                            <span className={`font-mono ${question.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {question.userAnswer || 'Non répondue'}
                            </span>
                          </div>
                          {!question.isCorrect && (
                            <div>
                              <span className="text-purple-300">Bonne réponse: </span>
                              <span className="font-mono text-green-400">{question.answer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {question.isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
