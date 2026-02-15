'use client';

import { usePresence } from '@/hooks/usePresence';

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  usePresence(); // Global heartbeat for online status
  return <>{children}</>;
}
