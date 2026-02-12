'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Download, Users, ArrowLeft, Crown, Medal, Save, Trash2, UserPlus, Loader2,
  Award, Zap, Target, Star, Shield, Upload, Image, Edit2, Eye, EyeOff, Gift
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

interface CustomBanner {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  _count: {
    users: number;
  };
}

const ICON_OPTIONS = ['🏆', '🥇', '🥈', '🥉', '⭐', '💎', '👑', '🔥', '⚡', '🎯', '🛡️', '⚔️', '🎖️', '🏅', '💪', '🧠', '🔮', '🌟', '✨'];
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

  // Banner management
  const [banners, setBanners] = useState<CustomBanner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [bannerFormData, setBannerFormData] = useState({
    name: '',
    description: '',
    isPremium: false
  });

  // User list
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    console.log('Admin page - Session:', session);
    console.log('Admin page - User email:', session?.user?.email);
    if (session?.user?.email === 'noe.barneron@gmail.com') {
      setIsAuthorized(true);
      loadData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const loadData = async () => {
    try {
      console.log('Loading admin data...');
      // Load badges
      const badgesRes = await fetch('/api/badges', { credentials: 'include' });
      console.log('Badges API status:', badgesRes.status);
      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        setBadges(badgesData.badges || []);
      } else {
        const error = await badgesRes.json();
        console.error('Badges API error:', error);
      }

      // Load users
      const usersRes = await fetch('/api/admin?action=users', { credentials: 'include' });
      console.log('Users API status:', usersRes.status);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      } else {
        const error = await usersRes.json();
        console.error('Users API error:', error);
      }

      // Load my Elo
      const eloRes = await fetch('/api/admin?action=my-elo', { credentials: 'include' });
      console.log('Elo API status:', eloRes.status);
      if (eloRes.ok) {
        const eloData = await eloRes.json();
        if (eloData.user) {
          setMyElo(eloData.user);
          setNewElo(eloData.user.elo.toString());
          setNewMultiplayerElo(eloData.user.multiplayerElo.toString());
        }
      } else {
        const error = await eloRes.json();
        console.error('Elo API error:', error);
      }

      // Load banners
      const bannersRes = await fetch('/api/admin/banners', { credentials: 'include' });
      console.log('Banners API status:', bannersRes.status);
      if (bannersRes.ok) {
        const bannersData = await bannersRes.json();
        setBanners(bannersData.banners || []);
      } else {
        const error = await bannersRes.json();
        console.error('Banners API error:', error);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBadge = async () => {
    try {
      console.log('Creating badge:', { name: badgeName, description: badgeDescription });
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

      const data = await response.json();
      console.log('Create badge response:', data);

      if (response.ok) {
        alert('Badge créé avec succès !');
        setBadgeName('');
        setBadgeDescription('');
        setBadgeRequirement('');
        loadData();
      } else {
        alert('Erreur: ' + (data.error || 'Erreur lors de la création'));
      }
    } catch (error) {
      console.error('Error creating badge:', error);
      alert('Erreur réseau lors de la création');
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
        credentials: 'include',
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
      console.log('Updating Elo:', { elo: newElo, multiplayerElo: newMultiplayerElo });
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update-my-elo',
          elo: parseInt(newElo),
          multiplayerElo: parseInt(newMultiplayerElo)
        })
      });

      const data = await response.json();
      console.log('Elo update response:', data);

      if (response.ok) {
        alert('Elo mis à jour !');
        loadData();
      } else {
        alert('Erreur: ' + (data.error || 'Erreur lors de la mise à jour'));
      }
    } catch (error) {
      console.error('Error updating elo:', error);
      alert('Erreur réseau lors de la mise à jour');
    }
  };

  const deleteBadge = async (badgeId: string) => {
    if (!confirm('Supprimer ce badge ?')) return;

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  // Banner functions
  const handleBannerUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const form = e.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      alert('Veuillez sélectionner une image');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', bannerFormData.name);
    formData.append('description', bannerFormData.description);
    formData.append('isPremium', bannerFormData.isPremium.toString());

    try {
      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setBanners(prev => [data.banner, ...prev]);
        setBannerFormData({ name: '', description: '', isPremium: false });
        form.reset();
        alert('Bannière uploadée avec succès !');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const toggleBannerStatus = async (bannerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/banners?id=${bannerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        const data = await response.json();
        setBanners(prev => prev.map(b => b.id === bannerId ? data.banner : b));
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (!confirm('Supprimer cette bannière ?')) return;

    try {
      const response = await fetch(`/api/admin/banners?id=${bannerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setBanners(prev => prev.filter(b => b.id !== bannerId));
        alert('Bannière supprimée');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-foreground flex items-center justify-center">
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
      <div className="min-h-screen bg-[#0a0a0f] text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-foreground flex items-center justify-center">
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
    <div className="min-h-screen bg-[#0a0a0f] text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
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
            className="p-6 bg-[#12121a] rounded-2xl border border-border"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Modifier mon Elo
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-card rounded-lg">
                  <p className="text-gray-400">Elo Solo actuel</p>
                  <p className="text-xl font-bold">{myElo.elo}</p>
                  <p className="text-sm text-purple-400">{myElo.rankClass}</p>
                </div>
                <div className="p-3 bg-card rounded-lg">
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
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Nouvel Elo Multi</label>
                <input
                  type="number"
                  value={newMultiplayerElo}
                  onChange={(e) => setNewMultiplayerElo(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground"
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
            className="p-6 bg-[#12121a] rounded-2xl border border-border"
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
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <input
                  type="text"
                  value={badgeDescription}
                  onChange={(e) => setBadgeDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Icône</label>
                  <select
                    value={badgeIcon}
                    onChange={(e) => setBadgeIcon(e.target.value)}
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground"
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
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground"
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
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground"
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
            className="p-6 bg-[#12121a] rounded-2xl border border-border"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-400" />
              Attribuer un badge
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Badge (tous les badges)</label>
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground"
                >
                  <option value="">Choisir un badge</option>
                  <optgroup label="Rang (Classes)">
                    {badges.filter(b => b.category === 'rank').map(badge => (
                      <option key={badge.id} value={badge.id}>
                        {badge.icon} {badge.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Succès">
                    {badges.filter(b => b.category === 'achievement').map(badge => (
                      <option key={badge.id} value={badge.id}>
                        {badge.icon} {badge.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Custom">
                    {badges.filter(b => b.category === 'custom').map(badge => (
                      <option key={badge.id} value={badge.id}>
                        {badge.icon} {badge.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Spécial (Top 1)">
                    {badges.filter(b => b.category === 'special').map(badge => (
                      <option key={badge.id} value={badge.id}>
                        {badge.icon} {badge.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Utilisateur</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground"
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

          {/* Liste de tous les badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-[#12121a] rounded-2xl border border-border md:col-span-2"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-400" />
              Tous les badges ({badges.length})
            </h2>
            
            <div className="space-y-4">
              {/* Sync Button - Always visible */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={async () => {
                    if (!confirm('⚠️ Cette action va SUPPRIMER TOUS les badges de rang et les recréer proprement. Continuer ?')) return;
                    try {
                      const res = await fetch('/api/admin/cleanup-badges', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      if (res.ok) {
                        const data = await res.json();
                        alert(`🧹 NETTOYAGE COMPLET\n\n${data.deletedBadges} badges supprimés\n${data.deletedUserBadges} attributions supprimées\n${data.createdBadges} badges recréés\n${data.assignedToUsers} badges réattribués`);
                        loadData();
                      } else {
                        const err = await res.json();
                        alert('Erreur: ' + (err.details || 'Nettoyage échoué'));
                      }
                    } catch (e) {
                      alert('Erreur réseau');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors text-sm"
                >
                  🧹 Nettoyage TOTAL (supprime tout et recrée)
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/init-badges', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      if (res.ok) {
                        const data = await res.json();
                        alert(`${data.totalBadges} badges synchronisés !\n${data.rankBadgesAwarded} badges de rang attribués\n${data.rankBadgesRemoved} badges retirés`);
                        loadData();
                      } else {
                        alert('Erreur lors de la synchronisation');
                      }
                    } catch (e) {
                      alert('Erreur réseau');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm"
                >
                  🔄 Synchroniser tous les badges
                </button>
              </div>

              {/* Badges de Rang */}
              {badges.filter(b => b.category === 'rank').length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Classes (Rang)</h3>
                  <div className="grid md:grid-cols-4 gap-3">
                    {badges.filter(b => b.category === 'rank').map(badge => (
                      <div
                        key={badge.id}
                        className="p-3 bg-card rounded-xl border border-border flex items-center gap-2"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: badge.color }}
                        >
                          {badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{badge.name}</p>
                          <p className="text-xs text-gray-400 truncate">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges de Succès */}
              {badges.filter(b => b.category === 'achievement').length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Succès</h3>
                  <div className="grid md:grid-cols-4 gap-3">
                    {badges.filter(b => b.category === 'achievement').map(badge => (
                      <div
                        key={badge.id}
                        className="p-3 bg-card rounded-xl border border-border flex items-center gap-2"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: badge.color }}
                        >
                          {badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{badge.name}</p>
                          <p className="text-xs text-gray-400 truncate">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges Spéciaux (Top 1, etc) */}
              {badges.filter(b => b.category === 'special').length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Spécial (Top 1)</h3>
                  <div className="grid md:grid-cols-4 gap-3">
                    {badges.filter(b => b.category === 'special').map(badge => (
                      <div
                        key={badge.id}
                        className="p-3 bg-card rounded-xl border border-border flex items-center gap-2"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: badge.color }}
                        >
                          {badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{badge.name}</p>
                          <p className="text-xs text-gray-400 truncate">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges Custom (supprimables) */}
              {badges.filter(b => b.category === 'custom').length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Badges Custom (créés par toi)</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {badges.filter(b => b.category === 'custom').map(badge => (
                      <div
                        key={badge.id}
                        className="p-4 bg-card rounded-xl border border-border flex items-center gap-3"
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
                  </div>
                </div>
              )}
              
              {badges.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    Aucun badge dans le système - clique ci-dessous pour initialiser
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/admin/init-badges', {
                          method: 'POST',
                          credentials: 'include'
                        });
                        if (res.ok) {
                          const data = await res.json();
                          alert(`${data.totalBadges} badges initialisés !`);
                          loadData();
                        } else {
                          alert('Erreur lors de l\'initialisation');
                        }
                      } catch (e) {
                        alert('Erreur réseau');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                  >
                    Initialiser les badges (Rangs + Succès + Top 1)
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Gestion des Bannières */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-[#12121a] rounded-2xl border border-border md:col-span-2"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-400" />
              Gestion des Bannières ({banners.length})
            </h2>
            
            {/* Upload Form */}
            <div className="mb-6 p-4 bg-card rounded-xl border border-border">
              <h3 className="font-medium mb-3">Uploader une nouvelle bannière</h3>
              <form onSubmit={handleBannerUpload} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={bannerFormData.name}
                      onChange={(e) => setBannerFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom de la bannière"
                      required
                      className="w-full px-3 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={bannerFormData.description}
                      onChange={(e) => setBannerFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description (optionnel)"
                      className="w-full px-3 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    className="flex-1 px-3 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground text-sm"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={bannerFormData.isPremium}
                      onChange={(e) => setBannerFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    Premium
                  </label>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-semibold text-sm transition-colors"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload
                  </button>
                </div>
              </form>
            </div>

            {/* Give Banner to User */}
            <div className="mb-6 p-4 bg-card rounded-xl border border-border">
              <h3 className="font-medium mb-3 text-yellow-400 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Donner une bannière à un utilisateur
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <select
                  id="giveBannerUser"
                  className="px-3 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground text-sm"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                  ))}
                </select>
                <select
                  id="giveBannerSelect"
                  className="px-3 py-2 bg-[#2a2a3a] border border-border rounded-lg text-foreground text-sm"
                >
                  <option value="">Sélectionner une bannière</option>
                  {banners.map(b => (
                    <option key={b.id} value={b.imageUrl}>
                      {b.name} {b.isPremium ? '(Premium)' : '(Gratuit)'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    const userId = (document.getElementById('giveBannerUser') as HTMLSelectElement)?.value;
                    const bannerUrl = (document.getElementById('giveBannerSelect') as HTMLSelectElement)?.value;
                    
                    if (!userId || !bannerUrl) {
                      alert('Veuillez sélectionner un utilisateur et une bannière');
                      return;
                    }
                    
                    try {
                      const res = await fetch('/api/admin/give-banner', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, bannerUrl })
                      });
                      
                      if (res.ok) {
                        const data = await res.json();
                        alert(data.message);
                      } else {
                        const err = await res.json();
                        alert('Erreur: ' + (err.error || 'Échec'));
                      }
                    } catch (e) {
                      alert('Erreur réseau');
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold text-sm transition-colors"
                >
                  Donner la bannière
                </button>
              </div>
            </div>

            {/* Banners Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  {/* Banner Preview */}
                  <div className="relative h-32 bg-gradient-to-br from-purple-900/50 to-indigo-900/50">
                    <img
                      src={banner.thumbnailUrl || banner.imageUrl}
                      alt={banner.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {banner.isPremium && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                          Premium
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        banner.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Banner Info */}
                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-1">{banner.name}</h4>
                    {banner.description && (
                      <p className="text-xs text-gray-400 mb-2">{banner.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{banner._count?.users ?? 0} utilisateurs</span>
                      <span>{new Date(banner.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleBannerStatus(banner.id, !banner.isActive)}
                        className="px-2 py-1 bg-gray-600/20 hover:bg-gray-600/30 rounded transition-colors"
                      >
                        {banner.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {banners.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune bannière uploadée</p>
                <p className="text-sm">Commence par uploader ta première bannière personnalisée</p>
              </div>
            )}
          </motion.div>

          {/* Liste des utilisateurs avec export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-[#12121a] rounded-2xl border border-border md:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Liste des utilisateurs ({users.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className="px-4 py-2 bg-card hover:bg-[#2a2a3a] border border-border rounded-lg text-sm transition-colors"
                >
                  {showUserList ? 'Masquer' : 'Afficher'} la liste
                </button>
                <button
                  onClick={() => {
                    // Export to CSV
                    const csvContent = [
                      ['ID', 'Username', 'Email', 'Display Name', 'Elo Solo', 'Classe Solo', 'Elo Multi', 'Classe Multi'].join(','),
                      ...users.map(u => [
                        u.id,
                        u.username,
                        u.email,
                        u.displayName || '',
                        u.elo,
                        u.rankClass,
                        u.multiplayerElo,
                        u.multiplayerRankClass
                      ].join(','))
                    ].join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter CSV
                </button>
              </div>
            </div>

            {showUserList && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-gray-400">Username</th>
                      <th className="text-left p-2 text-gray-400">Email</th>
                      <th className="text-left p-2 text-gray-400">Elo Solo</th>
                      <th className="text-left p-2 text-gray-400">Classe</th>
                      <th className="text-left p-2 text-gray-400">Elo Multi</th>
                      <th className="text-left p-2 text-gray-400">Classe Multi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-[#1e1e2e] hover:bg-card">
                        <td className="p-2 font-medium">{user.username}</td>
                        <td className="p-2 text-gray-400">{user.email}</td>
                        <td className="p-2">{user.elo}</td>
                        <td className="p-2 text-purple-400">{user.rankClass}</td>
                        <td className="p-2">{user.multiplayerElo}</td>
                        <td className="p-2 text-purple-400">{user.multiplayerRankClass}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
