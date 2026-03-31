'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Rafraîchir toutes les 5 minutes
      refetchOnWindowFocus={true} // Rafraîchir quand la fenêtre reprend le focus
    >
      {children}
    </SessionProvider>
  );
}
