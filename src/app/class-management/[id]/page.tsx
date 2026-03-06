'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Settings, BarChart3, MessageSquare, 
  BookOpen, Calendar, Award, Target, TrendingUp, Check, X, Plus
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    maxStudents: 30,
    isPrivate: false
  });

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
        setClassDetails(data.group);
        
        // Initialiser le formulaire d'édition
        setEditForm({
          name: data.group.name,
          description: data.group.description || '',
          maxStudents: data.group.maxStudents,
          isPrivate: data.group.isPrivate
        });
        
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

  const updateClass = async () => {
    try {
      const response = await fetch(`/api/class-groups/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        setIsEditing(false);
        loadClassDetails();
        alert('Classe mise à jour avec succès !');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const deleteClass = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/class-groups/${params.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        router.push('/class-management');
        alert('Classe supprimée avec succès');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Erreur lors de la suppression');
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

          {activeTab === 'assignments' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Devoirs et exercices</h3>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Créer un devoir
                </button>
              </div>
              
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">Aucun devoir créé pour le moment.</p>
                <p className="text-sm text-gray-500">Commencez par créer votre premier devoir pour cette classe.</p>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-[#1a1a2e] rounded-lg border border-[#2a2a3a] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Messages de la classe</h3>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Envoyer un message
                </button>
              </div>
              
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-2">Aucun message pour le moment.</p>
                <p className="text-sm text-gray-500">Communiquez avec vos élèves en envoyant des messages à toute la classe.</p>
              </div>
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Paramètres de la classe</h3>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Modifier
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            name: classDetails.name,
                            description: classDetails.description || '',
                            maxStudents: classDetails.maxStudents,
                            isPrivate: classDetails.isPrivate
                          });
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={updateClass}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Sauvegarder
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Informations de base */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nom de la classe</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                      />
                    ) : (
                      <input
                        type="text"
                        value={classDetails.name}
                        className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                        readOnly
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nombre maximum d'élèves</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.maxStudents}
                        onChange={(e) => setEditForm({...editForm, maxStudents: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                      />
                    ) : (
                      <input
                        type="text"
                        value={classDetails.maxStudents === 0 ? 'Illimité' : classDetails.maxStudents}
                        className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                        readOnly
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                      rows={3}
                    />
                  ) : (
                    <textarea
                      value={classDetails.description || ''}
                      className="w-full px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                      rows={3}
                      readOnly
                    />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="private"
                    checked={isEditing ? editForm.isPrivate : classDetails.isPrivate}
                    onChange={(e) => isEditing && setEditForm({...editForm, isPrivate: e.target.checked})}
                    disabled={!isEditing}
                    className="w-4 h-4 text-purple-600 bg-[#2a2a3a] border border-[#3a3a4a] rounded focus:ring-purple-500"
                  />
                  <label htmlFor="private" className="text-sm text-gray-400">
                    Classe privée (uniquement sur invitation)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Code d'invitation</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={classDetails.inviteCode || 'Aucun'}
                      className="flex-1 px-3 py-2 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white"
                      readOnly
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(classDetails.inviteCode || '');
                        alert('Code copié dans le presse-papiers !');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Copier
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                  <div>
                    <span className="font-medium">Niveau:</span> {classDetails.level || 'Non défini'}
                  </div>
                  <div>
                    <span className="font-medium">Matière:</span> {classDetails.subject}
                  </div>
                  <div>
                    <span className="font-medium">Élèves actuels:</span> {classDetails.studentCount}
                  </div>
                  <div>
                    <span className="font-medium">Créée le:</span> {new Date(classDetails.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Actions dangereuses */}
              <div className="mt-8 pt-6 border-t border-[#3a3a4a]">
                <h4 className="text-lg font-semibold text-red-400 mb-4">Actions dangereuses</h4>
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Une fois supprimée, la classe ne pourra pas être récupérée. Tous les élèves seront retirés et les données associées seront perdues.
                  </p>
                  <button
                    onClick={deleteClass}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Supprimer la classe
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
