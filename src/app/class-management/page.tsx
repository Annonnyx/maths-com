'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  Award,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Download,
  Mail,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Crown,
  BookOpen,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import TeacherClassManager from '@/components/TeacherClassManager';

interface ClassStats {
  totalStudents: number;
  activeToday: number;
  averageElo: number;
  totalTests: number;
  averageScore: number;
  topPerformer: any;
}

interface ClassActivity {
  id: string;
  studentName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'test' | 'achievement' | 'login';
}

export default function ClassManagementPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'requests' | 'analytics' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ClassActivity[]>([]);

  useEffect(() => {
    if (session?.user && (session.user as any).isTeacher) {
      loadClassData();
    }
  }, [session]);

  const loadClassData = async () => {
    setIsLoading(true);
    try {
      // Simuler le chargement des données
      // Dans la vraie implémentation, charger depuis l'API
      setTimeout(() => {
        setClassStats({
          totalStudents: 24,
          activeToday: 18,
          averageElo: 1250,
          totalTests: 156,
          averageScore: 78,
          topPerformer: {
            name: 'Alice Martin',
            elo: 1450,
            rank: 'A-'
          }
        });

        setRecentActivity([
          {
            id: '1',
            studentName: 'Alice Martin',
            action: 'Test complété',
            details: 'Score: 95% - Niveau Expert',
            timestamp: 'Il y a 10 min',
            type: 'test'
          },
          {
            id: '2',
            studentName: 'Bob Bernard',
            action: 'Nouveau badge',
            details: 'Expert en Multiplication',
            timestamp: 'Il y a 25 min',
            type: 'achievement'
          },
          {
            id: '3',
            studentName: 'Claire Dubois',
            action: 'Connexion',
            details: 'Session quotidienne',
            timestamp: 'Il y a 1h',
            type: 'login'
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading class data:', error);
      setIsLoading(false);
    }
  };

  console.log('🔍 Session user:', session?.user);
  console.log('🔍 isTeacher:', (session?.user as any)?.isTeacher);
  console.log('🔍 isAdmin:', (session?.user as any)?.isAdmin);

  if (!session?.user || (!(session.user as any).isTeacher && !(session.user as any).isAdmin)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Accès réservé</h1>
          <p className="text-gray-400">Cette page est réservée aux professeurs et administrateurs</p>
          <p className="text-gray-500 text-sm mt-2">Debug: isTeacher={String((session?.user as any)?.isTeacher)}, isAdmin={String((session?.user as any)?.isAdmin)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-400" />
                Gestion de classe
              </h1>
              <span className="text-sm text-muted-foreground">
                Professeur: {session.user.displayName || session.user.username}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadClassData}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-[#12121a]/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Aperçu', icon: BarChart3 },
              { id: 'students', label: 'Élèves', icon: Users },
              { id: 'requests', label: 'Demandes', icon: UserCheck },
              { id: 'analytics', label: 'Analytiques', icon: TrendingUp },
              { id: 'settings', label: 'Paramètres', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-purple-400 border-purple-400 bg-purple-400/10'
                    : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && classStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 bg-card rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-blue-400" />
                      <span className="text-sm text-green-400 font-medium">+12%</span>
                    </div>
                    <div className="text-2xl font-bold">{classStats.totalStudents}</div>
                    <div className="text-sm text-muted-foreground">Élèves totaux</div>
                  </div>

                  <div className="p-6 bg-card rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="w-8 h-8 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">75%</span>
                    </div>
                    <div className="text-2xl font-bold">{classStats.activeToday}</div>
                    <div className="text-sm text-muted-foreground">Actifs aujourd'hui</div>
                  </div>

                  <div className="p-6 bg-card rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <Target className="w-8 h-8 text-purple-400" />
                      <span className="text-sm text-green-400 font-medium">+5%</span>
                    </div>
                    <div className="text-2xl font-bold">{classStats.averageElo}</div>
                    <div className="text-sm text-muted-foreground">Elo moyen</div>
                  </div>

                  <div className="p-6 bg-card rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <Award className="w-8 h-8 text-yellow-400" />
                      <span className="text-sm text-green-400 font-medium">+8%</span>
                    </div>
                    <div className="text-2xl font-bold">{classStats.averageScore}%</div>
                    <div className="text-sm text-muted-foreground">Score moyen</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      Activité récente
                    </h3>
                    <div className="space-y-3">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activity.type === 'test' ? 'bg-green-500/20' :
                            activity.type === 'achievement' ? 'bg-yellow-500/20' :
                            'bg-blue-500/20'
                          }`}>
                            {activity.type === 'test' ? <Target className="w-4 h-4 text-green-400" /> :
                             activity.type === 'achievement' ? <Award className="w-4 h-4 text-yellow-400" /> :
                             <Clock className="w-4 h-4 text-blue-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{activity.studentName}</div>
                            <div className="text-sm text-muted-foreground">{activity.details}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      Meilleur élève
                    </h3>
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {classStats.topPerformer.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{classStats.topPerformer.name}</div>
                        <div className="text-sm text-muted-foreground">Elo: {classStats.topPerformer.elo}</div>
                        <div className="text-sm text-purple-400">{classStats.topPerformer.rank}</div>
                      </div>
                      <Crown className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-6 bg-card rounded-xl border border-border">
                  <TeacherClassManager expanded={true} />
                </div>
              </motion.div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-6 bg-card rounded-xl border border-border">
                  <TeacherClassManager expanded={true} />
                </div>
              </motion.div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-card rounded-xl border border-border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Analytiques de classe
                  </h3>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Graphiques et statistiques détaillées bientôt disponibles</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-card rounded-xl border border-border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-400" />
                    Paramètres de classe
                  </h3>
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Paramètres avancés bientôt disponibles</p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
