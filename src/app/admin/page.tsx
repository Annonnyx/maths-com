'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, Crown, Medal, Save, Trash2, UserPlus, Loader2,
  Award, Zap, Target, Star, Shield
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  isCustom: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  elo: number;
  rankClass: string;
  multiplayerElo: number;
  multiplayerRankClass: string;
}

const ICON_OPTIONS = ['🏆', '🥇', '🥈', '🥉', '⭐', '💎', '👑', '🔥', '⚡', '🎯', '🛡️', '⚔️', '🎖️', '🏅', '💪', '🧠', '⚡', '🔮', '🌟', '✨'];
const CATEGORY_OPTIONS = ['rank', 'achievement', 'special', 'custom'];

export default function AdminPage() {
  const { data: session } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Badge creation
  const [badgeName, setBadgeName] = useState('');
  const [badgeDescription, setBadgeDescription] = useState('');
  const [badgeIcon, setBadgeIcon] = useState('🏆');
  const [badgeCategory, setBadgeCategory] = useState('custom');
  const [badgeColor, setBadgeColor] = useState('#FFD700');
  const [badgeRequirement, setBadgeRequirement] = useState('');
  
  // Badge awarding
  const [badges, setBadges] = useState<Badge[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedBadge, setSelectedBadge] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  
  // Elo modification
  const [myElo, setMyElo] = useState({
    elo: 400,
    rankClass: 'F-',
    multiplayerElo: 400,
    multiplayerRankClass: 'F-',
    bestElo: 400,
    bestRankClass: 'F-',
    bestMultiplayerElo: 400,
    bestMultiplayerRankClass: 'F-'
  });
  const [newElo, setNewElo] = useState('');
  const [newMultiplayerElo, setNewMultiplayerElo] = useState('');

  useEffect(() => {
    if (session?.user?.email === 'noe.barneron@gmail.com') {
      setIsAuthorized(true);
      loadData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const loadData = async () => {
    try {
      // Load badges
      const badgesRes = await fetch('/api/badges');
      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setBadges(badgesData.badges || []);
      }

      // Load users
      const usersRes = await fetch('/api/admin?action=users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // Load my Elo
      const eloRes = await fetch('/api/admin?action=my-elo');
      if (eloRes.ok) {
        const eloData = await eloRes.json();
        if (eloData.user) {
          setMyElo(eloData.user);
          setNewElo(eloData.user.elo.toString());
          setNewMultiplayerElo(eloData.user.multiplayerElo.toString());
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBadge = async () => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-badge',
          name: badgeName,
          description: badgeDescription,
          icon: badgeIcon,
          category: badgeCategory,
          color: badgeColor,
          requirement: badgeRequirement
        })
      });

      if (response.ok) {
        alert('Badge créé avec succès !');
        setBadgeName('');
        setBadgeDescription('');
        setBadgeRequirement('');
        loadData();
      } else {
        alert('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating badge:', error);
      alert('Erreur lors de la création');
    }
  };

  const awardBadge = async () => {
    if (!selectedBadge || !selectedUser) {
      alert('Sélectionne un badge et un utilisateur');
      return;
    }

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'award-badge',
          badgeId: selectedBadge,
          userId: selectedUser
        })
      });

      if (response.ok) {
        alert('Badge attribué avec succès !');
        setSelectedBadge('');
        setSelectedUser('');
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de l\'attribution');
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
      alert('Erreur lors de l\'attribution');
    }
  };

  const updateMyElo = async () => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-my-elo',
          elo: parseInt(newElo),
          multiplayerElo: parseInt(newMultiplayerElo)
        })
      });

      if (response.ok) {
        alert('Elo mis à jour !');
        loadData();
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating elo:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const deleteBadge = async (badgeId: string) => {
    if (!confirm('Supprimer ce badge ?')) return;

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-badge',
          badgeId
        })
      });

      if (response.ok) {
        alert('Badge supprimé');
        loadData();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi</h1>
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
          <p className="text-gray-400">Cette page est réservée à Ønyx</p>
          <Link href="/dashboard" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              Panel Admin - Ønyx
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Modifier mon Elo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Modifier mon Elo
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-[#1e1e2e] rounded-lg">
                  <p className="text-gray-400">Elo Solo actuel</p>
                  <p className="text-xl font-bold">{myElo.elo}</p>
                  <p className="text-sm text-purple-400">{myElo.rankClass}</p>
                </div>
                <div className="p-3 bg-[#1e1e2e] rounded-lg">
                  <p className="text-gray-400">Elo Multi actuel</p>
                  <p className="text-xl font-bold">{myElo.multiplayerElo}</p>
                  <p className="text-sm text-purple-400">{myElo.multiplayerRankClass}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Nouvel Elo Solo</label>
                <input
                  type="number"
                  value={newElo}
                  onChange={(e) => setNewElo(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Nouvel Elo Multi</label>
                <input
                  type="number"
                  value={newMultiplayerElo}
                  onChange={(e) => setNewMultiplayerElo(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white"
                />
              </div>

              <button
                onClick={updateMyElo}
                className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
              >
                Mettre à jour mon Elo
              </button>
            </div>
          </motion.div>

          {/* Créer un badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Créer un badge
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nom</label>
                <input
                  type="text"
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  placeholder="Nom du badge"
                  className="w-full px-4 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <input
                  type="text"
                  value={badgeDescription}
                  onChange={(e) => setBadgeDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full px-4 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Icône</label>
                  <select
                    value={badgeIcon}
                    onChange={(e) => setBadgeIcon(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white"
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Couleur</label>
                  <input
                    type="color"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Catégorie</label>
                <select
                  value={badgeCategory}
                  onChange={(e) => setBadgeCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Condition d&apos;obtention</label>
                <input
                  type="text"
                  value={badgeRequirement}
                  onChange={(e) => setBadgeRequirement(e.target.value)}
                  placeholder="Comment obtenir ce badge ?"
                  className="w-full px-4 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white"
                />
              </div>

              <button
                onClick={createBadge}
                disabled={!badgeName || !badgeDescription}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
              >
                Créer le badge
              </button>
            </div>
          </motion.div>

          {/* Attribuer un badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-400" />
              Attribuer un badge
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Badge</label>
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white"
                >
                  <option value="">Choisir un badge</option>
                  {badges.filter(b => b.isCustom).map(badge => (
                    <option key={badge.id} value={badge.id}>
                      {badge.icon} {badge.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Utilisateur</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1e1e2e] border border-[#3a3a4a] rounded-lg text-white"
                >
                  <option value="">Choisir un utilisateur</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.elo} Elo)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={awardBadge}
                disabled={!selectedBadge || !selectedUser}
                className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
              >
                Attribuer le badge
              </button>
            </div>
          </motion.div>

          {/* Liste des badges custom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a] md:col-span-2"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-400" />
              Badges créés ({badges.filter(b => b.isCustom).length})
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {badges.filter(b => b.isCustom).map(badge => (
                <div
                  key={badge.id}
                  className="p-4 bg-[#1e1e2e] rounded-xl border border-[#3a3a4a] flex items-center gap-3"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: badge.color }}
                  >
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{badge.name}</p>
                    <p className="text-xs text-gray-400 truncate">{badge.description}</p>
                  </div>
                  <button
                    onClick={() => deleteBadge(badge.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {badges.filter(b => b.isCustom).length === 0 && (
                <p className="text-gray-400 text-center py-8 md:col-span-3">
                  Aucun badge custom créé
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
