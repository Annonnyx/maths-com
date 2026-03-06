'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Settings, BarChart3, MessageSquare, 
  BookOpen, Calendar, Award, Target, TrendingUp 
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

  const tabs = [
    { id: 'overview', name: 'Aperçu', icon: BarChart3 },
    { id: 'students', name: 'Élèves', icon: Users },
    { id: 'assignments', name: 'Devoirs', icon: BookOpen },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
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
        setClassDetails(data);
      }
    } catch (error) {
      console.error('Error loading class details:', error);
    } finally {
      setIsLoading(false);
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
              <h3 className="text-xl font-semibold text-white mb-4">Liste des élèves</h3>
              <p className="text-gray-400">Aucun élève inscrit pour le moment.</p>
              <div className="mt-4">
                <Link
                  href={`/class-management/${classDetails.id}/invite`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Inviter des élèves
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Devoirs et exercices</h3>
              <p className="text-gray-400">Aucun devoir créé pour le moment.</p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Créer un devoir
                </button>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Messages de la classe</h3>
              <p className="text-gray-400">Aucun message pour le moment.</p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Envoyer un message
                </button>
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
