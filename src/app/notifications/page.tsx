'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Bell, 
  Users, 
  Swords, 
  MessageSquare, 
  CheckCircle, 
  X,
  UserPlus,
  GraduationCap,
  Link2,
  Check,
  Trash2
} from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

interface NotificationItem {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'challenge' | 'message' | 'class_request' | 'class_accepted' | 'teacher_request_approved' | 'discord_linked';
  title: string;
  message: string;
  senderId?: string;
  senderName?: string;
  senderAvatarUrl?: string;
  metadata?: any;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  // Éviter l'erreur pendant le SSR
  if (typeof window === 'undefined') {
    return null;
  }

  // Utiliser le hook avec try-catch pour éviter l'erreur
  let notificationHook: any = null;
  try {
    notificationHook = useNotification();
  } catch (error) {
    console.warn('NotificationProvider not available, using fallback');
  }

  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Charger les notifications manuellement si le hook n'est pas disponible
  useEffect(() => {
    if (!notificationHook) {
      const loadNotifications = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/notifications');
          if (response.ok) {
            const data = await response.json();
            setNotifications(data.notifications || []);
          }
        } catch (error) {
          console.error('Error loading notifications:', error);
          setNotifications([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadNotifications();
    }
  }, [notificationHook]);

  const notificationsList = notificationHook?.notifications || notifications;
  const markAsRead = notificationHook?.markAsRead || ((id: string) => {
    fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      })
      .catch(error => {
        console.error('Error marking notification as read:', error);
      });
  });
  const dismissNotification = notificationHook?.dismissNotification || ((id: string) => {
    fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      })
      .catch(error => {
        console.error('Error dismissing notification:', error);
      });
  });
  const clearAll = notificationHook?.clearAll || (() => {});

  const filteredNotifications = notificationsList.filter((n: any) => 
    filter === 'all' ? true : !n.read
  );

  const unreadCount = notificationsList.filter((n: any) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accepted':
        return <Users className="w-5 h-5 text-blue-400" />;
      case 'challenge':
        return <Swords className="w-5 h-5 text-red-400" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-400" />;
      case 'class_request':
      case 'class_accepted':
        return <GraduationCap className="w-5 h-5 text-purple-400" />;
      case 'teacher_request_approved':
        return <CheckCircle className="w-5 h-5 text-yellow-400" />;
      case 'discord_linked':
        return <Link2 className="w-5 h-5 text-indigo-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationLink = (notificationItem: any) => {
    switch (notificationItem.type) {
      case 'friend_request':
      case 'friend_accepted':
        return '/friends';
      case 'challenge':
        return `/multiplayer${notificationItem.metadata?.challengeId ? `/game/${notificationItem.metadata.challengeId}` : ''}`;
      case 'message':
        return `/messages?friend=${notificationItem.senderId}`;
      case 'class_request':
      case 'class_accepted':
        return '/dashboard';
      case 'teacher_request_approved':
        return '/profile';
      case 'discord_linked':
        return '/profile';
      default:
        return '/notifications';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    markAsRead(notificationId);
    
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds: [notificationId],
          userId: 'current-user' // Sera remplacé par l'ID réel
        })
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notificationsList.filter((n: any) => !n.read).map((n: any) => n.id);
    if (unreadIds.length === 0) return;

    setIsLoading(true);
    
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds: unreadIds,
          userId: 'current-user'
        })
      });
      
      // Mettre à jour l'état local
      unreadIds.forEach((id: string) => markAsRead(id));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    dismissNotification(notificationId);
    
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds: [notificationId],
          userId: 'current-user'
        })
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) return;
    
    setIsLoading(true);
    
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deleteAll: true,
          userId: 'current-user'
        })
      });
      
      clearAll();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-indigo-400" />
              <h1 className="text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                <Check className="w-4 h-4" />
                Tout marquer comme lu
              </button>
              
              <button
                onClick={handleClearAll}
                disabled={notifications.length === 0 || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Tout supprimer
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                filter === 'unread' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-card rounded-2xl border border-border"
            >
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? 'Toutes vos notifications ont été lues !' 
                  : 'Vous n\'avez pas encore de notifications.'
                }
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification: any, index: number) => {
              // Convertir Notification vers NotificationItem en gérant le cas read: undefined
              const notificationItem: NotificationItem = {
                ...notification,
                read: notification.read ?? false
              };
              
              return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 bg-card rounded-xl border transition-all ${
                  notificationItem.read 
                    ? 'border-border opacity-60' 
                    : 'border-indigo-500/30 bg-indigo-500/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notificationItem.read ? 'bg-muted' : 'bg-indigo-500/20'
                  }`}>
                    {getNotificationIcon(notificationItem.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-semibold ${notificationItem.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {notificationItem.title}
                        </h3>
                        {notificationItem.senderName && (
                          <p className="text-sm text-muted-foreground">
                            de {notificationItem.senderName}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notificationItem.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Supprimer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-3 ${notificationItem.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {notificationItem.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notificationItem.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      {getNotificationLink(notificationItem) !== '/notifications' && (
                        <Link
                          href={getNotificationLink(notificationItem)}
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                          Voir →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
