'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Send, User, Check, X, Swords, Loader2,
  ChevronLeft
} from 'lucide-react';

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

function MessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialFriendId = searchParams.get('friend');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(initialFriendId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
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

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold mb-4">Connecte-toi pour voir tes messages</h1>
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          {selectedFriend && (
            <button
              onClick={() => setSelectedFriend(null)}
              className="lg:hidden flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Messages
            {conversations.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-foreground rounded-full text-xs">
                {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
              </span>
            )}
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Conversations List */}
          <div className={`lg:col-span-1 bg-[#12121a] rounded-2xl border border-border overflow-hidden flex flex-col ${selectedFriend ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Aucune conversation</p>
                  <Link href="/friends" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                    Ajouter des amis
                  </Link>
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
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
