'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, User as UserIcon, Clock, Check, AlertCircle, MessageSquare, Swords } from 'lucide-react';
import Link from 'next/link';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import ChallengeModal from './ChallengeModal';

export default function FriendsManager() {
  const { 
    friends, 
    pendingRequests, 
    sentRequests, 
    addFriend, 
    respondToFriendRequest,
    getFriends,
    sendMessage 
  } = useMultiplayer();
  
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedFriendForChallenge, setSelectedFriendForChallenge] = useState<{ id: string; name: string } | null>(null);

  const handleAddFriend = async () => {
    if (!username.trim()) {
      setError('Le nom d\'utilisateur est requis');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await addFriend(username.trim());
      setSuccess(`Demande d'ami envoyée à ${username.trim()} !`);
      setUsername('');
      setShowAddFriend(false);
      await getFriends(); // Refresh friends list
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout d\'ami');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToRequest = async (friendshipId: string, action: 'accept' | 'decline' | 'block') => {
    try {
      await respondToFriendRequest(friendshipId, action);
      await getFriends(); // Refresh friends list
    } catch (err: any) {
      console.error('Error responding to request:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedFriend || !messageContent.trim()) return;

    try {
      await sendMessage(selectedFriend, messageContent.trim());
      setSuccess('Message envoyé !');
      setMessageContent('');
      setShowMessageModal(false);
      setSelectedFriend(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du message');
    }
  };

  const openMessageModal = (friendId: string) => {
    setSelectedFriend(friendId);
    setShowMessageModal(true);
    setMessageContent('');
    setError('');
    setSuccess('');
  };

  const handleChallenge = (friendId: string, friendName: string) => {
    setSelectedFriendForChallenge({ id: friendId, name: friendName });
    setShowChallengeModal(true);
  };

  const formatLastSeen = (lastSeenAt: string) => {
    const date = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'En ligne';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return `Il y a ${Math.floor(diffMins / 1440)}j`;
  };

  return (
    <div className="space-y-6">
      {/* Add Friend Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Amis ({friends.length})</h3>
        <button
          onClick={() => setShowAddFriend(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter un ami
        </button>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4"
        >
          <h4 className="font-semibold text-yellow-400 mb-3">Demandes d'amis en attente ({pendingRequests.length})</h4>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {request.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">
                      <Link 
                        href={`/users/${request.user.id}`}
                        className="hover:text-indigo-400 transition-colors"
                      >
                        {request.user.username}
                      </Link>
                    </div>
                    <div className="text-sm text-foreground">
                      {request.user.displayName || request.user.username}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'accept')}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(request.id, 'decline')}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Friends List */}
      {friends.length > 0 ? (
        <div className="space-y-3">
          {friends.map((friend) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-[#1e1e2e] rounded-xl hover:bg-[#2a2a3a] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                    {friend.user.username.charAt(0).toUpperCase()}
                  </div>
                  {friend.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e1e2e]"></div>
                  )}
                </div>
                <div>
                  <div className="font-semibold">
                    <Link 
                      href={`/users/${friend.user.id}`}
                      className="hover:text-indigo-400 transition-colors"
                    >
                      {friend.user.displayName || friend.user.username}
                    </Link>
                  </div>
                  <div className="text-sm text-foreground">
                    {friend.user.isOnline ? 'En ligne' : `Hors ligne depuis ${formatLastSeen(friend.user.lastSeenAt)}`}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatLastSeen(friend.user.lastSeenAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleChallenge(friend.user.id, friend.user.username)}
                  className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-all text-sm"
                >
                  <Swords className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => openMessageModal(friend.user.id)}
                  className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-foreground">Tu n'as pas encore d'amis</p>
          <p className="text-sm text-gray-500 mt-2">Ajoute des amis pour jouer avec eux !</p>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e1e2e] rounded-xl p-4"
        >
          <h4 className="font-semibold text-foreground mb-3">Demandes envoyées ({sentRequests.length})</h4>
          <div className="space-y-2">
            {sentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {request.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{request.user.username}</div>
                    <div className="text-xs text-gray-500">En attente...</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Friend Modal */}
      <AnimatePresence>
        {showAddFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAddFriend(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e1e2e] rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Ajouter un ami</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">{success}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Entrez le nom d'utilisateur..."
                    className="w-full px-4 py-3 bg-[#12121a] border border-[#2a2a3a] rounded-xl focus:border-indigo-500 focus:outline-none transition-all"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAddFriend}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-indigo-500 text-foreground rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {isLoading ? 'Envoi...' : 'Ajouter'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddFriend(false);
                      setUsername('');
                      setError('');
                      setSuccess('');
                    }}
                    className="flex-1 px-4 py-3 bg-[#2a2a3a] text-foreground rounded-xl hover:bg-[#3a3a4a] transition-all font-semibold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e1e2e] rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Envoyer un message</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">{success}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Écris ton message..."
                    className="w-full px-4 py-3 bg-[#12121a] border border-[#2a2a3a] rounded-xl focus:border-indigo-500 focus:outline-none transition-all resize-none"
                    rows={4}
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim()}
                    className="flex-1 px-4 py-3 bg-purple-500 text-foreground rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Envoyer
                  </button>
                  <button
                    onClick={() => {
                      setShowMessageModal(false);
                      setMessageContent('');
                      setError('');
                      setSuccess('');
                    }}
                    className="flex-1 px-4 py-3 bg-[#2a2a3a] text-foreground rounded-xl hover:bg-[#3a3a4a] transition-all font-semibold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Modal */}
      {selectedFriendForChallenge && (
        <ChallengeModal
          friendId={selectedFriendForChallenge.id}
          friendName={selectedFriendForChallenge.name}
          isOpen={showChallengeModal}
          onClose={() => {
            setShowChallengeModal(false);
            setSelectedFriendForChallenge(null);
          }}
        />
      )}
    </div>
  );
}
