'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  Award,
  Settings,
  RefreshCw
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface JoinRequest {
  id: string;
  student_id: string;
  teacher_id: string;
  status: 'pending' | 'accepted' | 'refused';
  created_at: string;
  updated_at: string;
  student: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    elo: number;
    rankClass: string;
  };
}

interface ClassStudent {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  elo: number;
  rankClass: string;
  joinedAt: string;
}

export default function TeacherClassManager() {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [acceptJoinRequests, setAcceptJoinRequests] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'class'>('requests');

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les préférences du professeur
      const { data: profile } = await supabase
        .from('users')
        .select('accept_join_requests')
        .eq('id', user.id)
        .single();

      if (profile) {
        setAcceptJoinRequests(profile.accept_join_requests);
      }

      // Charger les demandes en attente
      const { data: requests } = await supabase
        .from('class_join_requests')
        .select(`
          *,
          student!inner(
            id,
            username,
            displayName,
            avatarUrl,
            elo,
            rankClass
          )
        `)
        .eq('teacher_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requests) {
        setJoinRequests(requests);
      }

      // Charger les élèves acceptés
      const { data: acceptedRequests } = await supabase
        .from('class_join_requests')
        .select(`
          student_id,
          updated_at:joined_at,
          student!inner(
            id,
            username,
            displayName,
            avatarUrl,
            elo,
            rankClass
          )
        `)
        .eq('teacher_id', user.id)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (acceptedRequests) {
        const students: ClassStudent[] = acceptedRequests.map(req => {
          const student = req.student[0]; // req.student est un tableau
          return {
            id: student.id,
            username: student.username || '',
            displayName: student.displayName || student.username || '',
            avatarUrl: student.avatarUrl,
            elo: (student as any).soloElo || 1000,
            rankClass: (student as any).soloRankClass || 'Bronze',
            joinedAt: req.updated_at
          };
        });
        setClassStudents(students);
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('class_join_requests')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error accepting request:', error);
      } else {
        // Recharger les données
        await loadTeacherData();
      }
    } catch (error) {
      console.error('Error in handleAcceptRequest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefuseRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('class_join_requests')
        .update({ 
          status: 'refused',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error refusing request:', error);
      } else {
        // Recharger les données
        await loadTeacherData();
      }
    } catch (error) {
      console.error('Error in handleRefuseRequest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAcceptJoinRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newValue = !acceptJoinRequests;
      const { error } = await supabase
        .from('users')
        .update({ accept_join_requests: newValue })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating preference:', error);
      } else {
        setAcceptJoinRequests(newValue);
      }
    } catch (error) {
      console.error('Error in toggleAcceptJoinRequests:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Users className="w-6 h-6 text-indigo-400" />
          Gestion de Classe
        </h2>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadTeacherData}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
          
          <button
            onClick={toggleAcceptJoinRequests}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm">
              {acceptJoinRequests ? 'Accepter les demandes' : 'Refuser les demandes'}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-all border-b-2 ${
            activeTab === 'requests' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          Demandes d'élèves
          {joinRequests.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-indigo-500 text-white text-xs rounded-full">
              {joinRequests.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('class')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-all border-b-2 ${
            activeTab === 'class' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Ma classe
          {classStudents.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              {classStudents.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {joinRequests.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a2e] rounded-xl border border-gray-800">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune demande en attente</h3>
              <p className="text-gray-400">
                {acceptJoinRequests 
                  ? 'Les nouvelles demandes d\'élèves apparaîtront ici.' 
                  : 'Vous avez désactivé les demandes d\'adhésion.'
                }
              </p>
            </div>
          ) : (
            joinRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {request.student.avatarUrl ? (
                      <img 
                        src={request.student.avatarUrl} 
                        alt={request.student.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {request.student.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-white">
                        {request.student.displayName}
                      </h4>
                      <p className="text-sm text-gray-400">
                        @{request.student.username} • {(request.student as any).soloRankClass}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-indigo-400">
                          ELO: {(request.student as any).soloElo}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {new Date(request.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAcceptRequest(request.id)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    Accepter
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRefuseRequest(request.id)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" />
                    Refuser
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {activeTab === 'class' && (
        <div className="space-y-4">
          {classStudents.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a2e] rounded-xl border border-gray-800">
              <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun élève dans votre classe</h3>
              <p className="text-gray-400">
                Les élèves acceptés apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classStudents.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4"
                >
                  <div className="flex items-center gap-3">
                    {student.avatarUrl ? (
                      <img 
                        src={student.avatarUrl} 
                        alt={student.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {student.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">
                        {student.displayName}
                      </h4>
                      <p className="text-sm text-gray-400">
                        @{student.username}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium text-yellow-400">
                            {(student as any).soloRankClass}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm text-indigo-400">
                            {(student as any).soloElo}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Rejoint le {new Date(student.joinedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
