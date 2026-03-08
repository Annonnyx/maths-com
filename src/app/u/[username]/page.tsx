'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Home, LayoutDashboard, Trophy, Users, BookOpen, 
  User, LogOut, Menu, X, Settings, Target, Bell, GraduationCap, Trash2,
  ChevronLeft, Share2, CheckCircle, Clock, TrendingUp, Award, Zap, BarChart3,
  UserPlus, Medal, Swords
} from 'lucide-react';
import { RANK_COLORS, RANK_BG_COLORS, RANK_CLASSES } from '@/lib/elo';
import { useSession } from 'next-auth/react';

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
  isTeacher: boolean;
  isAdmin: boolean;
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
  const [isFriend, setIsFriend] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  
  const { data: session } = useSession();

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
        
        // Vérifier si c'est un ami
        if (session?.user?.id) {
          checkFriendship(data.profile.id);
        }
      } catch (err) {
        setError('Erreur de connexion');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, session?.user?.id]);

  const checkFriendship = async (profileId: string) => {
    try {
      // Vérifier les amis
      const friendsResponse = await fetch('/api/friends');
      if (friendsResponse.ok) {
        const friends = await friendsResponse.json();
        // Ensure friends is an array
        const friendsArray = Array.isArray(friends) ? friends : friends?.friends || [];
        const isAlreadyFriend = friendsArray.some((friend: any) => friend?.user?.id === profileId || friend?.id === profileId);
        setIsFriend(isAlreadyFriend);
      }
      
      // Vérifier les demandes en attente
      const requestsResponse = await fetch('/api/friends/requests');
      if (requestsResponse.ok) {
        const data = await requestsResponse.json();
        const sentRequests = Array.isArray(data?.sentRequests) ? data.sentRequests : [];
        const receivedRequests = Array.isArray(data?.receivedRequests) ? data.receivedRequests : [];
        const pending = sentRequests.some((req: any) => req?.user?.id === profileId || req?.id === profileId) || 
                       receivedRequests.some((req: any) => req?.user?.id === profileId || req?.id === profileId);
        setHasPendingRequest(pending);
      }
    } catch (error) {
      console.error('Error checking friendship:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!session?.user?.id || !profile) return;
    
    setFriendLoading(true);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: profile.id })
      });
      
      if (response.ok) {
        setHasPendingRequest(true);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
    } finally {
      setFriendLoading(false);
    }
  };

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
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">
                    {profile.displayName || profile.username}
                  </h1>
                </div>
                <p className="text-muted-foreground">@{profile.username}</p>
                
                {/* Teacher Badge */}
                {profile.isTeacher && (
                  <div className="mt-2 inline-flex">
                    <div className="px-2 py-1 bg-purple-500/20 border border-purple-500 rounded-lg flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-purple-400 font-semibold">Professeur</span>
                    </div>
                  </div>
                )}
                
                {/* Admin Delete Button */}
                {(session?.user as any)?.isAdmin && session?.user?.id !== profile.id && (
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        if (!confirm(`⚠️ SUPPRESSION DE COMPTE ADMIN\n\nÊtes-vous sûr de vouloir supprimer le compte de ${profile.username} ?\n\nCette action est IRRÉVERSIBLE et supprimera :\n- Toutes les données du compte\n- L\'historique des parties\n- Les amis\n- Les badges\n- La progression\n\nToutes les données associées !\n\nPour confirmer, entrez votre mot de passe administrateur.`)) {
                          return;
                        }

                        const adminPassword = prompt('Mot de passe administrateur :');
                        if (!adminPassword) return;

                        // Call delete API
                        fetch('/api/admin/delete-user', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            userId: profile.id,
                            adminPassword 
                          })
                        }).then(async (response) => {
                          const data = await response.json();
                          if (response.ok) {
                            alert(`✅ Compte de ${profile.username} supprimé avec succès !`);
                            window.location.href = '/'; // Rediriger vers l'accueil
                          } else {
                            alert(`❌ Erreur: ${data.error || 'Échec de la suppression'}`);
                          }
                        }).catch(error => {
                          console.error('Error deleting user:', error);
                          alert('❌ Erreur réseau lors de la suppression');
                        });
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer le compte
                    </button>
                  </div>
                )}

                {/* Bouton d'amitié */}
                {session?.user?.id && session.user.id !== profile.id && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleAddFriend()}
                      disabled={friendLoading || isFriend || hasPendingRequest}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                        isFriend 
                          ? 'bg-green-600 text-white'
                          : hasPendingRequest
                            ? 'bg-yellow-600/80 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isFriend ? (
                        <>
                          <Users className="w-4 h-4" />
                          Ami
                        </>
                      ) : hasPendingRequest ? (
                        <>
                          <Clock className="w-4 h-4" />
                          Demande envoyée
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          {friendLoading ? 'Envoi...' : 'Ajouter en ami'}
                        </>
                      )}
                    </button>
                  </div>
                )}
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
                    {session ? (
                      <>
                        <h3 className="font-semibold">Prêt à défier tes amis ?</h3>
                        <p className="text-sm text-muted-foreground">Lance une partie de calcul mental et deviens le meilleur !</p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold">Rejoins maths-app.com !</h3>
                        <p className="text-sm text-muted-foreground">Entraîne ton calcul mental et défie tes amis.</p>
                      </>
                    )}
                  </div>
                  {session ? (
                    <Link
                      href="/multiplayer"
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition-colors whitespace-nowrap"
                    >
                      Jouer maintenant
                    </Link>
                  ) : (
                    <Link
                      href="/register"
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition-colors whitespace-nowrap"
                    >
                      S&apos;inscrire gratuitement
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
