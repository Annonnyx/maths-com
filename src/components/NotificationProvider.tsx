'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Swords, X, Check } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'friend_request' | 'challenge';
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  metadata?: any;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: {
    friendRequests: boolean;
    challenges: boolean;
  };
  updateSettings: (settings: { friendRequests?: boolean; challenges?: boolean }) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState({
    friendRequests: true,
    challenges: true,
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save settings
  const updateSettings = (newSettings: { friendRequests?: boolean; challenges?: boolean }) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));
  };

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
        (payload: any) => {
          const message = payload.new;
          
          if (message.type === 'friend_request' && settings.friendRequests) {
            const notification: Notification = {
              id: message.id,
              type: 'friend_request',
              title: 'Nouvelle demande d\'ami',
              message: `${message.sender?.displayName || message.sender?.username || 'Quelqu\'un'} t'envoie une demande d'ami`,
              senderId: message.senderId,
              senderName: message.sender?.displayName || message.sender?.username || 'Quelqu\'un',
              createdAt: message.createdAt,
            };
            setNotifications(prev => [notification, ...prev]);
          }
          
          if (message.type === 'challenge' && settings.challenges) {
            const metadata = JSON.parse(message.metadata || '{}');
            const notification: Notification = {
              id: message.id,
              type: 'challenge',
              title: 'Nouveau défi !',
              message: `${message.sender?.displayName || message.sender?.username || 'Quelqu\'un'} te défie en ${metadata.gameType === 'ranked' ? 'classé' : 'amical'}`,
              senderId: message.senderId,
              senderName: message.sender?.displayName || message.sender?.username || 'Quelqu\'un',
              metadata,
              createdAt: message.createdAt,
            };
            setNotifications(prev => [notification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.id, settings.friendRequests, settings.challenges]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.length,
        settings,
        updateSettings,
        dismissNotification,
        clearAll,
      }}
    >
      {children}
      <NotificationToasts />
    </NotificationContext.Provider>
  );
}

function NotificationToasts() {
  const { notifications, dismissNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
      <AnimatePresence>
        {notifications.slice(0, 3).map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="pointer-events-auto w-80 bg-[#1a1a2e] border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.type === 'friend_request' 
                    ? 'bg-green-500/20' 
                    : 'bg-red-500/20'
                }`}>
                  {notification.type === 'friend_request' ? (
                    <Users className="w-5 h-5 text-green-400" />
                  ) : (
                    <Swords className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  
                  <div className="flex gap-2 mt-3">
                    {notification.type === 'friend_request' ? (
                      <Link
                        href="/friends"
                        className="flex-1 py-1.5 px-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-medium text-center transition-colors"
                      >
                        Voir
                      </Link>
                    ) : (
                      <Link
                        href={`/challenges?id=${notification.metadata?.challengeId}`}
                        className="flex-1 py-1.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium text-center transition-colors"
                      >
                        Accepter
                      </Link>
                    )}
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="py-1.5 px-3 bg-card hover:bg-border rounded-lg text-xs font-medium transition-colors"
                    >
                      Ignorer
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
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
