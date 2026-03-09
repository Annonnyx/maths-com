'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, TrendingUp, Award, Clock, 
  BookOpen, Target, Zap, Calendar, Trophy,
  BarChart3, ChevronRight, Star
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface StudentProfile {
  student: {
    id: string;
    username: string;
    displayName: string | null;
    email: string;
    level: number;
    xp: number;
    joinedAt: string;
  };
  stats: {
    totalAssignments: number;
    completedCount: number;
    completionRate: number;
    averageScore: number;
    totalPoints: number;
    avgTimePerAssignment: number;
  };
  progressByMonth: Record<string, { completed: number; avgScore: number }>;
  difficultyStats: Record<number, { total: number; correct: number }>;
  recentAssignments: {
    id: string;
    assignmentTitle: string;
    className: string;
    status: string;
    score: number | null;
    completedAt: string | null;
    correctCount: number;
    totalQuestions: number;
  }[];
  classRankings: {
    classId: string;
    className: string;
    rank: number;
    totalStudents: number;
    percentile: number;
  }[];
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'history'>('overview');

  useEffect(() => {
    loadProfile();
  }, [params.id]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/students/stats?studentId=${params.id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du chargement');
      }
      const result = await response.json();
      setProfile(result);
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
        <div className="bg-[#1a1a2e] rounded-lg border border-[#3a3a4a] p-8 max-w-md w-full text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-white mb-2">Erreur</h1>
          <p className="text-gray-400 mb-6">{error || 'Profil non trouvé'}</p>
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

  const { student, stats, progressByMonth, difficultyStats, recentAssignments, classRankings } = profile;

  const progressData = Object.entries(progressByMonth).map(([month, data]) => ({
    month,
    completed: data.completed,
    avgScore: Math.round(data.avgScore)
  }));

  const difficultyData = Object.entries(difficultyStats).map(([difficulty, data]) => ({
    difficulty: `Niveau ${difficulty}`,
    successRate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    total: data.total
  }));

  const skillData = [
    { subject: 'Calcul', score: Math.min(100, stats.averageScore + 10), fullMark: 100 },
    { subject: 'Logique', score: Math.min(100, stats.averageScore + 5), fullMark: 100 },
    { subject: 'Géométrie', score: Math.min(100, stats.averageScore - 5), fullMark: 100 },
    { subject: 'Problèmes', score: Math.min(100, stats.averageScore), fullMark: 100 },
    { subject: 'Vitesse', score: Math.min(100, 100 - stats.avgTimePerAssignment), fullMark: 100 },
    { subject: 'Précision', score: Math.min(100, stats.completionRate), fullMark: 100 },
  ];

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'text-yellow-400';
    if (level >= 10) return 'text-purple-400';
    return 'text-blue-400';
  };

  const getLevelTitle = (level: number) => {
    if (level >= 30) return 'Maître Mathématicien';
    if (level >= 20) return 'Expert';
    if (level >= 10) return 'Adepte';
    return 'Apprenti';
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">
                {student.displayName || student.username}
              </h1>
              <p className="text-white/70">{student.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className={`text-2xl font-bold ${getLevelColor(student.level)}`}>
                  Niveau {student.level}
                </span>
                <span className="text-white/50">•</span>
                <span className="text-white/70">{getLevelTitle(student.level)}</span>
                <span className="text-white/50">•</span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {student.xp} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
            { id: 'progress', label: 'Progression', icon: TrendingUp },
            { id: 'history', label: 'Historique', icon: BookOpen },
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
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Devoirs</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalAssignments}</p>
                <p className="text-sm text-gray-500">{stats.completedCount} terminés</p>
              </div>

              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Score moyen</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.averageScore.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Précision</p>
              </div>

              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400 text-sm">Taux de complétion</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.completionRate.toFixed(0)}%</p>
                <p className="text-sm text-gray-500">{stats.completedCount}/{stats.totalAssignments}</p>
              </div>

              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">Temps moyen</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.avgTimePerAssignment.toFixed(0)}m</p>
                <p className="text-sm text-gray-500">par devoir</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills Radar */}
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Compétences
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillData}>
                      <PolarGrid stroke="#3a3a4a" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <PolarRadiusAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <Radar
                        name="Compétences"
                        dataKey="score"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Class Rankings */}
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Classement
                </h3>
                {classRankings.length > 0 ? (
                  <div className="space-y-3">
                    {classRankings.map((ranking) => (
                      <div key={ranking.classId} className="p-4 bg-[#2a2a3a] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{ranking.className}</span>
                          <span className="text-2xl font-bold text-purple-400">
                            #{ranking.rank}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            sur {ranking.totalStudents} élèves
                          </span>
                          <span className="text-green-400">
                            Top {ranking.percentile.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 bg-[#3a3a4a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                            style={{ width: `${ranking.percentile}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    Aucun classement disponible pour le moment
                  </p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Activité récente
              </h3>
              {recentAssignments.length > 0 ? (
                <div className="space-y-3">
                  {recentAssignments.slice(0, 5).map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-4 p-3 bg-[#2a2a3a] rounded-lg hover:bg-[#3a3a4a] transition-colors cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        assignment.status === 'completed' 
                          ? 'bg-green-500/20' 
                          : 'bg-yellow-500/20'
                      }`}>
                        {assignment.status === 'completed' ? (
                          <Award className="w-5 h-5 text-green-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{assignment.assignmentTitle}</p>
                        <p className="text-sm text-gray-400">{assignment.className}</p>
                      </div>
                      {assignment.status === 'completed' && assignment.score !== null && (
                        <div className="text-right">
                          <p className="text-xl font-bold text-white">{assignment.score.toFixed(0)}%</p>
                          <p className="text-xs text-gray-400">
                            {assignment.correctCount}/{assignment.totalQuestions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Aucune activité récente
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {progressData.length > 0 ? (
              <>
                <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Progression mensuelle
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #3a3a4a',
                            borderRadius: '8px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          name="Devoirs complétés"
                        />
                        <Line
                          type="monotone"
                          dataKey="avgScore"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Score moyen"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Performance par difficulté
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={difficultyData}>
                        <XAxis dataKey="difficulty" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #3a3a4a',
                            borderRadius: '8px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="successRate"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          name="Taux de réussite"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">Pas assez de données pour afficher les graphiques</p>
                <p className="text-sm text-gray-500 mt-2">
                  Complétez plus de devoirs pour voir votre progression
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {recentAssignments.length > 0 ? (
              recentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-4 hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        assignment.status === 'completed'
                          ? assignment.score && assignment.score >= 70
                            ? 'bg-green-500/20'
                            : 'bg-yellow-500/20'
                          : 'bg-gray-500/20'
                      }`}>
                        {assignment.status === 'completed' ? (
                          assignment.score && assignment.score >= 70 ? (
                            <Trophy className="w-6 h-6 text-green-400" />
                          ) : (
                            <Award className="w-6 h-6 text-yellow-400" />
                          )
                        ) : (
                          <Clock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{assignment.assignmentTitle}</h4>
                        <p className="text-sm text-gray-400">{assignment.className}</p>
                        <p className="text-xs text-gray-500">
                          {assignment.completedAt
                            ? new Date(assignment.completedAt).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'En cours'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {assignment.status === 'completed' && assignment.score !== null && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{assignment.score.toFixed(0)}%</p>
                          <p className="text-sm text-gray-400">
                            {assignment.correctCount}/{assignment.totalQuestions} correct
                          </p>
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">Aucun devoir complété</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
