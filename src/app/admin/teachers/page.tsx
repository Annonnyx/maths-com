'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Search, 
  CheckCircle, 
  XCircle, 
  Crown,
  Users,
  Mail,
  School,
  BookOpen,
  AlertCircle,
  ArrowLeft,
  Shield,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { isAdminSession } from '@/lib/admin-auth';

interface User {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  elo: number;
  rankClass: string;
  isTeacher: boolean;
  isAdmin: boolean;
  createdAt: string;
  school?: string;
  subject?: string;
}

interface TeacherRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  school: string;
  subject: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminTeachersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'teachers' | 'students' | 'pending'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');

  // Récupérer les vraies données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        
        if (data.users) {
          setUsers(data.users.map((user: any) => ({
            ...user,
            isTeacher: user.isTeacher || false, // Valeur par défaut
            school: user.school || null,
            subject: user.subject || null
          })));
        }
        
        if (data.requests) {
          setRequests(data.requests);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleTeacher = async (userId: string, makeTeacher: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, makeTeacher }),
      });

      if (response.ok) {
        // Mettre à jour l'interface localement
        setUsers(users.map(u => 
          u.id === userId ? { ...u, isTeacher: makeTeacher } : u
        ));
      } else {
        console.error('Failed to update teacher status');
      }
    } catch (error) {
      console.error('Error updating teacher status:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    // API call to approve request
    setRequests(requests.map(r => 
      r.id === requestId ? { ...r, status: 'approved' } : r
    ));
  };

  const handleRejectRequest = async (requestId: string) => {
    // API call to reject request
    setRequests(requests.map(r => 
      r.id === requestId ? { ...r, status: 'rejected' } : r
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.school?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'teachers') return matchesSearch && user.isTeacher;
    if (filter === 'students') return matchesSearch && !user.isTeacher;
    return matchesSearch;
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (!isAdminSession(session)) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Accès refusé</h1>
          <p className="text-gray-400 mt-2">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour Admin</span>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              Gestion des Professeurs
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/admin" 
              className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Général
            </Link>
            <Link 
              href="/admin/discord" 
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Bot Discord
            </Link>
            <Link 
              href="/admin/teachers" 
              className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Professeurs
            </Link>
            {pendingRequests.length > 0 && (
              <div className="bg-yellow-500/20 px-4 py-2 rounded-lg">
                <span className="text-yellow-400 font-semibold">{pendingRequests.length}</span>
                <span className="text-gray-400 text-sm ml-2">demandes en attente</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'users' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-xl font-medium transition-all relative ${
              activeTab === 'requests' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Demandes
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-xs rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'users' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-indigo-500 outline-none"
                />
              </div>
              
              <div className="flex gap-2">
                {(['all', 'teachers', 'students'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === f 
                        ? 'bg-indigo-500/30 text-indigo-400 border border-indigo-500/50' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {f === 'all' && 'Tous'}
                    {f === 'teachers' && 'Enseignants'}
                    {f === 'students' && 'Élèves'}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#1a1a2e]">
                    <th className="text-left p-4 font-semibold text-gray-400">Utilisateur</th>
                    <th className="text-left p-4 font-semibold text-gray-400">Établissement</th>
                    <th className="text-left p-4 font-semibold text-gray-400">ELO</th>
                    <th className="text-left p-4 font-semibold text-gray-400">Statut</th>
                    <th className="text-left p-4 font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800/50 hover:bg-[#1a1a2e]/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.displayName?.[0] || user.username[0]}
                          </div>
                          <div>
                            <p className="font-semibold">{user.displayName || user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {user.school ? (
                          <div className="flex items-center gap-2">
                            <School className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{user.school}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{user.elo}</span>
                          <span className="text-sm text-gray-500">({user.rankClass})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {user.isTeacher && (
                            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              Professeur
                            </span>
                          )}
                          {user.isAdmin && (
                            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleTeacher(user.id, !user.isTeacher)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            user.isTeacher
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          {user.isTeacher ? 'Retirer prof' : 'Nommer prof'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12 bg-[#12121a] rounded-xl border border-gray-800">
                <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Aucune demande en cours</p>
              </div>
            ) : (
              requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#12121a] rounded-xl border p-6 ${
                    request.status === 'pending' 
                      ? 'border-yellow-500/30' 
                      : request.status === 'approved'
                      ? 'border-green-500/30'
                      : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        request.status === 'pending' 
                          ? 'bg-yellow-500/20' 
                          : request.status === 'approved'
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}>
                        <GraduationCap className={`w-6 h-6 ${
                          request.status === 'pending' 
                            ? 'text-yellow-400' 
                            : request.status === 'approved'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{request.name}</h3>
                        <p className="text-gray-400">{request.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <School className="w-4 h-4" />
                            {request.school}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {request.subject}
                          </span>
                        </div>
                        {request.message && (
                          <p className="mt-3 text-sm text-gray-400 bg-[#1a1a2e] p-3 rounded-lg">
                            "{request.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : request.status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {request.status === 'pending' ? 'En attente' : request.status === 'approved' ? 'Approuvé' : 'Refusé'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
