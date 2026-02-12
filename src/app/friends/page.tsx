'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, Users, UserPlus, MessageCircle, Check, X, 
  Search, Loader2, Mail, Trash2, Send
} from 'lucide-react';

interface Friend {
  id: string;
  status: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    isOnline: boolean;
    lastSeenAt: string;
  };
  isInitiator: boolean;
}

export default function FriendsPage() {
  const { data: session } = useSession();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'pending'>('all');

  useEffect(() => {
    if (session) {
      fetchFriends();
    }
  }, [session]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      if (!response.ok) throw new Error('Failed to fetch friends');
      
      const data = await response.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
      setSentRequests(data.sentRequests || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action: 'accept' })
      });
      
      if (response.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error('Error accepting friend:', error);
    }
  };

  const handleDecline = async (friendshipId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action: 'decline' })
      });
      
      if (response.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error('Error declining friend:', error);
    }
  };

  const handleRemove = async (friendshipId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId })
      });
      
      if (response.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: searchQuery.trim() })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSearchQuery('');
        fetchFriends();
        alert('Demande d\'ami envoyée !');
      } else {
        alert(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Erreur lors de l\'envoi');
    }
  };

  const filteredFriends = friends.filter(f => {
    if (activeTab === 'online') return f.user.isOnline;
    return true;
  });

  const formatLastSeen = (date: string) => {
    const lastSeen = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSeen.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'à l\'instant';
    if (diff < 60) return `il y a ${diff} min`;
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`;
    return `il y a ${Math.floor(diff / 1440)}j`;
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour voir tes amis</h1>
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold">
            Se connecter
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
              <Users className="w-6 h-6" />
              Amis
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {friends.length} ami{friends.length > 1 ? 's' : ''}
            </span>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                {pendingRequests.length} en attente
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Add Friend Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-[#12121a] rounded-2xl border border-[#2a2a3a]"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-400" />
            Ajouter un ami
          </h2>
          <form onSubmit={handleAddFriend} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom d'utilisateur..."
                className="w-full pl-10 pr-4 py-3 bg-[#1e1e2e] border border-[#3a3a4a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer
            </button>
          </form>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-purple-600 text-white' : 'bg-[#1e1e2e] text-gray-400 hover:text-white'
            }`}
          >
            Tous ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('online')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'online' ? 'bg-green-600 text-white' : 'bg-[#1e1e2e] text-gray-400 hover:text-white'
            }`}
          >
            En ligne ({friends.filter(f => f.user.isOnline).length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'pending' ? 'bg-yellow-600 text-white' : 'bg-[#1e1e2e] text-gray-400 hover:text-white'
            }`}
          >
            Demandes
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
            <p>Chargement...</p>
          </div>
        ) : activeTab === 'pending' ? (
          /* Pending Requests */
          <div className="space-y-3">
            {pendingRequests.length === 0 && sentRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Aucune demande en attente</p>
              </div>
            ) : (
              <>
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-[#12121a] rounded-xl border border-[#2a2a3a] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                        {request.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{request.user.displayName || request.user.username}</p>
                        <p className="text-sm text-gray-400">Veut être ton ami</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                {sentRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-[#12121a] rounded-xl border border-[#2a2a3a] flex items-center justify-between opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-lg font-bold">
                        {request.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{request.user.displayName || request.user.username}</p>
                        <p className="text-sm text-gray-400">Demande envoyée - En attente</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(request.id)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        ) : (
          /* Friends List */
          <div className="space-y-3">
            {filteredFriends.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{activeTab === 'online' ? "Aucun ami en ligne" : "Tu n'as pas encore d'amis"}</p>
                <p className="text-sm mt-2">Ajoute des amis pour les défier !</p>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[#12121a] rounded-xl border border-[#2a2a3a] flex items-center justify-between group hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                        {friend.user.username.charAt(0).toUpperCase()}
                      </div>
                      {friend.user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#12121a]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{friend.user.displayName || friend.user.username}</p>
                        {friend.user.isOnline ? (
                          <span className="text-xs text-green-400">En ligne</span>
                        ) : (
                          <span className="text-xs text-gray-500">{formatLastSeen(friend.user.lastSeenAt)}</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Link
                          href={`/messages?friend=${friend.user.id}`}
                          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Message
                        </Link>
                        <span className="text-gray-600">·</span>
                        <Link
                          href={`/multiplayer?challenge=${friend.user.id}`}
                          className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          Défier
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemove(friend.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Supprimer l'ami"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
