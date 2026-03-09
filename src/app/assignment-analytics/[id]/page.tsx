'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, BarChart3, Users, Target, Clock, 
  ChevronDown, ChevronUp, Trophy, AlertCircle,
  CheckCircle, XCircle, TrendingUp
} from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface QuestionStats {
  questionId: string;
  question: string;
  questionType: string;
  difficulty: number;
  points: number;
  totalAnswers: number;
  correctAnswers: number;
  successRate: number;
  averagePoints: number;
  topAnswers: [string, number][];
}

interface StudentStats {
  submissionId: string;
  studentName: string;
  status: string;
  score: number | null;
  startedAt: string;
  completedAt: string | null;
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  answers?: {
    questionId: string;
    answer: string | null;
    isCorrect: boolean | null;
    points: number | null;
  }[];
  rank?: number;
}

interface AnalyticsData {
  assignment: {
    id: string;
    title: string;
    questionCount: number;
    totalSubmissions: number;
    completedCount: number;
    averageScore: number;
    scoreDistribution: {
      excellent: number;
      good: number;
      average: number;
      poor: number;
    };
  };
  questionStats: QuestionStats[];
  studentStats: StudentStats[];
  ranking: StudentStats[];
}

export default function AssignmentAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'students'>('overview');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [params.id]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/assignments/analytics?assignmentId=${params.id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du chargement');
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
        <div className="bg-[#1a1a2e] rounded-lg border border-[#3a3a4a] p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-xl font-bold text-white mb-2">Erreur</h1>
          <p className="text-gray-400 mb-6">{error || 'Données non trouvées'}</p>
          <button
            onClick={() => router.back()}
            className="text-purple-400 hover:text-purple-300"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const { assignment, questionStats, studentStats, ranking } = data;

  const scoreDistributionData = [
    { name: 'Excellent (90-100%)', value: assignment.scoreDistribution.excellent, color: '#10b981' },
    { name: 'Bon (70-89%)', value: assignment.scoreDistribution.good, color: '#3b82f6' },
    { name: 'Moyen (50-69%)', value: assignment.scoreDistribution.average, color: '#f59e0b' },
    { name: 'Faible (<50%)', value: assignment.scoreDistribution.poor, color: '#ef4444' },
  ];

  const questionSuccessData = questionStats.map((q, idx) => ({
    name: `Q${idx + 1}`,
    successRate: Math.round(q.successRate),
    difficulty: q.difficulty
  }));

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <header className="bg-[#1a1a2e] border-b border-[#2a2a3a] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[#2a2a3a] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">Analytiques: {assignment.title}</h1>
              <p className="text-sm text-gray-400">
                {assignment.completedCount} élèves ont terminé sur {assignment.totalSubmissions} inscrits
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'questions', label: 'Par question', icon: Target },
            { id: 'students', label: 'Par élève', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1a1a2e] text-gray-400 hover:bg-[#2a2a3a]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Total participants</span>
                </div>
                <p className="text-3xl font-bold text-white">{assignment.totalSubmissions}</p>
              </div>
              
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400 text-sm">Terminés</span>
                </div>
                <p className="text-3xl font-bold text-white">{assignment.completedCount}</p>
              </div>
              
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Score moyen</span>
                </div>
                <p className="text-3xl font-bold text-white">{assignment.averageScore.toFixed(1)}%</p>
              </div>
              
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">Questions</span>
                </div>
                <p className="text-3xl font-bold text-white">{assignment.questionCount}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Distribution des scores</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {scoreDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid #3a3a4a',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                  {scoreDistributionData.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-400">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Success Rate */}
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Taux de réussite par question</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questionSuccessData}>
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a1a2e', 
                          border: '1px solid #3a3a4a',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="successRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Students */}
            {ranking.length > 0 && (
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Classement
                </h3>
                <div className="space-y-2">
                  {ranking.slice(0, 5).map((student, idx) => (
                    <div 
                      key={student.submissionId}
                      className="flex items-center gap-4 p-3 bg-[#2a2a3a] rounded-lg"
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                          idx === 1 ? 'bg-gray-400/20 text-gray-300' : 
                          idx === 2 ? 'bg-orange-600/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'}
                      `}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{student.studentName}</p>
                        <p className="text-sm text-gray-400">
                          {student.correctCount}/{student.totalQuestions} correct
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{student.score?.toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {questionStats.map((q, idx) => (
              <div 
                key={q.questionId}
                className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedQuestion(
                    expandedQuestion === q.questionId ? null : q.questionId
                  )}
                  className="w-full p-4 flex items-center justify-between hover:bg-[#2a2a3a] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-semibold">
                      {idx + 1}
                    </span>
                    <div className="text-left">
                      <p className="text-white font-medium truncate max-w-md">{q.question}</p>
                      <p className="text-sm text-gray-400">
                        {q.questionType === 'single' ? 'Réponse unique' : 
                         q.questionType === 'multiple' ? 'Choix multiples' : 'Réponse libre'} • 
                        Difficulté {q.difficulty}/10
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{q.successRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400">de réussite</p>
                    </div>
                    {expandedQuestion === q.questionId ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                </button>

                {expandedQuestion === q.questionId && (
                  <div className="px-4 pb-4 border-t border-[#2a2a3a]">
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-[#2a2a3a] rounded-lg">
                        <p className="text-sm text-gray-400">Réponses reçues</p>
                        <p className="text-xl font-bold text-white">{q.totalAnswers}</p>
                      </div>
                      <div className="p-3 bg-[#2a2a3a] rounded-lg">
                        <p className="text-sm text-gray-400">Réponses correctes</p>
                        <p className="text-xl font-bold text-green-400">{q.correctAnswers}</p>
                      </div>
                      <div className="p-3 bg-[#2a2a3a] rounded-lg">
                        <p className="text-sm text-gray-400">Points moyens</p>
                        <p className="text-xl font-bold text-white">{q.averagePoints.toFixed(1)}</p>
                      </div>
                    </div>

                    {q.topAnswers.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Réponses les plus fréquentes</p>
                        <div className="space-y-2">
                          {q.topAnswers.map(([answer, count], idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="flex-1 h-8 bg-[#2a2a3a] rounded-lg overflow-hidden">
                                <div 
                                  className="h-full bg-purple-500/30 flex items-center px-3"
                                  style={{ width: `${(count / q.totalAnswers) * 100}%` }}
                                >
                                  <span className="text-sm text-white truncate">{answer}</span>
                                </div>
                              </div>
                              <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {studentStats.map((student) => (
              <div 
                key={student.submissionId}
                className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedStudent(
                    expandedStudent === student.submissionId ? null : student.submissionId
                  )}
                  className="w-full p-4 flex items-center justify-between hover:bg-[#2a2a3a] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${student.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'}
                    `}>
                      {student.status === 'completed' ? 
                        <CheckCircle className="w-5 h-5 text-green-400" /> : 
                        <Clock className="w-5 h-5 text-yellow-400" />
                      }
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">{student.studentName}</p>
                      <p className="text-sm text-gray-400">
                        {student.status === 'completed' 
                          ? `Terminé le ${new Date(student.completedAt!).toLocaleDateString('fr-FR')}`
                          : `Commencé le ${new Date(student.startedAt).toLocaleDateString('fr-FR')}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {student.status === 'completed' && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{student.score?.toFixed(0)}%</p>
                        <p className="text-xs text-gray-400">{student.correctCount}/{student.totalQuestions}</p>
                      </div>
                    )}
                    {expandedStudent === student.submissionId ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                </button>

                {expandedStudent === student.submissionId && student.answers && (
                  <div className="px-4 pb-4 border-t border-[#2a2a3a]">
                    <div className="pt-4 space-y-2">
                      {student.answers.map((answer, idx) => (
                        <div 
                          key={answer.questionId}
                          className="flex items-center gap-3 p-3 bg-[#2a2a3a] rounded-lg"
                        >
                          <span className="text-sm text-gray-400 w-8">Q{idx + 1}</span>
                          <div className="flex-1">
                            <p className="text-white text-sm truncate">{answer.answer || '(vide)'}</p>
                          </div>
                          {answer.isCorrect ? 
                            <CheckCircle className="w-5 h-5 text-green-400" /> : 
                            <XCircle className="w-5 h-5 text-red-400" />
                          }
                          <span className="text-sm text-white w-16 text-right">
                            {answer.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
