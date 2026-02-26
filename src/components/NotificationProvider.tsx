'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Swords, MessageSquare, X, Bell } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'friend_request' | 'challenge' | 'message' | 'friend_accepted';
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  metadata?: any;
  createdAt: string;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: {
    friendRequests: boolean;
    challenges: boolean;
    messages: boolean;
  };
  updateSettings: (settings: { friendRequests?: boolean; challenges?: boolean; messages?: boolean }) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
  markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState({
    friendRequests: true,
    challenges: true,
    messages: true,
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({
          friendRequests: parsed.friendRequests ?? true,
          challenges: parsed.challenges ?? true,
          messages: parsed.messages ?? true,
        });
      } catch {}
    }
  }, []);

  // Save settings
  const updateSettings = useCallback((newSettings: { friendRequests?: boolean; challenges?: boolean; messages?: boolean }) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));
  }, [settings]);

  // Fetch pending notifications on mount and periodically
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      // Fetch pending friend requests
      const friendsRes = await fetch('/api/friends');
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        const pendingRequests = (friendsData.receivedRequests || [])
          .filter((req: any) => req.status === 'pending')
          .map((req: any) => ({
            id: `friend-${req.id}`,
            type: 'friend_request' as const,
            title: 'Nouvelle demande d\'ami',
            message: `${req.user.username} vous demande en ami`,
            senderId: req.user.id,
            senderName: req.user.username,
            createdAt: req.createdAt,
            read: false
          }));

        // Fetch unread messages
        const messagesRes = await fetch('/api/messages?unreadOnly=true');
        let messageNotifications: Notification[] = [];
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          messageNotifications = (messagesData.conversations || [])
            .filter((conv: any) => conv.unreadCount > 0)
            .map((conv: any) => ({
              id: `msg-${conv.friendId}`,
              type: 'message' as const,
              title: `Message de ${conv.friend.displayName || conv.friend.username}`,
              message: conv.latestMessage.content.substring(0, 50) + (conv.latestMessage.content.length > 50 ? '...' : ''),
              senderId: conv.friend.id,
              senderName: conv.friend.displayName || conv.friend.username,
              createdAt: conv.latestMessage.createdAt,
              read: false
            }));
        }

        // Combine and update notifications
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifications = [...pendingRequests, ...messageNotifications]
            .filter(n => !existingIds.has(n.id));
          return [...newNotifications, ...prev];
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [session?.user?.id]);

  // Initial fetch and periodic polling
  useEffect(() => {
    if (!session?.user?.id) return;
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [session?.user?.id, fetchNotifications]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel(`notifications:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiverId=eq.${session.user.id}`,
        },
        async (payload: any) => {
          const message = payload.new;
          
          // Fetch sender info since Supabase realtime doesn't include relations
          let senderName = 'Quelqu\'un';
          try {
            const { data: sender } = await supabase
              .from('users')
              .select('username, displayName')
              .eq('id', message.senderId)
              .single();
            if (sender) {
              senderName = sender.displayName || sender.username || 'Quelqu\'un';
            }
          } catch (e) {
            console.error('Error fetching sender:', e);
          }
          
          if (message.type === 'friend_request' && settings.friendRequests) {
            const notification: Notification = {
              id: message.id,
              type: 'friend_request',
              title: 'Nouvelle demande d\'ami',
              message: `${senderName} vous demande en ami`,
              senderId: message.senderId,
              senderName: senderName,
              createdAt: message.createdAt,
              read: false
            };
            setNotifications(prev => [notification, ...prev]);
          }
          
          if (message.type === 'challenge' && settings.challenges) {
            const metadata = JSON.parse(message.metadata || '{}');
            const notification: Notification = {
              id: message.id,
              type: 'challenge',
              title: 'Nouveau défi !',
              message: `${senderName} vous défie en ${metadata.gameType === 'ranked' ? 'classé' : 'amical'}`,
              senderId: message.senderId,
              senderName: senderName,
              metadata,
              createdAt: message.createdAt,
              read: false
            };
            setNotifications(prev => [notification, ...prev]);
          }
          
          // Handle regular chat messages
          if (message.type === 'chat' && settings.messages) {
            const notification: Notification = {
              id: `msg-${message.id}`,
              type: 'message',
              title: `Message de ${senderName}`,
              message: message.content.substring(0, 60) + (message.content.length > 60 ? '...' : ''),
              senderId: message.senderId,
              senderName: senderName,
              createdAt: message.createdAt,
              read: false
            };
            setNotifications(prev => [notification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.id, settings.friendRequests, settings.challenges, settings.messages]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        updateSettings,
        dismissNotification,
        clearAll,
        markAsRead,
      }}
    >
      {children}
      <NotificationToasts />
    </NotificationContext.Provider>
  );
}

function NotificationToasts() {
  const { notifications, dismissNotification, markAsRead } = useNotification();
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3);

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
      <AnimatePresence>
        {unreadNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            onClick={() => markAsRead(notification.id)}
            className="pointer-events-auto w-80 bg-[#1a1a2e] border border-border rounded-xl shadow-2xl overflow-hidden cursor-pointer"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.type === 'friend_request' 
                    ? 'bg-green-500/20' 
                    : notification.type === 'challenge'
                    ? 'bg-red-500/20'
                    : 'bg-blue-500/20'
                }`}>
                  {notification.type === 'friend_request' ? (
                    <Users className="w-5 h-5 text-green-400" />
                  ) : notification.type === 'challenge' ? (
                    <Swords className="w-5 h-5 text-red-400" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={notification.type === 'friend_request' ? '/friends' : 
                            notification.type === 'challenge' ? `/challenges?id=${notification.metadata?.challengeId}` : 
                            '/messages'}
                      className="flex-1 py-1.5 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-xs font-medium text-center transition-colors"
                    >
                      Voir
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                      className="py-1.5 px-3 bg-card hover:bg-border rounded-lg text-xs font-medium transition-colors"
                    >
                      Ignorer
                    </button>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notification.id);
                  }}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
