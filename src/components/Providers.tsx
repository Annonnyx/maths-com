'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthProvider from './AuthProvider';
import { SoundProvider } from './SoundProvider';
import { NotificationProvider } from './NotificationProvider';
import { PresenceProvider } from './PresenceProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SoundProvider>
          <NotificationProvider>
            <PresenceProvider>
              {children}
            </PresenceProvider>
          </NotificationProvider>
        </SoundProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
