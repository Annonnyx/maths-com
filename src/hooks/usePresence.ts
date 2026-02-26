'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const OFFLINE_TIMEOUT = 120000; // 2 minutes

export function usePresence() {
  const { data: session } = useSession();
  const lastActivityRef = useRef<number>(Date.now());
  const isOnlineRef = useRef<boolean>(true);

  const updatePresence = useCallback(async (isOnline: boolean = true) => {
    if (!session?.user?.email) return;

    try {
      // Use sendBeacon for more reliable delivery when page is unloading
      if (!isOnline && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ isOnline: false })], { type: 'application/json' });
        navigator.sendBeacon('/api/presence', blob);
      } else {
        await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isOnline })
        });
      }
      isOnlineRef.current = isOnline;
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  }, [session?.user?.email]);

  // Update activity timestamp on user interaction
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.email) return;

    // Set online on mount
    updatePresence(true);
    lastActivityRef.current = Date.now();

    // Heartbeat every 30 seconds - only if user is active
    const heartbeat = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      // If user has been inactive for more than OFFLINE_TIMEOUT, mark as away
      if (timeSinceLastActivity > OFFLINE_TIMEOUT && isOnlineRef.current) {
        updatePresence(false);
      } else if (timeSinceLastActivity <= OFFLINE_TIMEOUT && !isOnlineRef.current) {
        updatePresence(true);
      }
    }, HEARTBEAT_INTERVAL);

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - mark as away after a delay
        setTimeout(() => {
          if (document.hidden) {
            updatePresence(false);
          }
        }, 30000); // 30 seconds grace period
      } else {
        // Page is visible again
        lastActivityRef.current = Date.now();
        updatePresence(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set offline on page unload
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Set offline when component unmounts (user leaves page)
      updatePresence(false);
    };
  }, [session?.user?.email, updatePresence]);

  return { updatePresence, lastActivity: lastActivityRef.current };
}
