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
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/class-groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
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
                Mes Classes
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

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {groups.length === 0 ? (
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
                    fetch('/api/class-groups/join', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ inviteCode: code })
                    }).then(() => fetchGroups());
                  }
                }}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-medium transition-colors"
              >
                Rejoindre avec un code
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#12121a] rounded-xl border border-gray-800 p-6 hover:border-indigo-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  {group.isPrivate && (
                    <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                      Privé
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Prof: {group.teacher.displayName || group.teacher.username}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {group._count.members} membres
                  </span>
                  <Link
                    href={`/class-groups/${group.id}`}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Voir <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
