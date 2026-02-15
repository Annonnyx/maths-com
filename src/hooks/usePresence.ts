'use client';

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function usePresence() {
  const { data: session } = useSession();

  const updatePresence = useCallback(async (isOnline: boolean = true) => {
    if (!session?.user?.email) return;

    try {
      await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline })
      });
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email) return;

    // Set online on mount
    updatePresence(true);

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      updatePresence(true);
    }, 30000);

    // Set offline on page unload
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Set offline when component unmounts (user leaves page)
      updatePresence(false);
    };
  }, [session?.user?.email, updatePresence]);

  return { updatePresence };
}
