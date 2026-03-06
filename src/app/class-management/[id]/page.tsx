'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Settings, BarChart3, MessageSquare, 
  BookOpen, Calendar, Award, Target, TrendingUp, Check, X
} from 'lucide-react';

interface ClassDetails {
  id: string;
  name: string;
  description: string;
  level: string;
  subject: string;
  maxStudents: number;
  isPrivate: boolean;
  studentCount: number;
  createdAt: string;
  inviteCode?: string;
}

export default function ClassDetailsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);

  const tabs = [
    { id: 'overview', name: 'Aperçu', icon: BarChart3 },
    { id: 'students', name: 'Élèves', icon: Users },
    { id: 'requests', name: 'Demandes', icon: Users },
    { id: 'analytics', name: 'Analytiques', icon: TrendingUp },
    { id: 'settings', name: 'Paramètres', icon: Settings },
  ];

  useEffect(() => {
    if (params.id) {
      loadClassDetails();
    }
  }, [params.id]);

  const loadClassDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/class-groups/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setClassDetails(data.group);
        
        // Extraire les élèves et les demandes d'adhésion
        const members = data.group?.members || [];
        const actualStudents = members.filter((m: any) => m.role === 'student');
        const pendingRequests = members.filter((m: any) => m.role === 'pending');
        
        setStudents(actualStudents);
        setJoinRequests(pendingRequests);
      }
    } catch (error) {
      console.error('Error loading class details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptStudent = async (studentId: string) => {
    try {
      const response = await fetch('/api/class-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', requestId: studentId, classId: params.id })
      });
      if (response.ok) {
        loadClassDetails(); // Recharger les données
      }
    } catch (error) {
      console.error('Error accepting student:', error);
    }
  };

  const rejectStudent = async (studentId: string) => {
    try {
      const response = await fetch('/api/class-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', requestId: studentId, classId: params.id })
      });
      if (response.ok) {
        loadClassDetails(); // Recharger les données
      }
    } catch (error) {
      console.error('Error rejecting student:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Classe non trouvée</h2>
          <Link
            href="/class-management"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retour aux classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="bg-[#1a1a2e] border-b border-[#2a2a3a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/class-management"
                className="p-2 hover:bg-[#2a2a3a] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{classDetails.name}</h1>
                <p className="text-gray-400">{classDetails.level} • {classDetails.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                classDetails.isPrivate 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {classDetails.isPrivate ? 'Privée' : 'Publique'}
              </span>
              {classDetails.inviteCode && (
                <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                  Code: {classDetails.inviteCode}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#1a1a2e] border-b border-[#2a2a3a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0a0a0f] text-purple-400 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-[#2a2a3a]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a3a]">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl font-bold text-white">{classDetails.studentCount}</span>
                </div>
                <p className="text-gray-400">Élèves inscrits</p>
                <p className="text-sm text-gray-500 mt-1">sur {classDetails.maxStudents === 0 ? 'illimité' : classDetails.maxStudents}</p>
              </div>
              
              <div className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a3a]">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-green-400" />
                  <span className="text-2xl font-bold text-white">0</span>
                </div>
                <p className="text-gray-400">Devoirs actifs</p>
                <p className="text-sm text-gray-500 mt-1">À configurer</p>
              </div>
              
              <div className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a3a]">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl font-bold text-white">0</span>
                </div>
                <p className="text-gray-400">Messages</p>
                <p className="text-sm text-gray-500 mt-1">Aucun nouveau message</p>
              </div>
              
              <div className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a3a]">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                  <span className="text-2xl font-bold text-white">--</span>
                </div>
                <p className="text-gray-400">Progression moyenne</p>
                <p className="text-sm text-gray-500 mt-1">Données à venir</p>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Liste des élèves ({students.length})</h3>
                <div className="text-sm text-gray-400">
                  {classDetails.studentCount}/{classDetails.maxStudents === 0 ? 'illimité' : classDetails.maxStudents} places
                </div>
              </div>
              
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">Aucun élève inscrit pour le moment.</p>
                  <div className="text-sm text-gray-500">
                    Partagez le code d'invitation <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded font-mono">
                      {classDetails.inviteCode}
                    </span> pour que les élèves puissent rejoindre.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-[#2a2a3a] rounded-lg border border-[#3a3a4a]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <span className="text-purple-400 font-medium">
                            {student.user.displayName?.[0] || student.user.username?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {student.user.displayName || student.user.username}
                          </p>
                          <p className="text-sm text-gray-400">@{student.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Élève
                        </span>
                        <button className="p-2 hover:bg-[#3a3a4a] rounded-lg transition-colors">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Demandes d'adhésion ({joinRequests.length})</h3>
              </div>
              
              {joinRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Aucune demande d'adhésion en attente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {joinRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-[#2a2a3a] rounded-lg border border-[#3a3a4a]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <span className="text-yellow-400 font-medium">
                            {request.user.displayName?.[0] || request.user.username?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {request.user.displayName || request.user.username}
                          </p>
                          <p className="text-sm text-gray-400">@{request.user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => acceptStudent(request.userId)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Accepter
                        </button>
                        <button
                          onClick={() => rejectStudent(request.userId)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Analytiques de la classe</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#2a2a3a] p-4 rounded-lg border border-[#3a3a4a]">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    <span className="text-2xl font-bold text-white">--</span>
                  </div>
                  <p className="text-gray-400 text-sm">Progression moyenne</p>
                </div>
                
                <div className="bg-[#2a2a3a] p-4 rounded-lg border border-[#3a3a4a]">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-6 h-6 text-blue-400" />
                    <span className="text-2xl font-bold text-white">--</span>
                  </div>
                  <p className="text-gray-400 text-sm">Taux de réussite</p>
                </div>
                
                <div className="bg-[#2a2a3a] p-4 rounded-lg border border-[#3a3a4a]">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-6 h-6 text-purple-400" />
                    <span className="text-2xl font-bold text-white">--</span>
                  </div>
                  <p className="text-gray-400 text-sm">Activité cette semaine</p>
                </div>
              </div>
              
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">Les analytiques détaillées seront bientôt disponibles.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Paramètres de la classe</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nom de la classe</label>
                  <input
                    type="text"
                    value={classDetails.name}
                    className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    value={classDetails.description}
                    className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                    rows={3}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Code d'invitation</label>
                  <input
                    type="text"
                    value={classDetails.inviteCode || 'Aucun'}
                    className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
