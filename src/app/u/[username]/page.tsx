'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Trophy, User, Medal, Target, Zap, Swords, 
  ChevronLeft, Share2, Copy, CheckCircle, Award,
  TrendingUp, Clock, BarChart3
} from 'lucide-react';
import { RANK_COLORS, RANK_BG_COLORS, RANK_CLASSES } from '@/lib/elo';

interface PublicProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  soloElo: number;
  soloRankClass: string;
  multiplayerElo: number;
  multiplayerRankClass: string;
  createdAt: string;
  stats: {
    totalTests: number;
    totalQuestions: number;
    correctAnswers: number;
    averageTime: number;
    averageScore: number;
  } | null;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: string;
  }[];
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/username/${username}/public`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Utilisateur non trouvé');
          } else {
            setError('Erreur lors du chargement du profil');
          }
          return;
        }
        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">{error || 'Profil non trouvé'}</h1>
          <p className="text-gray-400 mb-4">Cet utilisateur n&apos;existe pas ou n&apos;a pas de profil public.</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  const getRankColor = (rankClass: string) => {
    const tier = rankClass.charAt(0);
    return RANK_BG_COLORS[tier] || 'bg-gray-500/20 border-gray-500';
  };

  const getRankTextColor = (rankClass: string) => {
    const tier = rankClass.charAt(0);
    return RANK_COLORS[tier] || 'text-gray-400';
  };

  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
            <Trophy className="w-6 h-6" />
            <span className="font-bold">maths-app.com</span>
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copié !
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Partager
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {/* Banner */}
          <div className={`h-32 bg-gradient-to-r ${profile.bannerUrl?.startsWith('gradient:') ? profile.bannerUrl.replace('gradient:', '') : 'from-purple-600 to-indigo-600'} relative`}>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 relative z-10">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white border-4 border-[#12121a] shadow-lg">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  profile.username.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* Name & Rank */}
              <div className="flex-1 mb-2">
                <h1 className="text-2xl font-bold">
                  {profile.displayName || profile.username}
                </h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              
              {/* Rank Badge */}
              <div className={`px-4 py-2 rounded-xl border ${getRankColor(profile.soloRankClass)} flex items-center gap-2`}>
                <Medal className={`w-5 h-5 ${getRankTextColor(profile.soloRankClass)}`} />
                <span className={`font-bold ${getRankTextColor(profile.soloRankClass)}`}>
                  {profile.soloRankClass}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-muted rounded-xl p-4 text-center">
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{profile.soloElo}</div>
                <div className="text-xs text-muted-foreground">Elo Solo</div>
              </div>
              
              <div className="bg-muted rounded-xl p-4 text-center">
                <Swords className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{profile.multiplayerElo}</div>
                <div className="text-xs text-muted-foreground">Elo Multijoueur</div>
              </div>
              
              <div className="bg-muted rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{profile.stats?.totalTests || 0}</div>
                <div className="text-xs text-muted-foreground">Tests effectués</div>
              </div>
              
              <div className="bg-muted rounded-xl p-4 text-center">
                <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{profile.stats?.averageScore ? Math.round(profile.stats.averageScore) : 0}%</div>
                <div className="text-xs text-muted-foreground">Score moyen</div>
              </div>
            </div>

            {/* Additional Stats */}
            {profile.stats && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Statistiques détaillées
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 bg-muted rounded-lg p-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {Math.round((profile.stats.correctAnswers / Math.max(profile.stats.totalQuestions, 1)) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Précision</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-muted rounded-lg p-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{Math.round(profile.stats.averageTime)}s</div>
                      <div className="text-xs text-muted-foreground">Temps moyen</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-muted rounded-lg p-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{profile.stats.totalQuestions}</div>
                      <div className="text-xs text-muted-foreground">Questions répondues</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Badges */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Badges ({profile.badges.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge) => (
                    <div 
                      key={badge.id}
                      className="px-3 py-2 bg-muted rounded-lg flex items-center gap-2 text-sm"
                      title={badge.description}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        badge.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                        badge.tier === 'silver' ? 'bg-gray-400/20 text-gray-400' :
                        'bg-orange-600/20 text-orange-400'
                      }`}>
                        {badge.tier}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Join CTA */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl p-4 border border-indigo-500/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">Rejoins maths-app.com !</h3>
                    <p className="text-sm text-muted-foreground">Entraîne ton calcul mental et défie tes amis.</p>
                  </div>
                  <Link
                    href="/register"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition-colors whitespace-nowrap"
                  >
                    S&apos;inscrire gratuitement
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
