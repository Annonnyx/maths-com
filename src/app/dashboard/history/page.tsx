'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Clock, Target, Trophy, TrendingUp, 
  Eye, CheckCircle, XCircle, RotateCcw, Play,
  Filter, Download, BarChart3
} from 'lucide-react';
import { getRankFromElo, RANK_COLORS, RANK_BG_COLORS } from '@/lib/elo';
import { getClassFromDifficulty, formatClassName } from '@/lib/french-classes';

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

export default function DashboardHistoryPage() {
  const { data: session } = useSession();
  const { profile } = useUserProfile();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [filter, setFilter] = useState<'all' | 'perfect' | 'errors' | 'recent'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'elo'>('date');

  useEffect(() => {
    if (!session) return;
    
    fetchHistory();
  }, [session]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/solo/history?limit=50');
      const data = await response.json();
      
      if (response.ok) {
        setTests(data.tests || []);
      } else {
        console.error('Error fetching history:', data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const createErrorPractice = () => {
    if (!selectedTest) return;
    
    const errorQuestions = selectedTest.questions.filter(q => !q.isCorrect);
    const testParams = new URLSearchParams();
    
    // Create a custom test with only error questions
    testParams.set('mode', 'training');
    testParams.set('questions', JSON.stringify(errorQuestions));
    
    window.open(`/practice?${testParams.toString()}`, '_blank');
  };

  const filteredTests = tests.filter(test => {
    switch (filter) {
      case 'perfect':
        return test.isPerfect;
      case 'errors':
        return test.questions.some(q => !q.isCorrect);
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(test.completedAt) >= thirtyDaysAgo;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      case 'score':
        return b.score - a.score;
      case 'elo':
        return b.eloAfter - a.eloAfter;
      default:
        return 0;
    }
  });

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Score', 'Questions', 'Réussies', 'Temps', 'ELO avant', 'ELO après', 'Changement ELO'],
      ...tests.map(test => [
        new Date(test.completedAt).toLocaleDateString('fr-FR'),
        test.score.toString(),
        test.totalQuestions.toString(),
        test.correctAnswers.toString(),
        `${test.timeTaken}s`,
        test.eloBefore.toString(),
        test.eloAfter.toString(),
        `${test.eloChange > 0 ? '+' : ''}${test.eloChange}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historique_maths_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour au dashboard</span>
            </Link>
            
            <h1 className="text-3xl font-bold text-white">Historique complet</h1>
            
            <button
              onClick={exportHistory}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-6 bg-[#1a1a2a] rounded-2xl border border-[#2a2a3a]"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">Filtrer:</span>
            </div>
            
            {['all', 'recent', 'perfect', 'errors'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filter === f 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-[#2a2a3a] text-gray-400 hover:bg-[#3a3a4a] hover:text-white'
                }`}
              >
                {f === 'all' && 'Tous'}
                {f === 'recent' && 'Récents (30j)'}
                {f === 'perfect' && 'Parfaits'}
                {f === 'errors' && 'Avec erreurs'}
              </button>
            ))}
            
            <div className="flex items-center gap-2 ml-4">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">Trier par:</span>
            </div>
            
            {['date', 'score', 'elo'].map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s as any)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  sortBy === s 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-[#2a2a3a] text-gray-400 hover:bg-[#3a3a4a] hover:text-white'
                }`}
              >
                {s === 'date' && 'Date'}
                {s === 'score' && 'Score'}
                {s === 'elo' && 'ELO'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-6 bg-[#1a1a2a] rounded-2xl border border-[#2a2a3a]"
        >
          <h2 className="text-xl font-bold text-white mb-4">Statistiques globales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{tests.length}</div>
              <div className="text-sm text-gray-400">Tests total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {tests.filter(t => t.isPerfect).length}
              </div>
              <div className="text-sm text-gray-400">Tests parfaits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {Math.round(tests.reduce((acc, t) => acc + t.score, 0) / tests.length || 0)}
              </div>
              <div className="text-sm text-gray-400">Score moyen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {tests.reduce((acc, t) => acc + t.eloChange, 0) > 0 ? '+' : ''}
                {tests.reduce((acc, t) => acc + t.eloChange, 0)}
              </div>
              <div className="text-sm text-gray-400">ELO total gagné</div>
            </div>
          </div>
        </motion.div>

        {/* Tests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredTests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-[#1a1a2a] rounded-2xl border border-[#2a2a3a]"
            >
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">
                {filter === 'all' ? 'Aucun test' : `Aucun test ${filter}`}
              </h3>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? 'Commencez à pratiquer pour voir votre historique apparaître ici!'
                  : `Aucun test ${filter} trouvé`
                }
              </p>
            </motion.div>
          ) : (
            filteredTests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 bg-[#1a1a2a] rounded-2xl border transition-all hover:border-purple-500/50 ${
                  selectedTest?.id === test.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedTest(test)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                      test.isPerfect ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {test.score}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium">
                          {new Date(test.completedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          test.eloChange > 0 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {test.eloChange > 0 ? '+' : ''}{test.eloChange} ELO
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{test.totalQuestions} questions</span>
                        <span>•</span>
                        <span>{test.correctAnswers} correct</span>
                        <span>•</span>
                        <span>{test.timeTaken}s</span>
                        {test.isPerfect && <span className="text-green-400">• Parfait</span>}
                        {test.isStreakTest && <span className="text-orange-400">• Série</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {test.questions.some(q => !q.isCorrect) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowErrorsOnly(!showErrorsOnly);
                        }}
                        className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        {showErrorsOnly ? 'Tout' : 'Erreurs'}
                      </button>
                    )}
                    
                    <Link
                      href={`/practice?testId=${test.id}`}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Refaire
                    </Link>
                  </div>
                </div>
                
                {/* Selected Test Details */}
                {selectedTest?.id === test.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-[#2a2a3a]"
                  >
                    <h4 className="font-semibold text-white mb-3">Détails du test</h4>
                    
                    <div className="space-y-2">
                      {selectedTest.questions.map((question, qIndex) => (
                        <div
                          key={question.id}
                          className={`p-3 rounded-lg border ${
                            question.isCorrect 
                              ? 'bg-green-500/10 border-green-500/30' 
                              : 'bg-red-500/10 border-red-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                                Q{qIndex + 1}
                              </span>
                              <span className="text-sm">
                                {getClassFromDifficulty(question.difficulty)} - {question.question}
                              </span>
                            </div>
                            {question.isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-300">
                            <div>Votre réponse: <span className={question.isCorrect ? 'text-green-400' : 'text-red-400'}>{question.userAnswer}</span></div>
                            <div>Bonne réponse: <span className="text-green-400">{question.answer}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={createErrorPractice}
                        className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                      >
                        <Target className="w-4 h-4" />
                        S'entraîner sur les erreurs
                      </button>
                      <button
                        onClick={() => setSelectedTest(null)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
