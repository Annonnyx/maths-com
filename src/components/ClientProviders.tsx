'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthProvider from '@/components/AuthProvider';
import { SoundProvider } from '@/components/SoundProvider';
import { NotificationProvider } from '@/components/NotificationToast';
import { NotificationChecker } from '@/components/NotificationChecker';
import Navigation from '@/components/Navigation';
import { useEffect, useState } from 'react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <SoundProvider>
            {children}
          </SoundProvider>
        </AuthProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <SoundProvider>
          <NotificationProvider>
            <NotificationChecker />
            <Navigation />
            {children}
          </NotificationProvider>
        </SoundProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
