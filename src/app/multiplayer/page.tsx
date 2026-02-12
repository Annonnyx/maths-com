'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Trophy, Users, Clock, Zap, Target, Search, 
  XCircle, CheckCircle, History, Swords, UserPlus
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { AdUnit } from '@/components/AdUnit';
import { TimeControl, GameType } from '@/lib/multiplayer';
import { TIME_CONTROLS } from '@/lib/multiplayer';

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
  
  const [game, setGame] = useState<Game | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>('blitz');
  const [selectedGameType, setSelectedGameType] = useState<GameType>('ranked');
  const [opponentFound, setOpponentFound] = useState(false);
  
  // Friends challenge state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const [challenging, setChallenging] = useState<string | null>(null);

  // Fetch friends when showing friends section
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

      console.log('Starting search with:', { selectedTimeControl, selectedGameType });

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
      console.log('Search response:', result);

      if (response.ok) {
        if (result.success) {
          console.log('Game created/joined:', result.game);
          setGame(result.game);
          
          // Check if game already has opponent
          if (result.game.player2) {
            console.log('Opponent already in game!');
            setOpponentFound(true);
            playSound('click');
            setTimeout(() => {
              window.location.href = `/multiplayer/game/${result.game.id}`;
            }, 1500);
          } else {
            console.log('Waiting for opponent...');
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
  }, [selectedTimeControl, selectedGameType]);

  // Poll for game updates
  useEffect(() => {
    if (!game || game.status === 'finished') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/multiplayer/game/${game.id}`);
        const gameData = await response.json();

        if (response.ok && gameData.status === 'playing' && gameData.player2) {
          console.log('Opponent found! Player2:', gameData.player2);
          setOpponentFound(true);
          playSound('click');
          setTimeout(() => {
            window.location.href = `/multiplayer/game/${game.id}`;
          }, 1000);
        }
      } catch (error) {
        console.error('Error polling game:', error);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [game]);

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

  // Cleanup on unmount or page leave
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
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Challenge Friend Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
              <div className="text-green-400">
                {showFriends ? '▲' : '▼'}
              </div>
            </div>
          </button>
        </motion.div>

        {/* Friends List */}
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
                        {challenging === friend.user.id ? (
                          <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                          <Swords className="w-4 h-4" />
                        )}
                        Défier
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline Ad */}
        <AdUnit type="inline" className="my-6" />

        {/* Game Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-card to-muted rounded-2xl border border-border p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-400" />
              Configuration de la partie
            </h2>

            {/* Time Control Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-3">
                Contrôle du temps
              </label>
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

            {/* Game Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-3">
                Type de partie
              </label>
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

            {/* Start Search Button */}
            <button
              onClick={startSearch}
              disabled={searching || !session}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
            >
              <Search className="w-6 h-6" />
              {searching ? 'Recherche en cours...' : 'Rechercher une partie'}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelSearch}
                      className="px-3 py-1 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-sm transition-colors"
                    >
                      Nettoyer
                    </button>
                    <button
                      onClick={handleClearAllGames}
                      className="px-3 py-1 bg-orange-500/30 hover:bg-orange-500/40 rounded-lg text-sm transition-colors"
                    >
                      Tout nettoyer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Searching State */}
        <AnimatePresence>
          {searching && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-[#1e1e2e] to-[#2a2a3a] rounded-2xl border border-[#3a3a4a] p-8 text-center"
            >
              <div className="mb-6">
                <div className="w-16 h-16 border-4 border-primary/30 rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Recherche d'un adversaire...</h3>
                <p className="text-muted-foreground">
                  {TIME_CONTROLS[selectedTimeControl].name} • {selectedGameType === 'ranked' ? 'Classé' : 'Amical'}
                </p>
              </div>
              <button
                onClick={handleCancelSearch}
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
              >
                <XCircle className="w-5 h-5" />
                Annuler la recherche
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opponent Found */}
        <AnimatePresence>
          {opponentFound && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 p-8 text-center"
            >
              <div className="mb-4">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Adversaire trouvé !</h3>
                <p className="text-gray-300">
                  Redirection vers la partie en cours...
                </p>
              </div>
              <div className="w-16 h-16 border-4 border-green-500/30 rounded-full border-t-transparent animate-spin mx-auto"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
