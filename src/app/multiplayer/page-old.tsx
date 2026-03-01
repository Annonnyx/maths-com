'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, Users, Clock, Zap, Target, Search, 
  XCircle, CheckCircle, History, Swords, UserPlus, QrCode, Copy
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { AdUnit } from '@/components/AdUnit';
import { TimeControl, GameType } from '@/lib/multiplayer';
import { TIME_CONTROLS } from '@/lib/multiplayer';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';

interface Game {
  id: string;
  player1: {
    id: string;
    username: string;
    displayName: string;
    multiplayerElo: number;
    multiplayerRankClass: string;
    isOnline: boolean;
  };
  player2?: {
    id: string;
    username: string;
    displayName: string;
    multiplayerElo: number;
    multiplayerRankClass: string;
    isOnline: boolean;
  };
  gameType: GameType;
  timeControl: TimeControl;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

interface Friend {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    isOnline: boolean;
    multiplayerElo: number;
    multiplayerRankClass: string;
  };
}

export default function MultiplayerPage() {
  const { data: session } = useSession();
  const { playSound } = useSound();
  const router = useRouter();
  
  const [game, setGame] = useState<Game | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>('blitz');
  const [selectedGameType, setSelectedGameType] = useState<GameType>('ranked');
  const [opponentFound, setOpponentFound] = useState(false);
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const [challenging, setChallenging] = useState<string | null>(null);
  
  // États pour le système Kahoot
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [gameCode, setGameCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdSession, setCreatedSession] = useState<any>(null);
  const [lobbyPlayers, setLobbyPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (session && showFriends) {
      fetchFriends();
    }
  }, [session, showFriends]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const challengeFriend = async (friendId: string) => {
    try {
      setChallenging(friendId);
      playSound('click');
      
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengedId: friendId,
          gameType: selectedGameType,
          timeControl: selectedTimeControl,
          timeLimit: TIME_CONTROLS[selectedTimeControl].timeLimit,
          questionCount: 20,
          difficulty: 'mixed'
        })
      });

      if (response.ok) {
        alert(`Défi envoyé !`);
        window.location.href = `/messages?friend=${friendId}`;
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'envoi du défi');
      }
    } catch (error) {
      console.error('Error challenging friend:', error);
      alert('Erreur lors de l\'envoi du défi');
    } finally {
      setChallenging(null);
    }
  };

  const startSearch = useCallback(async () => {
    try {
      setError('');
      setOpponentFound(false);
      setSearching(true);
      playSound('click');

      const response = await fetch('/api/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeControl: selectedTimeControl,
          gameType: selectedGameType,
          questionCount: 20
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success) {
          setGame(result.game);
          if (result.game.player2) {
            setOpponentFound(true);
            playSound('click');
            setTimeout(() => {
              window.location.href = `/multiplayer/game/${result.game.id}`;
            }, 1500);
          }
        } else {
          setError(result.error || 'Erreur lors de la recherche');
          setSearching(false);
        }
      } else {
        setError(result.error || 'Erreur lors de la recherche');
        setSearching(false);
      }
    } catch (error) {
      console.error('Error searching for game:', error);
      setError('Erreur de connexion');
      setSearching(false);
    }
  }, [selectedTimeControl, selectedGameType, playSound]);

  useEffect(() => {
    if (!game || game.status === 'finished' || opponentFound) return;

    const channel = supabase
      .channel(`game_search_${game.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'multiplayer_games',
          filter: `id=eq.${game.id}`,
        },
        (payload: any) => {
          if (payload.new.status === 'playing' && payload.new.player2Id) {
            setOpponentFound(true);
            playSound('click');
            setTimeout(() => {
              window.location.href = `/multiplayer/game/${game.id}`;
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game, opponentFound, playSound]);

  const handleCancelSearch = async () => {
    try {
      await fetch('/api/multiplayer/clean', { method: 'POST' });
      setSearching(false);
      setError('');
    } catch (error) {
      console.error('Error canceling search:', error);
      setSearching(false);
      setError('');
    }
  };

  const handleClearAllGames = async () => {
    try {
      const response = await fetch('/api/multiplayer/clear-all', { method: 'POST' });
      const result = await response.json();
      setError(`${result.message}`);
      setTimeout(() => setError(''), 5000);
    } catch (error) {
      console.error('Error during clear all:', error);
      setError('Erreur lors du nettoyage complet');
    }
  };

  // Fonctions pour le système de groupe
  const createGame = async () => {
    if (!session?.user?.id) return;
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxPlayers: 20 })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCreatedSession(data.session);
        setGameCode(data.session.code);
        
        // Générer le QR code
        const qrDataUrl = await QRCode.toDataURL(data.joinUrl);
        setQrCodeUrl(qrDataUrl);
        
        // S'abonner aux updates en temps réel du lobby
        const channel = supabase
          .channel(`game_session_${data.session.id}`)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'game_players' },
            (payload: any) => {
              if (payload.eventType === 'INSERT') {
                setLobbyPlayers(prev => [...prev, payload.new]);
              } else if (payload.eventType === 'UPDATE') {
                setLobbyPlayers(prev => 
                  prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
                );
              }
            }
          )
          .subscribe();

        playSound('click');
      } else {
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      setError('Erreur de connexion');
    } finally {
      setIsCreating(false);
    }
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    playSound('click');
  };

  const startGroupGame = async () => {
    if (!createdSession || lobbyPlayers.length < 2) return;
    
    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: createdSession.id })
      });
      
      if (response.ok) {
        window.location.href = `/multiplayer/game/${createdSession.id}`;
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  useEffect(() => {
    const handlePageLeave = () => {
      if (searching) {
        handleCancelSearch();
      }
    };
    window.addEventListener('beforeunload', handlePageLeave);
    return () => {
      window.removeEventListener('beforeunload', handlePageLeave);
      handlePageLeave();
    };
  }, [searching]);

  return (
    <div className="min-h-screen bg-background text-white">
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearAllGames}
              className="px-3 py-2 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 rounded-lg text-sm transition-colors"
            >
              <Users className="w-4 h-4" />
              Tout nettoyer
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold">{(session?.user as any)?.username || 'Joueur'}</div>
              <div className="text-xs text-muted-foreground">
                {(session?.user as any)?.multiplayerElo || 400} Elo multijoueur
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => setShowFriends(!showFriends)}
            className="w-full p-6 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl border border-green-500/30 hover:border-green-500/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Swords className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Défier un ami</h3>
                  <p className="text-sm text-muted-foreground">Envoie un défi à un ami pour jouer ensemble</p>
                </div>
              </div>
              <div className="text-green-400">{showFriends ? '▲' : '▼'}</div>
            </div>
          </button>
        </motion.div>

        <AnimatePresence>
          {showFriends && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Sélectionne un ami à défier</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {friends.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Tu n&apos;as pas encore d&apos;amis</p>
                    <Link href="/friends" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                      Ajouter des amis
                    </Link>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="p-4 flex items-center justify-between border-b border-border hover:bg-border transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {friend.user.username.charAt(0).toUpperCase()}
                          </div>
                          {friend.user.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e1e2e]" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{friend.user.displayName || friend.user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {friend.user.multiplayerElo} Elo • {friend.user.isOnline ? 'En ligne' : 'Hors ligne'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => challengeFriend(friend.user.id)}
                        disabled={challenging === friend.user.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        {challenging === friend.user.id ? <Clock className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                        Défier
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AdUnit type="inline" className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode Partie de groupe */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Partie de groupe</h2>
                  <p className="text-purple-100">Parties en direct avec code</p>
                </div>
              </div>
              
              <p className="text-purple-100 mb-6">
                Crée des parties multijoueurs en groupe avec codes d'accès uniques. 
                Parfait pour les salles de classe et les événements !
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setShowCreateGame(true)}
                  className="w-full py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  Créer une partie
                </button>
                
                <button
                  onClick={() => router.push('/multiplayer/join')}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold transition-colors"
                >
                  Rejoindre avec un code
                </button>
              </div>
            </motion.div>

            {/* Mode 1v1 existant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Swords className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Mode 1v1</h2>
                  <p className="text-blue-100">Duels classiques</p>
                </div>
              </div>
              
              <p className="text-blue-100 mb-6">
                Affronte d'autres joueurs dans des duels 1v1 chronométrés. 
                Gagne des points et améliore ton classement !
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/multiplayer/random')}
                  className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Joueur aléatoire
                </button>
                
                <button
                  onClick={() => router.push('/friends')}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
                >
                  Défier un ami
                </button>
              </div>
            </motion.div>
          </div>

        {/* Section Créer une partie de groupe */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-2xl border border-purple-500/30 p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <QrCode className="w-8 h-8 text-purple-400" />
              Créer une partie
            </h2>
            
            {!createdSession ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  Crée une partie multijoueur en groupe et invite tes amis avec le code !
                </p>
                <button
                  onClick={createGame}
                  disabled={isCreating || !session}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
                >
                  {isCreating ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-6 h-6" />
                      Créer une partie
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Code et QR Code */}
                <div className="text-center p-6 bg-card rounded-xl border border-border">
                  <h3 className="font-semibold mb-4">Code de la partie</h3>
                  <div className="text-4xl font-mono font-bold tracking-wider text-purple-400 mb-4">
                    {gameCode}
                  </div>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={copyGameCode}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copier
                    </button>
                    <a
                      href={`/multiplayer/join?code=${gameCode}`}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Rejoindre
                    </a>
                  </div>
                  
                  {qrCodeUrl && (
                    <div className="mt-4">
                      <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 mx-auto border-2 border-white rounded-lg" />
                      <p className="text-sm text-muted-foreground mt-2">Scannez pour rejoindre</p>
                    </div>
                  )}
                </div>

                {/* Lobby des joueurs */}
                <div className="p-6 bg-card rounded-xl border border-border">
                  <h3 className="font-semibold mb-4">
                    Lobby ({lobbyPlayers.length}/20 joueurs)
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {lobbyPlayers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        En attente de joueurs...
                      </p>
                    ) : (
                      lobbyPlayers.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                              {player.user?.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span>{player.user?.displayName || player.user?.username || 'Joueur'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{player.score || 0} pts</span>
                            {player.is_ready && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bouton Lancer */}
                <button
                  onClick={startGroupGame}
                  disabled={lobbyPlayers.length < 2}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
                >
                  <Zap className="w-6 h-6" />
                  {lobbyPlayers.length < 2 ? `Attendez ${2 - lobbyPlayers.length} joueur(s)...` : 'Lancer la partie'}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-gradient-to-br from-card to-muted rounded-2xl border border-border p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-400" />
              Configuration de la partie
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-3">Contrôle du temps</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(TIME_CONTROLS).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTimeControl(key as TimeControl)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTimeControl === key
                        ? 'border-primary bg-purple-500/20'
                        : 'border-[#3a3a4a] hover:border-primary/50 hover:bg-purple-500/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">{config.icon}</div>
                    <div className="font-semibold">{config.name}</div>
                    <div className="text-xs text-muted-foreground">{config.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-3">Type de partie</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedGameType('ranked')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedGameType === 'ranked'
                      ? 'border-primary bg-purple-500/20'
                      : 'border-[#3a3a4a] hover:border-primary/50 hover:bg-purple-500/10'
                  }`}
                >
                  <Trophy className="w-6 h-6 mb-2 mx-auto text-yellow-400" />
                  <div className="font-semibold">Classé</div>
                  <div className="text-xs text-muted-foreground">Elo en jeu</div>
                </button>
                <button
                  onClick={() => setSelectedGameType('friendly')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedGameType === 'friendly'
                      ? 'border-primary bg-purple-500/20'
                      : 'border-[#3a3a4a] hover:border-primary/50 hover:bg-purple-500/10'
                  }`}
                >
                  <Users className="w-6 h-6 mb-2 mx-auto text-blue-400" />
                  <div className="font-semibold">Amical</div>
                  <div className="text-xs text-muted-foreground">Pour s'entraîner</div>
                </button>
              </div>
            </div>
            <button
              onClick={startSearch}
              disabled={searching || !session}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
            >
              <Search className="w-6 h-6" />
              {searching ? 'Recherche en cours...' : 'Rechercher une partie'}
            </button>
            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <div className="flex gap-2">
                    <button onClick={handleCancelSearch} className="px-3 py-1 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-sm transition-colors">Nettoyer</button>
                    <button onClick={handleClearAllGames} className="px-3 py-1 bg-orange-500/30 hover:bg-orange-500/40 rounded-lg text-sm transition-colors">Tout nettoyer</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {searching && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-gradient-to-br from-[#1e1e2e] to-[#2a2a3a] rounded-2xl border border-[#3a3a4a] p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 border-4 border-primary/30 rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Recherche d'un adversaire...</h3>
                <p className="text-muted-foreground">{TIME_CONTROLS[selectedTimeControl].name} • {selectedGameType === 'ranked' ? 'Classé' : 'Amical'}</p>
              </div>
              <button onClick={handleCancelSearch} className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all flex items-center gap-2 mx-auto">
                <XCircle className="w-5 h-5" />
                Annuler la recherche
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {opponentFound && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 p-8 text-center">
              <div className="mb-4">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Adversaire trouvé !</h3>
                <p className="text-gray-300">Redirection vers la partie en cours...</p>
              </div>
              <div className="w-16 h-16 border-4 border-green-500/30 rounded-full border-t-transparent animate-spin mx-auto"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
