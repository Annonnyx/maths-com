'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Swords, MessageCircle } from 'lucide-react';

type NotificationType = 'friend' | 'challenge' | 'message';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  onClick?: () => void;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration (default 10 seconds)
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, (notification.duration || 10) * 1000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <ToastContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Toast Container Component
function ToastContainer({ 
  notifications, 
  onRemove 
}: { 
  notifications: Notification[]; 
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <Toast key={notification.id} notification={notification} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual Toast Component
function Toast({ 
  notification, 
  onRemove 
}: { 
  notification: Notification; 
  onRemove: (id: string) => void;
}) {
  const icons = {
    friend: <UserPlus className="w-5 h-5 text-blue-400" />,
    challenge: <Swords className="w-5 h-5 text-orange-400" />,
    message: <MessageCircle className="w-5 h-5 text-green-400" />,
  };

  const colors = {
    friend: 'border-blue-500/30 bg-blue-500/10',
    challenge: 'border-orange-500/30 bg-orange-500/10',
    message: 'border-green-500/30 bg-green-500/10',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`pointer-events-auto min-w-[320px] max-w-[400px] p-4 rounded-xl border ${colors[notification.type]} backdrop-blur-md shadow-lg cursor-pointer`}
      onClick={() => {
        notification.onClick?.();
        onRemove(notification.id);
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-white mb-1">
            {notification.title}
          </h4>
          <p className="text-xs text-gray-300 line-clamp-2">
            {notification.message}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(notification.id);
          }}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
}
