'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthProvider from './AuthProvider';
import { SoundProvider } from './SoundProvider';
import { NotificationProvider } from './NotificationProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SoundProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </SoundProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
