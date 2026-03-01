'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trophy, Users, Clock, Zap, Target, Search, 
  XCircle, CheckCircle, History, Swords, UserPlus, QrCode, Copy,
  Play, Settings, Shield
} from 'lucide-react';
import { useSound } from '@/components/SoundProvider';
import { AdUnit } from '@/components/AdUnit';
import LoadingTips from '@/components/LoadingTips';
import { GameMode, TimeControl, CreateGameConfig, UnifiedGameSession, GAME_MODE_CONFIGS, TIME_CONTROL_CONFIGS } from '@/types/unified-multiplayer';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';

interface Friend {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    multiplayerElo: number;
    multiplayerRankClass: string;
    isOnline: boolean;
  };
}

export default function MultiplayerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { playSound } = useSound();

  // État principal
  const [selectedMode, setSelectedMode] = useState<GameMode>('group_quiz');
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>('blitz');
  const [showFriends, setShowFriends] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // État création partie groupe
  const [isCreating, setIsCreating] = useState(false);
  const [createdSession, setCreatedSession] = useState<UnifiedGameSession | null>(null);
  const [gameCode, setGameCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [lobbyPlayers, setLobbyPlayers] = useState<any[]>([]);

  // État recherche 1v1
  const [searching, setSearching] = useState(false);
  const [opponentFound, setOpponentFound] = useState(false);
  const [game, setGame] = useState<UnifiedGameSession | null>(null);
  const [error, setError] = useState('');

  // Options de jeu
  const [timePerQuestion, setTimePerQuestion] = useState(10);
  const [questionCount, setQuestionCount] = useState(20);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [joinCode, setJoinCode] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Charger les amis
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const response = await fetch('/api/friends');
        const data = await response.json();
        setFriends(data.friends || []);
      } catch (error) {
        console.error('Error loading friends:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFriends();
  }, []);

  // Défier un ami
  const challengeFriend = async (friendId: string) => {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengedId: friendId,
          gameType: selectedMode === 'ranked_1v1' ? 'ranked' : 'friendly',
          timeControl: selectedTimeControl,
          timeLimit: TIME_CONTROL_CONFIGS[selectedTimeControl].timeLimit,
          questionCount,
          difficulty
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
    }
  };

  // Créer une partie groupe
  const createGroupGame = async () => {
    if (!session?.user?.id) return;
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameMode: 'group_quiz',
          maxPlayers: 30,
          questionCount,
          difficulty,
          timePerQuestion
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCreatedSession(data.session);
        setGameCode(data.session.joinCode);
        
        // Générer le QR code
        const qrDataUrl = await QRCode.toDataURL(data.joinUrl);
        setQrCodeUrl(qrDataUrl);
        
        // Ouvrir automatiquement la modal QR
        setShowQrModal(true);
        
        // S'abonner aux updates du lobby
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

  // Rejoindre avec un code
  const joinWithCode = async () => {
    if (!joinCode.trim()) return;
    
    try {
      const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.href = `/multiplayer/game/${data.session.id}`;
      } else {
        setError(data.error || 'Code invalide');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      setError('Erreur de connexion');
    }
  };

  // Démarrer la recherche 1v1
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
          gameType: selectedMode === 'ranked_1v1' ? 'ranked' : 'friendly',
          timeControl: selectedTimeControl,
          questionCount,
          difficulty
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success) {
          setGame(result.game);
          if (result.game.player2Id) {
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
  }, [selectedMode, selectedTimeControl, questionCount, difficulty, playSound]);

  // Copier le code de partie
  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    playSound('click');
  };

  // Démarrer la partie groupe
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

  return (
    <div className="min-h-screen bg-background text-white">
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Multijoueur</h1>
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
        {/* SECTION 1 - Choix du mode */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold mb-6 text-center">Choisis ton mode de jeu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode 1v1 */}
            <motion.button
              onClick={() => {
                setSelectedMode('ranked_1v1');
                // Reset lobby state when switching modes (BUG 10)
                setCreatedSession(null);
                setGameCode('');
                setQrCodeUrl('');
                setLobbyPlayers([]);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-8 rounded-2xl border-2 transition-all ${
                selectedMode.startsWith('ranked_1v1') || selectedMode === 'casual_1v1'
                  ? 'border-primary bg-blue-500/20'
                  : 'border-[#3a3a4a] hover:border-primary/50 hover:bg-blue-500/10'
              }`}
            >
              <div className="text-center">
                <Swords className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-xl font-bold mb-2">1 vs 1</h3>
                <p className="text-sm text-muted-foreground mb-4">Duels intenses (2 joueurs)</p>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <Shield className="w-4 h-4" />
                  <span>ELO ranked disponible</span>
                </div>
              </div>
            </motion.button>

            {/* Mode Groupe */}
            <motion.button
              onClick={() => setSelectedMode('group_quiz')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-8 rounded-2xl border-2 transition-all ${
                selectedMode === 'group_quiz'
                  ? 'border-primary bg-purple-500/20'
                  : 'border-[#3a3a4a] hover:border-primary/50 hover:bg-purple-500/10'
              }`}
            >
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-bold mb-2">Partie de groupe</h3>
                <p className="text-sm text-muted-foreground mb-4">Quiz multijoueur (3-30 joueurs)</p>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <QrCode className="w-4 h-4" />
                  <span>Code d'accès + QR</span>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* SECTION 2 - Options selon le mode */}
        <AnimatePresence mode="wait">
          {selectedMode.startsWith('ranked_1v1') || selectedMode === 'casual_1v1' ? (
            <motion.div
              key="1v1-options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl border border-blue-500/30 p-8"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-400" />
                Configuration 1v1
              </h3>
              
              {/* Type de partie */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-3">Type de partie</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedMode('ranked_1v1')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMode === 'ranked_1v1'
                        ? 'border-primary bg-blue-500/20'
                        : 'border-[#3a3a4a] hover:border-primary/50 hover:bg-blue-500/10'
                    }`}
                  >
                    <Trophy className="w-6 h-6 mb-2 mx-auto text-yellow-400" />
                    <div className="font-semibold">Classé</div>
                    <div className="text-xs text-muted-foreground">Elo en jeu</div>
                  </button>
                  <button
                    onClick={() => setSelectedMode('casual_1v1')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMode === 'casual_1v1'
                        ? 'border-primary bg-blue-500/20'
                        : 'border-[#3a3a4a] hover:border-primary/50 hover:bg-blue-500/10'
                    }`}
                  >
                    <Users className="w-6 h-6 mb-2 mx-auto text-blue-400" />
                    <div className="font-semibold">Amical</div>
                    <div className="text-xs text-muted-foreground">Pour s'entraîner</div>
                  </button>
                </div>
              </div>

              {/* Contrôle du temps */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-3">Contrôle du temps</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(TIME_CONTROL_CONFIGS).filter(([key]) => key !== 'custom').map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTimeControl(key as TimeControl)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedTimeControl === key
                          ? 'border-primary bg-blue-500/20'
                          : 'border-[#3a3a4a] hover:border-primary/50 hover:bg-blue-500/10'
                      }`}
                    >
                      <div className="text-lg mb-1">{config.name}</div>
                      <div className="text-xs text-muted-foreground">{config.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <button
                  onClick={startSearch}
                  disabled={searching || !session}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
                >
                  <Search className="w-6 h-6" />
                  {searching ? 'Recherche en cours...' : 'Trouver un adversaire'}
                </button>
                
                <button
                  onClick={() => setShowFriends(!showFriends)}
                  className="w-full py-3 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Défier un ami
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="group-options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-2xl border border-purple-500/30 p-8"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6 text-purple-400" />
                Configuration partie de groupe
              </h3>
              
              {/* Temps par question */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-3">Temps par question</label>
                <div className="grid grid-cols-4 gap-3">
                  {[5, 10, 20, 30].map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimePerQuestion(time)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        timePerQuestion === time
                          ? 'border-primary bg-purple-500/20'
                          : 'border-[#3a3a4a] hover:border-primary/50 hover:bg-purple-500/10'
                      }`}
                    >
                      <div className="font-semibold">{time}s</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre de questions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-3">Nombre de questions</label>
                <div className="grid grid-cols-4 gap-3">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        questionCount === count
                          ? 'border-primary bg-purple-500/20'
                          : 'border-[#3a3a4a] hover:border-primary/50 hover:bg-purple-500/10'
                      }`}
                    >
                      <div className="font-semibold">{count}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Création ou rejoindre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={createGroupGame}
                  disabled={isCreating || !session}
                  className="py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  {isCreating ? 'Création...' : 'Créer la partie'}
                </button>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Code 6 lettres"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4a] rounded-xl text-white placeholder-[#6a6a7a] focus:outline-none focus:border-primary"
                    maxLength={6}
                  />
                  <button
                    onClick={joinWithCode}
                    disabled={!joinCode.trim()}
                    className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl font-semibold transition-colors"
                  >
                    Rejoindre
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 3 - Lobby (si partie créée) */}
        <AnimatePresence>
          {createdSession && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-2xl border border-purple-500/30 p-8"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-400" />
                Lobby de la partie
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code et QR */}
                <div className="text-center p-6 bg-card rounded-xl border border-border">
                  <h4 className="font-semibold mb-4">Code de la partie</h4>
                  <div className="text-3xl font-mono font-bold tracking-wider text-purple-400 mb-4">
                    {gameCode}
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <button
                      onClick={copyGameCode}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copier
                    </button>
                  </div>
                  
                  {qrCodeUrl && (
                    <div>
                      <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 mx-auto border-2 border-white rounded-lg" />
                      <p className="text-xs text-muted-foreground mt-2">Scannez pour rejoindre</p>
                    </div>
                  )}
                </div>

                {/* Liste des joueurs */}
                <div className="p-6 bg-card rounded-xl border border-border">
                  <h4 className="font-semibold mb-4">
                    Joueurs ({lobbyPlayers.length}/30)
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {lobbyPlayers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        En attente de joueurs...
                      </p>
                    ) : (
                      lobbyPlayers.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                              {player.user?.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="text-sm">{player.user?.displayName || player.user?.username || 'Joueur'}</span>
                          </div>
                          {player.is_ready && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bouton lancer */}
              <button
                onClick={startGroupGame}
                disabled={lobbyPlayers.length < 2}
                className="w-full mt-6 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                {lobbyPlayers.length < 2 ? `Attendez ${2 - lobbyPlayers.length} joueur(s)...` : 'Lancer la partie'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 4 - Défis d'amis */}
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
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <Swords className="w-4 h-4" />
                        Défier
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300"
          >
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Messages de recherche */}
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
                  {TIME_CONTROL_CONFIGS[selectedTimeControl].name} • {selectedMode === 'ranked_1v1' ? 'Classé' : 'Amical'}
                </p>
                {/* Loading Tips */}
                <LoadingTips isLoading={searching} className="mt-6" />
              </div>
              <button
                onClick={() => setSearching(false)}
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all flex items-center gap-2 mx-auto"
              >
                <XCircle className="w-5 h-5" />
                Annuler la recherche
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Modal - Fullscreen */}
        <AnimatePresence>
          {showQrModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-2xl border border-border p-8 max-w-lg w-full text-center"
              >
                <h2 className="text-2xl font-bold mb-2">Rejoindre la partie</h2>
                <p className="text-muted-foreground mb-6">Montre cet écran à tes joueurs</p>
                
                {/* Code en grand */}
                <div className="text-6xl font-mono font-bold text-purple-400 tracking-wider mb-6">
                  {gameCode}
                </div>
                
                {/* Bouton copie */}
                <button
                  onClick={copyGameCode}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto mb-6"
                >
                  <Copy className="w-5 h-5" />
                  Copier le code
                </button>
                
                {/* QR Code en grand */}
                {qrCodeUrl && (
                  <div className="mb-6">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-[300px] h-[300px] mx-auto border-4 border-white rounded-xl" 
                    />
                    <p className="text-sm text-muted-foreground mt-3">Scanne pour rejoindre</p>
                  </div>
                )}
                
                {/* Bouton fermer */}
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-6 py-3 bg-border hover:bg-muted text-white rounded-xl font-semibold transition-colors"
                >
                  Fermer
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ad */}
        <AdUnit type="inline" className="my-6" />
      </main>
    </div>
  );
}
