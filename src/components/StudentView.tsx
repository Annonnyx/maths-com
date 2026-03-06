'use client';

import { useState } from 'react';
import { Search, GraduationCap, Users, BookOpen, Plus, Send } from 'lucide-react';
import JoinClassSection from './JoinClassSection';

interface StudentViewProps {
  publicClasses: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  onClassJoined: () => void;
}

export default function StudentView({ 
  publicClasses, 
  searchQuery, 
  setSearchQuery, 
  isLoading, 
  onClassJoined 
}: StudentViewProps) {
  const [requestingClass, setRequestingClass] = useState<string | null>(null);

  const filteredClasses = publicClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const requestToJoin = async (classId: string) => {
    setRequestingClass(classId);
    try {
      const response = await fetch('/api/class-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', classId })
      });
      
      if (response.ok) {
        alert('Demande d\'adhésion envoyée avec succès !');
        onClassJoined(); // Recharger la liste
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la demande');
      }
    } catch (error) {
      alert('Erreur lors de la demande d\'adhésion');
    } finally {
      setRequestingClass(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="bg-[#1a1a2e] border-b border-[#2a2a3a]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-purple-400" />
                Explorer les classes
              </h1>
              <p className="text-gray-400 mt-2">Découvrez et rejoignez des classes publiques</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Section Rejoindre avec code */}
        <JoinClassSection onClassJoined={onClassJoined} />

        {/* Barre de recherche */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des classes par nom, matière, niveau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#1a1a2e] border border-[#2a2a3a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-lg"
            />
          </div>
        </div>

        {/* Résultats de recherche */}
        {filteredClasses.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchQuery ? 'Aucune classe trouvée' : 'Aucune classe publique disponible'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Essayez d\'autres termes de recherche' 
                : 'Les professeurs n\'ont pas encore créé de classes publiques'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <div key={cls.id} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a3a] overflow-hidden hover:border-purple-500/50 transition-colors">
                {/* Header */}
                <div className="p-6 border-b border-[#2a2a3a]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                      Publique
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{cls.name}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{cls.description || 'Aucune description'}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {cls.studentCount} élèves
                    </span>
                    <span>{cls.level || 'Tous niveaux'}</span>
                    <span>{cls.subject}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#2a2a3a]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-xs font-bold">
                          {cls.teacher?.displayName?.[0] || cls.teacher?.username?.[0] || '?'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {cls.teacher?.displayName || cls.teacher?.username}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Max: {cls.maxStudents === 0 ? 'Illimité' : cls.maxStudents}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => requestToJoin(cls.id)}
                    disabled={requestingClass === cls.id}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {requestingClass === cls.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Demander à rejoindre
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
