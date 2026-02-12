'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, Save, Medal, Palette, Crown, Star, Award,
  Shield, Zap, Target, Trophy, Loader2
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  earnedAt?: string;
}

const BANNER_PRESETS = [
  { id: 'default', name: 'Classique', gradient: 'from-purple-600 to-indigo-600' },
  { id: 'gold', name: 'Or', gradient: 'from-yellow-500 to-orange-600' },
  { id: 'fire', name: 'Feu', gradient: 'from-red-500 to-orange-500' },
  { id: 'ocean', name: 'Océan', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'forest', name: 'Forêt', gradient: 'from-green-500 to-emerald-600' },
  { id: 'dark', name: 'Sombre', gradient: 'from-gray-700 to-gray-900' },
  { id: 'cosmic', name: 'Cosmique', gradient: 'from-indigo-500 via-purple-500 to-pink-500' },
];

export default function BannerPage() {
  const { data: session } = useSession();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [selectedBanner, setSelectedBanner] = useState('default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) {
      fetchUserBadges();
    }
  }, [session]);

  const fetchUserBadges = async () => {
    try {
      const response = await fetch(`/api/badges?userId=${session?.user?.id}`);
      if (response.ok) {
        const data = await response.json();
        const userBadges = data.badges || [];
        setBadges(userBadges.map((ub: any) => ub.badge));
        
        // Charger les badges déjà sélectionnés
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profile = await profileRes.json();
          if (profile.user?.selectedBadgeIds) {
            setSelectedBadges(JSON.parse(profile.user.selectedBadgeIds));
          }
          if (profile.user?.bannerUrl) {
            const bannerId = BANNER_PRESETS.find(b => 
              profile.user.bannerUrl.includes(b.gradient)
            )?.id || 'default';
            setSelectedBanner(bannerId);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBadge = (badgeId: string) => {
    setSelectedBadges(prev => {
      if (prev.includes(badgeId)) {
        return prev.filter(id => id !== badgeId);
      }
      if (prev.length >= 3) {
        return prev; // Maximum 3 badges
      }
      return [...prev, badgeId];
    });
  };

  const saveBanner = async () => {
    setSaving(true);
    try {
      const bannerPreset = BANNER_PRESETS.find(b => b.id === selectedBanner);
      const bannerUrl = bannerPreset ? `gradient:${bannerPreset.gradient}` : null;

      const response = await fetch('/api/badges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedBadgeIds: selectedBadges,
          bannerUrl
        })
      });

      if (response.ok) {
        alert('Bannière sauvegardée !');
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour customiser ta bannière</h1>
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

  const currentBanner = BANNER_PRESETS.find(b => b.id === selectedBanner);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Palette className="w-6 h-6" />
              Customiser ma bannière
            </h1>
          </div>
          
          <button
            onClick={saveBanner}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sauvegarder
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Aperçu de ta bannière
          </h2>
          
          <div className={`bg-gradient-to-r ${currentBanner?.gradient || 'from-purple-600 to-indigo-600'} rounded-2xl p-8 relative overflow-hidden`}>
            {/* Badges on banner */}
            <div className="absolute top-4 right-4 flex gap-2">
              {selectedBadges.map(badgeId => {
                const badge = badges.find(b => b.id === badgeId);
                if (!badge) return null;
                return (
                  <div
                    key={badge.id}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
                    style={{ backgroundColor: badge.color }}
                    title={badge.name}
                  >
                    {badge.icon}
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {session.user?.username?.charAt(0) || session.user?.email?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{session.user?.username || session.user?.email?.split('@')[0]}</h3>
                <p className="text-white/80">{selectedBadges.length}/3 badges affichés</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Banner Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Choisir l&apos;apparence
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {BANNER_PRESETS.map(banner => (
                <button
                  key={banner.id}
                  onClick={() => setSelectedBanner(banner.id)}
                  className={`p-4 rounded-xl bg-gradient-to-r ${banner.gradient} transition-all ${
                    selectedBanner === banner.id 
                      ? 'ring-2 ring-white scale-105' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <p className="font-semibold">{banner.name}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Badge Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-400" />
              Sélectionner jusqu&apos;à 3 badges ({selectedBadges.length}/3)
            </h2>
            
            {badges.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-[#1e1e2e] rounded-xl">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Tu n&apos;as pas encore de badges</p>
                <p className="text-sm mt-2">Complète des accomplissements pour en gagner !</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {badges.map(badge => (
                  <button
                    key={badge.id}
                    onClick={() => toggleBadge(badge.id)}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                      selectedBadges.includes(badge.id)
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-[#2a2a3a] bg-[#1e1e2e] hover:border-purple-500'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: badge.color }}
                    >
                      {badge.icon}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">{badge.name}</p>
                      <p className="text-sm text-gray-400">{badge.description}</p>
                    </div>
                    {selectedBadges.includes(badge.id) && (
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
