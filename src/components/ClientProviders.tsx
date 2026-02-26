'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthProvider from '@/components/AuthProvider';
import { SoundProvider } from '@/components/SoundProvider';
import { NotificationProvider } from '@/components/NotificationToast';
import { NotificationChecker } from '@/components/NotificationChecker';
import Navigation from '@/components/Navigation';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
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
