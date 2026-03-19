'use client';

import ThemeProvider from '@/components/ThemeProvider';
import AuthProvider from './AuthProvider';
import { SoundProvider } from '@/components/SoundProvider';
import { NotificationProvider } from '@/components/NotificationProvider';

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
