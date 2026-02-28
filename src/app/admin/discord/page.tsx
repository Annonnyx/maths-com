'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { isAdminSession } from '@/lib/admin-auth';
import { 
  MessageSquare, 
  Trophy, 
  Send, 
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Hash,
  ArrowLeft,
  Shield,
  Users,
  Crown,
  Power,
  Bot,
  Play,
  Square
} from 'lucide-react';

interface DiscordStatus {
  status: 'online' | 'offline';
  guilds: number;
  users: number;
}

export default function DiscordAdminPage() {
  const { data: session } = useSession();
  const [botStatus, setBotStatus] = useState<DiscordStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [botLoading, setBotLoading] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [messageType, setMessageType] = useState<'announcement' | 'leaderboard'>('announcement');
  const [result, setResult] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Charger le statut du bot
  useEffect(() => {
    fetchBotStatus();
  }, []);

  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/admin/discord');
      const data = await response.json();
      if (data.botStatus) {
        setBotStatus(data.botStatus);
      }
    } catch (error) {
      console.error('Error fetching bot status:', error);
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!messageContent.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/admin/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          channelId: selectedChannel === 'general' 
            ? process.env.NEXT_PUBLIC_DISCORD_GENERAL_CHANNEL 
            : process.env.NEXT_PUBLIC_DISCORD_ANNOUNCEMENTS_CHANNEL,
          content: messageContent,
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({ type: 'success', message: 'Message envoyé avec succès !' });
        setMessageContent('');
      } else {
        setResult({ type: 'error', message: data.error || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Erreur de connexion au bot' });
    } finally {
      setLoading(false);
    }
  };

  // Publier le classement
  const publishLeaderboard = async (type: 'solo' | 'multi') => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/admin/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish-leaderboard',
          type,
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({ type: 'success', message: `Classement ${type} publié !` });
      } else {
        setResult({ type: 'error', message: data.error || 'Erreur lors de la publication' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Erreur de connexion au bot' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartBot = async () => {
    setBotLoading(true);
    try {
      const response = await fetch('/api/admin/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start-bot' }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({ type: 'success', message: 'Bot démarré avec succès !' });
        fetchBotStatus(); // Rafraîchir le statut
      } else {
        setResult({ type: 'error', message: data.error || 'Erreur lors du démarrage du bot' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Erreur de connexion au service bot' });
    } finally {
      setBotLoading(false);
    }
  };

  const handleStopBot = async () => {
    setBotLoading(true);
    try {
      const response = await fetch('/api/admin/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop-bot' }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({ type: 'success', message: 'Bot arrêté avec succès !' });
        fetchBotStatus(); // Rafraîchir le statut
      } else {
        setResult({ type: 'error', message: data.error || 'Erreur lors de l\'arrêt du bot' });
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Erreur de connexion au service bot' });
    } finally {
      setBotLoading(false);
    }
  };

  if (!isAdminSession(session)) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Accès refusé</h1>
          <p className="text-gray-400 mt-2">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour Admin</span>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" />
              Bot Discord
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/admin" 
              className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Général
            </Link>
            <Link 
              href="/admin/teachers" 
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Professeurs
            </Link>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-400" />
            Panel Discord Admin
          </h1>
          <p className="text-gray-400">
            Gérez le bot Discord et la communauté Maths-App
          </p>
        </motion.div>

        {/* Statut du Bot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12121a] rounded-xl p-6 mb-8 border border-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 ${botStatus?.status === 'online' ? 'text-green-400' : 'text-red-400'}`} />
            Statut du Bot
            <div className="ml-auto flex items-center gap-2">
              {botStatus?.status === 'online' ? (
                <button
                  onClick={handleStopBot}
                  disabled={botLoading}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Square className="w-4 h-4" />
                  {botLoading ? 'Arrêt...' : 'Arrêter'}
                </button>
              ) : (
                <button
                  onClick={handleStartBot}
                  disabled={botLoading}
                  className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  {botLoading ? 'Démarrage...' : 'Démarrer'}
                </button>
              )}
            </div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1a1a2e] rounded-lg p-4">
              <p className="text-gray-400 text-sm">Statut</p>
              <p className={`text-lg font-semibold ${
                botStatus?.status === 'online' ? 'text-green-400' : 'text-red-400'
              }`}>
                {botStatus?.status === 'online' ? '🟢 En ligne' : '🔴 Hors ligne'}
              </p>
            </div>
            <div className="bg-[#1a1a2e] rounded-lg p-4">
              <p className="text-gray-400 text-sm">Serveurs</p>
              <p className="text-lg font-semibold">{botStatus?.guilds || 0}</p>
            </div>
            <div className="bg-[#1a1a2e] rounded-lg p-4">
              <p className="text-gray-400 text-sm">Utilisateurs en cache</p>
              <p className="text-lg font-semibold">{botStatus?.users || 0}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Envoi de messages */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#12121a] rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Envoyer un message
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Salon</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none"
                >
                  <option value="general">Général</option>
                  <option value="announcements">Annonces</option>
                  <option value="leaderboard">Classement</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Message</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Votre message..."
                  rows={4}
                  className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>
              
              <button
                onClick={sendMessage}
                disabled={loading || !messageContent.trim()}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </motion.div>

          {/* Classements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#12121a] rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Publier les classements
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Publiez manuellement les classements dans le salon dédié.
                Les classements mensuels sont publiés automatiquement le 1er de chaque mois.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => publishLeaderboard('solo')}
                  disabled={loading}
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 hover:border-yellow-400 text-yellow-400 font-semibold py-4 rounded-lg transition-all flex flex-col items-center gap-2"
                >
                  <Trophy className="w-6 h-6" />
                  Solo
                </button>
                
                <button
                  onClick={() => publishLeaderboard('multi')}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 hover:border-blue-400 text-blue-400 font-semibold py-4 rounded-lg transition-all flex flex-col items-center gap-2"
                >
                  <Hash className="w-6 h-6" />
                  Multijoueur
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Résultat */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 p-4 rounded-lg flex items-center gap-3 ${
              result.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}
          >
            {result.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {result.message}
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-[#12121a] rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4">Configuration requise</h2>
          <div className="space-y-2 text-gray-400 text-sm">
            <p>1. Créer un bot Discord sur <a href="https://discord.com/developers/applications" target="_blank" className="text-indigo-400 hover:underline">Discord Developer Portal</a></p>
            <p>2. Copier le token et le client ID dans le fichier <code className="bg-[#1a1a2e] px-2 py-1 rounded">discord-bot/.env</code></p>
            <p>3. Inviter le bot sur votre serveur avec les permissions: Manage Roles, Manage Channels, Send Messages, Embed Links</p>
            <p>4. Récupérer les IDs des salons et rôles (mode développeur Discord activé)</p>
            <p>5. Lancer le bot: <code className="bg-[#1a1a2e] px-2 py-1 rounded">cd discord-bot && npm install && npm run dev</code></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
