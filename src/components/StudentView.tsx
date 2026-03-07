'use client';

import { useState, useEffect } from 'react';
import { Search, GraduationCap, Users, BookOpen, Plus, Send, User } from 'lucide-react';
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
  const [teacherQuery, setTeacherQuery] = useState('');
  const [isSearchingTeacher, setIsSearchingTeacher] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'class' | 'teacher'>('class');

  // Détecter le type de recherche automatiquement
  useEffect(() => {
    if (searchQuery.startsWith('@') || searchQuery.startsWith('#')) {
      setSearchType('teacher');
      setTeacherQuery(searchQuery);
    } else {
      setSearchType('class');
      setTeacherQuery('');
    }
  }, [searchQuery]);

  // Charger les classes du professeur
  useEffect(() => {
    if (searchType === 'teacher' && teacherQuery) {
      loadTeacherClasses();
    } else {
      setTeacherClasses([]);
    }
  }, [teacherQuery, searchType]);

  const loadTeacherClasses = async () => {
    if (!teacherQuery.trim()) return;
    
    setIsSearchingTeacher(true);
    try {
      const response = await fetch(`/api/class-groups/public?teacher=${encodeURIComponent(teacherQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setTeacherClasses(data.groups || []);
      }
    } catch (error) {
      console.error('Error loading teacher classes:', error);
      setTeacherClasses([]);
    } finally {
      setIsSearchingTeacher(false);
    }
  };

  const requestToJoin = async (classId: string) => {
    setRequestingClass(classId);
    try {
      const response = await fetch('/api/class-groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'request', 
          classId,
          inviteCode: '' // Sera géré différemment pour les classes publiques
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Demande d\'adhésion envoyée avec succès !');
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

  const joinPublicClass = async (inviteCode: string) => {
    setRequestingClass(inviteCode);
    try {
      const response = await fetch('/api/class-groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Classe rejointe avec succès !');
        onClassJoined();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'adhésion');
      }
    } catch (error) {
      alert('Erreur lors de l\'adhésion à la classe');
    } finally {
      setRequestingClass(null);
    }
  };

  const displayedClasses = searchType === 'teacher' ? teacherClasses : publicClasses;

  return (
    <div className="space-y-8">
      {/* Section Rejoindre par code */}
      <JoinClassSection onClassJoined={onClassJoined} />

      {/* Section Recherche */}
      <div className="bg-[#1a1a2a] rounded-xl border border-[#2a2a3a] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-semibold">
            {searchType === 'teacher' ? 'Rechercher un professeur' : 'Rechercher une classe publique'}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Recherche de classes */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={
                searchType === 'teacher' 
                  ? "Entrez @pseudo, #id ou le nom du professeur..." 
                  : "Rechercher une classe..."
              }
              value={searchType === 'teacher' ? teacherQuery : searchQuery}
              onChange={(e) => {
                if (searchType === 'teacher') {
                  setTeacherQuery(e.target.value);
                } else {
                  setSearchQuery(e.target.value);
                }
              }}
              className="w-full pl-10 pr-4 py-3 bg-[#2a2a3a] border border-[#3a3a4a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Indicateur de recherche */}
          {searchType === 'teacher' && teacherQuery && (
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <User className="w-4 h-4" />
              <span>Recherche de professeur: {teacherQuery}</span>
            </div>
          )}
        </div>

        {/* Résultats */}
        {isLoading || isSearchingTeacher ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : displayedClasses.length > 0 ? (
          <div className="grid gap-4 mt-6">
            {displayedClasses.map((cls) => (
              <div key={cls.id} className="bg-[#2a2a3a] rounded-lg p-4 border border-[#3a3a4a]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{cls.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">
                      Professeur: {cls.teacher.displayName}
                    </p>
                    {cls.description && (
                      <p className="text-sm text-gray-300">{cls.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-purple-400 mb-2">
                      <Users className="w-4 h-4" />
                      <span>{cls.studentCount || 0} élèves</span>
                    </div>
                    {cls.level && (
                      <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                        {cls.level}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => joinPublicClass(cls.inviteCode)}
                    disabled={requestingClass === cls.inviteCode}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requestingClass === cls.inviteCode ? 'Rejoindre...' : 'Rejoindre'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {searchType === 'teacher' 
              ? (teacherQuery ? 'Aucune classe trouvée pour ce professeur' : 'Entrez un nom de professeur pour rechercher')
              : 'Aucune classe publique trouvée'
            }
          </div>
        )}
      </div>
    </div>
  );
}
