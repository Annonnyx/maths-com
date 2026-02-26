'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePresence } from '@/hooks/usePresence';
import {
  Users, MessageCircle, Swords, Trophy, ArrowLeft,
  UserPlus, Check, X, Search, Loader2, Send, ChevronLeft,
  User, Mail, Trash2
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

interface Message {
  id: string;
  content: string;
  type: 'chat' | 'friend_request' | 'challenge' | 'system';
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender?: {
    id: string;
    username: string;
    displayName: string | null;
  };
  receiver?: {
    id: string;
    username: string;
    displayName: string | null;
  };
  read: boolean;
}

interface Conversation {
  friendId: string;
  friend: {
    id: string;
    username: string;
    displayName: string | null;
    isOnline: boolean;
  };
  latestMessage: Message;
  unreadCount: number;
  totalMessages: number;
}

interface Challenge {
  id: string;
  challenger: {
    id: string;
    username: string;
    displayName: string | null;
  };
  opponent: {
    id: string;
    username: string;
    displayName: string | null;
  };
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
}

export default function SocialPage() {
  const { data: session } = useSession();
  usePresence();
  const [activeTab, setActiveTab] = useState<'friends' | 'messages' | 'challenges'>('friends');

  // Friends state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Challenges state
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchFriends();
      fetchConversations();
      fetchChallenges();

      // Set up intervals for real-time updates
      const friendsInterval = setInterval(fetchFriends, 10000);
      const messagesInterval = setInterval(fetchConversations, 10000);
      const challengesInterval = setInterval(fetchChallenges, 30000);

      return () => {
        clearInterval(friendsInterval);
        clearInterval(messagesInterval);
        clearInterval(challengesInterval);
      };
    }
  }, [session]);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend);
      markAsRead(selectedFriend);
    }
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      if (!response.ok) throw new Error('Failed to fetch friends');

      const data = await response.json();
      setFriends(data.acceptedFriends || []);
      setPendingRequests(data.pendingRequests || []);
      setSentRequests(data.sentRequests || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setFriendsLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) throw new Error('Failed to fetch conversations');

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges');
      if (!response.ok) throw new Error('Failed to fetch challenges');

      const data = await response.json();
      setChallenges(data.pendingReceived || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setChallengesLoading(false);
    }
  };

  const fetchMessages = async (friendId: string) => {
    try {
      const response = await fetch(`/api/messages?friendId=${friendId}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setMessages(data.messages?.reverse() || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (friendId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, friendId })
      });
      fetchConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedFriend,
          content: newMessage.trim(),
          type: 'chat'
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedFriend);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleAcceptFriend = async (friendshipId: string) => {
    try {
      await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action: 'accept' })
      });
      fetchFriends();
      fetchConversations();
      if (selectedFriend) fetchMessages(selectedFriend);
    } catch (error) {
      console.error('Error accepting friend:', error);
    }
  };

  const handleDeclineFriend = async (friendshipId: string) => {
    try {
      await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action: 'decline' })
      });
      fetchFriends();
      fetchConversations();
    } catch (error) {
      console.error('Error declining friend:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedConversation = conversations.find(c => c.friendId === selectedFriend);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour accéder au social</h1>
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-[#12121a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Social
          </h1>
          <div className="flex items-center gap-4">
            {/* Notification badges */}
            {pendingRequests.length > 0 && (
              <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                {pendingRequests.length}
              </span>
            )}
            {conversations.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
              </span>
            )}
            {challenges.length > 0 && (
              <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs">
                {challenges.length}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[#12121a] rounded-xl p-1 border border-border">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'friends'
                ? 'bg-purple-600 text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-card'
            }`}
          >
            <Users className="w-4 h-4" />
            Amis
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-purple-600 text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-card'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Messages
            {conversations.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs">
                {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'challenges'
                ? 'bg-purple-600 text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-card'
            }`}
          >
            <Swords className="w-4 h-4" />
            Défis
            {challenges.length > 0 && (
              <span className="px-1.5 py-0.5 bg-purple-500 text-white rounded-full text-xs">
                {challenges.length}
              </span>
            )}
          </button>
        </div>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher des amis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#12121a] border border-border rounded-xl text-foreground placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-[#12121a] rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  Demandes d'amis ({pendingRequests.length})
                </h2>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {request.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{request.user.displayName || request.user.username}</p>
                          <p className="text-sm text-muted-foreground">Veut être ton ami</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptFriend(request.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Accepter
                        </button>
                        <button
                          onClick={() => handleDeclineFriend(request.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            <div className="bg-[#12121a] rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Mes amis ({friends.length})
              </h2>
              {friendsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Tu n'as pas encore d'amis</p>
                  <Link href="/social" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                    Commence par rechercher des amis !
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {friends
                    .filter(friend =>
                      (friend.user.displayName || friend.user.username).toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-purple-500/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {friend.user.username.charAt(0).toUpperCase()}
                            </div>
                            {friend.user.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#12121a]" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{friend.user.displayName || friend.user.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {friend.user.isOnline ? 'En ligne' : `Vu ${new Date(friend.user.lastSeenAt).toLocaleDateString('fr-FR')}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedFriend(friend.user.id)}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </button>
                          <Link
                            href={`/multiplayer?challenge=${friend.user.id}`}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                          >
                            <Swords className="w-4 h-4" />
                            Défier
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
              {/* Conversations List */}
              <div className={`lg:col-span-1 bg-[#12121a] rounded-2xl border border-border overflow-hidden flex flex-col ${selectedFriend ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Conversations</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {messagesLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune conversation</p>
                      <button
                        onClick={() => setActiveTab('friends')}
                        className="text-indigo-400 hover:text-indigo-300 text-sm mt-2"
                      >
                        Ajouter des amis
                      </button>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.friendId}
                        onClick={() => setSelectedFriend(conv.friendId)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-card transition-colors border-b border-border ${
                          selectedFriend === conv.friendId ? 'bg-card border-l-4 border-l-purple-500' : ''
                        }`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {conv.friend.username.charAt(0).toUpperCase()}
                          </div>
                          {conv.friend.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#12121a]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{conv.friend.displayName || conv.friend.username}</span>
                            {conv.unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-red-500 text-foreground rounded-full text-xs">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.latestMessage.type === 'friend_request'
                              ? "Demande d'ami"
                              : conv.latestMessage.type === 'challenge'
                              ? 'Défi reçu'
                              : conv.latestMessage.content}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`lg:col-span-2 bg-[#12121a] rounded-2xl border border-border overflow-hidden flex flex-col ${selectedFriend ? 'flex' : 'hidden lg:flex'}`}>
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedFriend(null)}
                          className="lg:hidden flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {selectedConversation.friend.username.charAt(0).toUpperCase()}
                          </div>
                          {selectedConversation.friend.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#12121a]" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{selectedConversation.friend.displayName || selectedConversation.friend.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedConversation.friend.isOnline ? 'En ligne' : 'Hors ligne'}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/multiplayer?challenge=${selectedConversation.friendId}`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <Swords className="w-4 h-4" />
                        Défier
                      </Link>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.senderId === session.user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${msg.type !== 'chat' ? 'w-full' : ''}`}>
                            {msg.type === 'friend_request' && msg.senderId !== session.user?.id ? (
                              <div className="bg-card p-4 rounded-xl border border-border">
                                <p className="text-sm mb-3">{msg.content}</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAcceptFriend(msg.id)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-2"
                                  >
                                    <Check className="w-4 h-4" />
                                    Accepter
                                  </button>
                                  <button
                                    onClick={() => handleDeclineFriend(msg.id)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-2"
                                  >
                                    <X className="w-4 h-4" />
                                    Refuser
                                  </button>
                                </div>
                              </div>
                            ) : msg.type === 'challenge' ? (
                              <div className="bg-purple-500/20 border border-purple-500/30 p-4 rounded-xl">
                                <p className="text-sm mb-2">{msg.content}</p>
                                {msg.senderId !== session.user?.id && (
                                  <Link
                                    href={`/multiplayer?challenge=${msg.senderId}`}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm inline-block"
                                  >
                                    Accepter le défi
                                  </Link>
                                )}
                              </div>
                            ) : (
                              <div className={`px-4 py-2 rounded-xl ${
                                msg.senderId === session.user?.id
                                  ? 'bg-purple-600 text-foreground'
                                  : 'bg-card text-foreground'
                              }`}>
                                <p>{msg.content}</p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 px-1">
                              {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-4 border-t border-border flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrire un message..."
                        className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center gap-2"
                      >
                        {sending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Sélectionne une conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-[#12121a] rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Swords className="w-5 h-5 text-purple-400" />
                Défis reçus ({challenges.length})
              </h2>
              {challengesLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                </div>
              ) : challenges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun défi en attente</p>
                  <button
                    onClick={() => setActiveTab('friends')}
                    className="text-indigo-400 hover:text-indigo-300 text-sm mt-2"
                  >
                    Défie un ami !
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {challenge.challenger.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{challenge.challenger.displayName || challenge.challenger.username}</p>
                          <p className="text-sm text-muted-foreground">
                            T'a défié • {new Date(challenge.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/multiplayer?challenge=${challenge.challenger.id}`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <Trophy className="w-4 h-4" />
                        Accepter
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
