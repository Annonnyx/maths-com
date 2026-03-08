'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, ArrowRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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

export default function ClassGroupsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<ClassGroup[]>([]);
  const [myGroups, setMyGroups] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

  useEffect(() => {
    fetchGroups();
    if (session?.user) {
      fetchMyGroups();
    }
  }, [session]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/class-groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const response = await fetch('/api/class-groups/my-classes');
      if (response.ok) {
        const data = await response.json();
        setMyGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching my groups:', error);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchGroups(), session?.user ? fetchMyGroups() : Promise.resolve()]);
      setLoading(false);
    };
    
    loadAll();
  }, [session]);

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
                  onClick={() => {
                    const code = prompt('Entrez le code d\'invitation:');
                    if (code) {
                      window.location.href = `/class-join?code=${code}`;
                    }
                  }}
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
          groups.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Aucune classe publique</h2>
              <p className="text-gray-400 mb-6">
                Il n'y a pas de classe publique disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
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
                      if (group.isPrivate) {
                        const code = prompt('Cette classe est privée. Entrez le code d\'invitation:');
                        if (code) {
                          window.location.href = `/class-join?code=${code}`;
                        }
                      } else {
                        window.location.href = `/class-join?code=${group.id}`;
                      }
                    }}
                    className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
                  >
                    {group.isPrivate ? 'Rejoindre (privée)' : 'Rejoindre'}
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          groups.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Aucune classe publique</h2>
              <p className="text-gray-400 mb-6">
                Il n'y a pas de classe publique disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
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
                      if (group.isPrivate) {
                        const code = prompt('Cette classe est privée. Entrez le code d\'invitation:');
                        if (code) {
                          window.location.href = `/class-join?code=${code}`;
                        }
                      } else {
                        window.location.href = `/class-join?code=${group.id}`;
                      }
                    }}
                    className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium transition-colors"
                  >
                    {group.isPrivate ? 'Rejoindre (privée)' : 'Rejoindre'}
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
