'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Users, User, UserPlus, Clock, Target, Award, Crown, BarChart3, TrendingUp, Settings, GraduationCap, RefreshCw, Plus, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'requests' | 'analytics' | 'settings' | 'classes'>('classes');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ClassActivity[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user && (session.user as any).isTeacher) {
      loadClassData();
    }
  }, [session]);

  const loadClassData = async () => {
    setIsLoading(true);
    try {
      // Charger les classes depuis l'API
      const response = await fetch('/api/class-groups');
      if (response.ok) {
        const data = await response.json();
        const userClasses = data.groups || [];
        
        // Calculer les statistiques
        const totalStudents = userClasses.reduce((sum: number, group: any) => sum + (group._count?.members || 0), 0);
        
        setClassStats({
          totalStudents,
          activeToday: 0, // À implémenter plus tard
          averageElo: 0, // À implémenter plus tard
          totalTests: 0, // À implémenter plus tard
          averageScore: 0, // À implémenter plus tard
          topPerformer: null
        });
        setRecentActivity([]);
        setStudents([]);
        setMyClasses(userClasses.map((group: any) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          level: group.level,
          subject: group.subject,
          maxStudents: group.maxStudents,
          isPrivate: group.isPrivate,
          studentCount: group._count?.members || 0,
          createdAt: group.createdAt
        })));
      } else {
        console.error('Failed to load classes');
      }
    } catch (error) {
      console.error('Error loading class data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('🔍 Session user:', session?.user);
  console.log('🔍 isTeacher:', (session?.user as any)?.isTeacher);
  console.log('🔍 isAdmin:', (session?.user as any)?.isAdmin);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Connexion requise</h1>
          <p className="text-gray-400">Vous devez être connecté pour accéder à cette page</p>
        </div>
      </div>
    );
  }

  // Vérification spéciale pour ton email en attendant la reconnexion
  const userEmail = session.user.email;
  const isAdmin = userEmail === 'noe.barneron@gmail.com' || (session.user as any)?.isAdmin;
  const isTeacher = (session.user as any)?.isTeacher;

  if (!isAdmin && !isTeacher) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Accès réservé</h1>
          <p className="text-gray-400">Cette page est réservée aux professeurs et administrateurs</p>
          <p className="text-gray-500 text-sm mt-2">Debug: {userEmail}</p>
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
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-400" />
                Gestion de classe
              </h1>
              <span className="text-sm text-muted-foreground">
                Professeur: {session.user.displayName || session.user.username}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-[#12121a]/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'classes', label: 'Mes classes', icon: GraduationCap },
              { id: 'overview', label: 'Aperçu', icon: BarChart3 },
              { id: 'students', label: 'Élèves', icon: Users },
              { id: 'requests', label: 'Demandes', icon: UserPlus },
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
            {/* Classes Tab */}
            {activeTab === 'classes' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-6 bg-card rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-400" />
                      Mes classes
                    </h3>
                    <Link
                      href="/class-management/create"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Créer une classe
                    </Link>
                  </div>
                  
                  {myClasses.length === 0 ? (
                    <div className="text-center py-12">
                      <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucune classe créée</h3>
                      <p className="text-gray-500 mb-6">Commencez par créer votre première classe pour gérer vos élèves.</p>
                      <Link
                        href="/class-management/create"
                        className="inline-flex px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Créer ma première classe
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myClasses.map((classItem) => (
                        <div key={classItem.id} className="p-4 bg-[#1e1e2e] rounded-lg border border-[#3a3a4a] hover:border-purple-500/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              classItem.isPrivate ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {classItem.isPrivate ? 'Privée' : 'Publique'}
                            </span>
                          </div>
                          <h4 className="font-semibold text-white mb-1">{classItem.name}</h4>
                          <p className="text-sm text-gray-400 mb-3">{classItem.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{classItem.level} • {classItem.subject}</span>
                            <span className="text-purple-400">{classItem.studentCount}/{classItem.maxStudents} élèves</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

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
                    </div>
                    <div className="text-2xl font-bold">{classStats.totalStudents}</div>
                    <div className="text-sm text-muted-foreground">Élèves totaux</div>
                  </div>

                  <div className="p-6 bg-card rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="w-8 h-8 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold">{classStats.activeToday}</div>
                    <div className="text-sm text-muted-foreground">Actifs aujourd'hui</div>
                  </div>

                  <div className="p-6 bg-card rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <Target className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold">{classStats.averageElo}</div>
                    <div className="text-sm text-muted-foreground">Elo moyen</div>
                  </div>

                  <div className="p-6 bg-card rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <Award className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold">{classStats.averageScore}</div>
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
                      {recentActivity.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Aucune activité récente
                        </div>
                      ) : (
                        recentActivity.map((activity) => (
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
                        ))
                      )}
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
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Liste des élèves
                  </h3>
                  {students.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Aucun élève dans cette classe</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-muted-foreground">{student.email}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">Elo: {student.elo}</div>
                            <div className="text-xs text-muted-foreground">{student.level}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-green-400" />
                    Demandes d'inscription
                  </h3>
                  <div className="text-center py-12">
                    <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Aucune demande en attente</p>
                  </div>
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
                  {myClasses.length === 0 ? (
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Créez une classe pour voir les analytiques</p>
                      <Link
                        href="/class-management/create"
                        className="inline-flex px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors items-center gap-2 mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        Créer une classe
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Les analytiques seront disponibles prochainement</p>
                      <p className="text-sm text-gray-500 mt-2">Statistiques détaillées sur la progression de vos élèves</p>
                    </div>
                  )}
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
                  {myClasses.length === 0 ? (
                    <div className="text-center py-12">
                      <Settings className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Créez une classe pour accéder aux paramètres</p>
                      <Link
                        href="/class-management/create"
                        className="inline-flex px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors items-center gap-2 mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        Créer une classe
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center py-12">
                        <Settings className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">Paramètres avancés bientôt disponibles</p>
                        <p className="text-sm text-gray-500 mt-2">Personnalisation des classes et permissions</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
