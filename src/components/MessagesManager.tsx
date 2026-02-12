'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Check, X, AlertCircle, Trash2, Reply } from 'lucide-react';
import { useMultiplayer } from '@/hooks/useMultiplayer';

interface Conversation {
  friendId: string;
  friend: {
    id: string;
    username: string;
    displayName: string | null;
    isOnline: boolean;
    lastSeenAt: string;
  };
  latestMessage: {
    id: string;
    content: string;
    type: string;
    createdAt: string;
    isFromMe: boolean;
  };
  unreadCount: number;
  totalMessages: number;
}

export default function MessagesManager() {
  const { 
    messages, 
    sendMessage, 
    markMessagesAsRead,
    getMessages 
  } = useMultiplayer();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localConversations, setLocalConversations] = useState<any[]>([]);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getMessages();
        if (data && data.conversations) {
          setLocalConversations(data.conversations);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };
    
    loadConversations();
  }, [getMessages]);

  const handleSelectConversation = (friendId: string) => {
    setSelectedConversation(friendId);
    setShowMessageModal(true);
    setMessageContent('');
    setError('');
    setSuccess('');
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageContent.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendMessage(selectedConversation, messageContent.trim());
      setSuccess('Message envoyé !');
      setMessageContent('');
      setTimeout(() => {
        setShowMessageModal(false);
        setSelectedConversation(null);
        setSuccess('');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (friendId: string) => {
    try {
      // For now, mark all messages as read for this friend
      await markMessagesAsRead([]);
      // TODO: Implement proper friend-specific message marking
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleDeleteConversation = async (friendId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAll: true, friendId })
      });
      
      // Refresh messages
      await getMessages();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return `Il y a ${Math.floor(diffMins / 1440)}j`;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Messages ({localConversations?.length || 0})</h3>
      
      {(!localConversations || localConversations.length === 0) ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-foreground">Tu n'as pas encore de conversations</p>
          <p className="text-sm text-gray-500">Ajoute des amis pour discuter !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {localConversations.map((conversation) => (
            <motion.div
              key={conversation.friendId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 bg-[#1e1e2e] rounded-xl border transition-all cursor-pointer ${
                selectedConversation === conversation.friendId 
                  ? 'border-indigo-500/50 bg-indigo-500/10' 
                  : 'border-[#2a2a3a] hover:bg-[#2a2a3a]'
              }`}
              onClick={() => handleSelectConversation(conversation.friendId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {conversation.friend.username.charAt(0).toUpperCase()}
                    </div>
                    {conversation.friend.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e1e2e]"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{conversation.friend.displayName || conversation.friend.username}</div>
                    <div className="text-sm text-foreground">
                      {formatTime(conversation.friend.lastSeenAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {conversation.unreadCount > 0 && (
                    <div className="w-2 h-2 bg-red-500 rounded-full flex items-center justify-center text-xs text-foreground font-bold">
                      {conversation.unreadCount}
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {conversation.latestMessage.isFromMe ? '→' : '←'}
                    </div>
                    <div className="text-sm text-foreground truncate max-w-[150px]">
                      {conversation.latestMessage.content}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkAsRead(conversation.friendId)}
                  className="px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-all text-xs"
                  disabled={conversation.unreadCount === 0}
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteConversation(conversation.friendId)}
                  className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all text-xs"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && selectedConversation && (
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
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Message à {localConversations.find(c => c.friendId === selectedConversation)?.friend.displayName || localConversations.find(c => c.friendId === selectedConversation)?.friend.username}
              </h3>
              
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
                    disabled={!messageContent.trim() || isLoading}
                    className="flex-1 px-4 py-3 bg-purple-500 text-foreground rounded-xl hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {isLoading ? 'Envoi...' : 'Envoyer'}
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
    </div>
  );
}
