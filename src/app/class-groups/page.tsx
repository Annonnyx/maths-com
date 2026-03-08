'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, ArrowRight, GraduationCap, Search, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ClassGroup {
  id: string;
  name: string;
  teacher: {
    id: string;
    username: string;
    displayName: string | null;
  };
  _count: {
    members: number;
  };
  isPrivate: boolean;
}

function ClassGroupsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code');
  
  const [groups, setGroups] = useState<ClassGroup[]>([]);
  const [myGroups, setMyGroups] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  
  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGroups, setFilteredGroups] = useState<ClassGroup[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [filterSubject, setFilterSubject] = useState<'all' | 'math' | 'science' | 'other'>('all');
  
  // États pour rejoindre une classe
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [joinedClass, setJoinedClass] = useState<any>(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [groupsRes, myGroupsRes] = await Promise.all([
          fetch('/api/class-groups'),
          session?.user ? fetch('/api/class-groups/my-classes') : Promise.resolve({ ok: false } as Response)
        ]);
        
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          setGroups(groupsData.groups || []);
        }
        
        if (myGroupsRes.ok) {
          const myGroupsData = await myGroupsRes.json();
          setMyGroups(myGroupsData.groups || []);
        }
      } catch (error) {
        console.error('Error loading groups:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAll();
  }, [session]);

  // Effet pour filtrer les groupes selon la recherche
  useEffect(() => {
    let filtered = groups.filter(group => !group.isPrivate); // Montrer seulement les classes publiques
    
    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(query) ||
        group.teacher.displayName?.toLowerCase().includes(query) ||
        group.teacher.username.toLowerCase().includes(query)
      );
    }
    
    // Appliquer les filtres supplémentaires si nécessaire
    if (filterDifficulty !== 'all') {
      // Ici vous pourriez filtrer par difficulté si c'est dans les données
      // filtered = filtered.filter(group => group.difficulty === filterDifficulty);
    }
    
    if (filterSubject !== 'all') {
      // Ici vous pourriez filtrer par matière si c'est dans les données
      // filtered = filtered.filter(group => group.subject === filterSubject);
    }
    
    setFilteredGroups(filtered);
  }, [groups, searchQuery, filterDifficulty, filterSubject]);

  // Gérer le code d'invitation depuis l'URL
  useEffect(() => {
    if (inviteCode) {
      setJoinCode(inviteCode);
      setShowJoinModal(true);
      // Nettoyer l'URL
      router.replace('/class-groups');
    }
  }, [inviteCode, router]);

  // Fonction pour rejoindre une classe
  const handleJoinClass = async (code: string) => {
    if (!code.trim()) {
      setJoinError('Veuillez entrer un code d\'invitation');
      return;
    }

    setJoinLoading(true);
    setJoinError('');

    try {
      const response = await fetch('/api/class-groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setJoinedClass({
          name: data.member.group.name,
          teacher: data.member.group.teacher,
          needsApproval: data.needsApproval
        });
        setJoinSuccess(true);
        
        // Recharger les données
        const myGroupsRes = await fetch('/api/class-groups/my-classes');
        if (myGroupsRes.ok) {
          const myGroupsData = await myGroupsRes.json();
          setMyGroups(myGroupsData.groups || []);
        }
      } else {
        setJoinError(data.error || 'Code invalide');
      }
    } catch (error) {
      setJoinError('Erreur lors de la connexion');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#12121a]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-indigo-400" />
                Classes
              </h1>
              <p className="text-gray-400 mt-1">
                Rejoignez des groupes de classe pour apprendre ensemble
              </p>
            </div>
            
            {session?.user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer une classe
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'my'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mes classes
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Toutes les classes
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres - seulement pour le tab "Toutes les classes" */}
      {activeTab === 'all' && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une classe, un professeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1e1e2e] border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-white placeholder-gray-400"
              />
            </div>
            
            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-[#1e1e2e] border border-gray-700 rounded-lg hover:border-indigo-500 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filtres</span>
              {(filterDifficulty !== 'all' || filterSubject !== 'all') && (
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              )}
            </button>
          </div>
          
          {/* Panneau de filtres */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-[#1e1e2e] border border-gray-700 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#12121a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Toutes</option>
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="advanced">Avancé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Matière
                  </label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#12121a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Toutes</option>
                    <option value="math">Mathématiques</option>
                    <option value="science">Sciences</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setFilterDifficulty('all');
                    setFilterSubject('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm transition-colors"
                >
                  Appliquer
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Résultats de recherche */}
          {searchQuery && (
            <div className="mt-4 text-sm text-gray-400">
              {filteredGroups.length} classe{filteredGroups.length !== 1 ? 's' : ''} trouvée{filteredGroups.length !== 1 ? 's' : ''} pour "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'my' ? (
          myGroups.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Aucune classe</h2>
              <p className="text-gray-400 mb-6">
                Vous n'êtes membre d'aucune classe pour le moment.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
                >
                  Rejoindre avec un code
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Explorer les classes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGroups.map((group) => (
                <div key={group.id} className="bg-[#1e1e2e] rounded-xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs">
                      {group._count.members} membres
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Prof: {group.teacher.displayName || group.teacher.username}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredGroups.length === 0 && searchQuery ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Aucune classe trouvée</h2>
              <p className="text-gray-400 mb-6">
                Aucune classe ne correspond à votre recherche "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
              >
                Effacer la recherche
              </button>
            </div>
          ) : filteredGroups.length === 0 && !searchQuery ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Aucune classe publique</h2>
              <p className="text-gray-400 mb-6">
                Il n'y a pas de classe publique disponible pour le moment.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
                >
                  Rejoindre avec un code
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <div key={group.id} className="bg-[#1e1e2e] rounded-xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs">
                      {group._count.members} membres
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <Users className="w-4 h-4" />
                    <span>Prof: {group.teacher.displayName || group.teacher.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = `/class-join?code=${group.id}`;
                    }}
                    className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
                  >
                    Rejoindre
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Modal pour rejoindre une classe */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e1e2e] rounded-xl p-6 max-w-md w-full">
            {!joinSuccess ? (
              <>
                <h2 className="text-xl font-bold mb-4">Rejoindre une classe</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Code d'invitation
                    </label>
                    <input
                      type="text"
                      placeholder="Entrez le code d'invitation"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      className="w-full px-3 py-2 bg-[#12121a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                  </div>
                  
                  {joinError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{joinError}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowJoinModal(false);
                        setJoinCode('');
                        setJoinError('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleJoinClass(joinCode)}
                      disabled={joinLoading}
                      className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {joinLoading ? 'Rejoindre...' : 'Rejoindre'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">
                  {joinedClass?.needsApproval ? 'Demande envoyée !' : 'Classe rejointe !'}
                </h2>
                <div className="bg-[#2a2a3a] rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-lg mb-2">{joinedClass?.name}</h3>
                  <p className="text-sm text-gray-400">
                    Professeur: {joinedClass?.teacher?.displayName || joinedClass?.teacher?.username}
                  </p>
                </div>
                <p className="text-gray-400 mb-6">
                  {joinedClass?.needsApproval 
                    ? 'Votre demande a été envoyée au professeur. Vous recevrez une notification dès qu\'elle sera acceptée.'
                    : 'Vous avez rejoint cette classe avec succès !'
                  }
                </p>
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinSuccess(false);
                    setJoinedClass(null);
                    setJoinCode('');
                    setJoinError('');
                    setActiveTab('my');
                  }}
                  className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
                >
                  {joinedClass?.needsApproval ? 'OK' : 'Voir mes classes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClassGroupsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <ClassGroupsContent />
    </Suspense>
  );
}
