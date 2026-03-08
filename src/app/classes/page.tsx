'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap, Users, Search, Plus, ArrowLeft, BookOpen,
  Clock, CheckCircle, Clock3, AlertCircle, User, Hash, AtSign,
  Lock, Globe, ChevronRight, Loader2
} from 'lucide-react';

// Types
interface ClassGroup {
  id: string;
  name: string;
  description: string | null;
  level: string | null;
  subject: string;
  maxStudents: number;
  isPrivate: boolean;
  studentCount: number;
  inviteCode: string | null;
  createdAt: string;
  teacher: {
    id: string;
    username: string;
    displayName: string | null;
  };
  isTeacher?: boolean;
  joinedAt?: string;
}

interface PendingRequest {
  id: string;
  groupId: string;
  groupName: string;
  status: string;
  joinedAt: string;
}

export default function ClassesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // États
  const [activeTab, setActiveTab] = useState<'search' | 'invite'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClassGroup[]>([]);
  const [myClasses, setMyClasses] = useState<ClassGroup[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const isTeacher = (session?.user as any)?.isTeacher || (session?.user as any)?.isAdmin;
  const userEmail = session?.user?.email;
  const isAdmin = userEmail === 'noe.barneron@gmail.com' || (session?.user as any)?.isAdmin;

  // Charger les classes de l'utilisateur
  useEffect(() => {
    if (session?.user) {
      loadMyClasses();
    }
  }, [session?.user?.id]);

  // Recherche avec debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadMyClasses = async () => {
    try {
      const response = await fetch('/api/class-groups/my-classes');
      if (response.ok) {
        const data = await response.json();
        setMyClasses(data.classes || []);
        
        // Extraire les demandes en attente
        const pending = data.classes
          ?.filter((c: any) => c.role === 'pending' || c.status === 'pending')
          .map((c: any) => ({
            id: c.id,
            groupId: c.id,
            groupName: c.name,
            status: 'pending',
            joinedAt: c.joinedAt
          })) || [];
        setPendingRequests(pending);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Détecter le type de recherche
      const isIdSearch = searchQuery.startsWith('#');
      const isTeacherSearch = searchQuery.startsWith('@');
      
      let url = '/api/class-groups/public';
      const params = new URLSearchParams();
      
      if (isIdSearch) {
        params.append('id', searchQuery.slice(1));
      } else if (isTeacherSearch) {
        params.append('teacher', searchQuery);
      } else {
        params.append('search', searchQuery);
      }
      
      url += '?' + params.toString();

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Filtrer les classes privées des résultats de recherche
        const publicResults = (data.groups || []).filter((g: ClassGroup) => !g.isPrivate);
        setSearchResults(publicResults);
      }
    } catch (error) {
      console.error('Error searching classes:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const joinPublicClass = async (inviteCode: string, classId: string) => {
    setIsJoining(classId);
    setJoinMessage(null);
    
    try {
      const response = await fetch('/api/class-groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      });

      const data = await response.json();

      if (response.ok) {
        setJoinMessage({
          type: 'success',
          text: data.needsApproval 
            ? 'Demande envoyée. Le professeur sera notifié.' 
            : 'Vous avez rejoint la classe avec succès !'
        });
        loadMyClasses();
        // Retirer la classe des résultats si on l'a rejoint
        setSearchResults(prev => prev.filter(c => c.id !== classId));
      } else {
        setJoinMessage({
          type: 'error',
          text: data.error || 'Erreur lors de l\'adhésion'
        });
      }
    } catch (error) {
      setJoinMessage({
        type: 'error',
        text: 'Erreur lors de l\'adhésion à la classe'
      });
    } finally {
      setIsJoining(null);
    }
  };

  const submitInviteRequest = async () => {
    if (!inviteCode.trim()) return;
    
    setIsSubmittingInvite(true);
    setJoinMessage(null);
    
    try {
      const response = await fetch('/api/class-groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setJoinMessage({
          type: 'success',
          text: data.needsApproval 
            ? 'Demande envoyée. Le professeur sera notifié.' 
            : 'Vous avez rejoint la classe avec succès !'
        });
        setInviteCode('');
        loadMyClasses();
      } else {
        setJoinMessage({
          type: 'error',
          text: data.error || 'Code d\'invitation invalide'
        });
      }
    } catch (error) {
      setJoinMessage({
        type: 'error',
        text: 'Erreur lors de l\'envoi de la demande'
      });
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const isAlreadyMember = (classId: string) => {
    return myClasses.some(c => c.id === classId);
  };

  // Déterminer le placeholder de recherche
  const getSearchPlaceholder = () => {
    if (searchQuery.startsWith('#')) return "Recherche par ID exact...";
    if (searchQuery.startsWith('@')) return "Recherche par professeur...";
    return "Rechercher par nom, #ID ou @Professeur";
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Connexion requise</h1>
          <p className="text-gray-400">Vous devez être connecté pour accéder à cette page</p>
          <Link href="/login" className="mt-4 inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Se connecter
          </Link>
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
                Mes classes
              </h1>
            </div>
            
            {/* Bouton Créer visible uniquement pour profs/admins */}
            {(isTeacher || isAdmin) && (
              <Link
                href="/class-management/create"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-150 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer une classe
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* SECTION 1 — Mes classes inscrites */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Mes classes inscrites
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : myClasses.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Aucune classe</h3>
              <p className="text-sm text-gray-500">
                Vous n'êtes membre d'aucune classe pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myClasses.map((classItem) => (
                <Link
                  key={classItem.id}
                  href={`/class-management/${classItem.id}`}
                  className="block p-5 bg-[#1e1e2e] rounded-xl border border-[#3a3a4a] hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      classItem.isPrivate 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {classItem.isPrivate ? 'Privée' : 'Publique'}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                    {classItem.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {classItem.description || 'Aucune description'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {classItem.teacher?.displayName || classItem.teacher?.username || 'Professeur'}
                    </span>
                    <span className="text-purple-400 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {classItem.studentCount || 0}/{classItem.maxStudents || '∞'}
                    </span>
                  </div>
                  
                  {classItem.joinedAt && (
                    <div className="mt-3 pt-3 border-t border-[#3a3a4a] flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      Rejoint le {new Date(classItem.joinedAt).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </motion.section>

        {/* SECTION 2 — Rejoindre une classe */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'search'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" />
              Rechercher une classe publique
            </button>
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'invite'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="w-4 h-4" />
              Code d'invitation
            </button>
          </div>

          <div className="p-6">
            {/* TAB: Rechercher */}
            {activeTab === 'search' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Barre de recherche */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={getSearchPlaceholder()}
                    className="w-full pl-10 pr-4 py-3 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <AlertCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Indicateur de syntaxe */}
                {searchQuery && (
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    {searchQuery.startsWith('#') && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Hash className="w-4 h-4" />
                        Recherche par ID exact
                      </span>
                    )}
                    {searchQuery.startsWith('@') && (
                      <span className="flex items-center gap-1 text-blue-400">
                        <AtSign className="w-4 h-4" />
                        Recherche par professeur
                      </span>
                    )}
                    {!searchQuery.startsWith('#') && !searchQuery.startsWith('@') && searchQuery && (
                      <span className="flex items-center gap-1 text-green-400">
                        <Globe className="w-4 h-4" />
                        Recherche par nom de classe
                      </span>
                    )}
                  </div>
                )}

                {/* Résultats */}
                {isSearching ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400 mb-3">
                      {searchResults.length} classe{searchResults.length > 1 ? 's' : ''} trouvée{searchResults.length > 1 ? 's' : ''}
                    </p>
                    {searchResults.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="p-4 bg-[#1e1e2e] rounded-lg border border-[#3a3a4a] flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">{classItem.name}</h4>
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                              Publique
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            Prof: {classItem.teacher?.displayName || classItem.teacher?.username}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {classItem.studentCount || 0} élèves
                            </span>
                            {classItem.level && (
                              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded">
                                {classItem.level}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => classItem.inviteCode && joinPublicClass(classItem.inviteCode, classItem.id)}
                          disabled={isJoining === classItem.id || isAlreadyMember(classItem.id)}
                          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                            isAlreadyMember(classItem.id)
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50'
                          }`}
                        >
                          {isAlreadyMember(classItem.id) 
                            ? 'Déjà inscrit' 
                            : isJoining === classItem.id 
                              ? '...' 
                              : 'Rejoindre'
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8 text-gray-400">
                    <Search className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                    <p>Aucune classe publique trouvée pour cette recherche</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Essayez avec un autre nom ou utilisez un code d'invitation pour les classes privées
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Search className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                    <p>Recherchez une classe par son nom</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Utilisez <span className="text-yellow-400">#ABC123</span> pour chercher par ID ou{' '}
                      <span className="text-blue-400">@NomProf</span> pour chercher par professeur
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: Code d'invitation */}
            {activeTab === 'invite' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-gray-400 mb-4">
                  Entrez le code d'invitation fourni par votre professeur pour rejoindre une classe privée.
                  Une demande sera envoyée au professeur pour approbation.
                </p>
                
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="INV-XXXXX"
                    className="flex-1 px-4 py-3 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 uppercase"
                  />
                  <button
                    onClick={submitInviteRequest}
                    disabled={isSubmittingInvite || !inviteCode.trim()}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {isSubmittingInvite ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    Envoyer
                  </button>
                </div>

                {/* Message de retour */}
                {joinMessage && (
                  <div className={`p-4 rounded-lg flex items-start gap-3 ${
                    joinMessage.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    {joinMessage.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <p className={joinMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                      {joinMessage.text}
                    </p>
                  </div>
                )}

                {/* Demandes en attente */}
                {pendingRequests.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[#3a3a4a]">
                    <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Clock3 className="w-4 h-4 text-yellow-400" />
                      Demandes en attente
                    </h4>
                    <div className="space-y-2">
                      {pendingRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-white">{req.groupName}</p>
                            <p className="text-sm text-gray-400">
                              Demande envoyée le {new Date(req.joinedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                            En attente
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
