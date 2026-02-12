'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthProvider from '@/components/AuthProvider';
import { SoundProvider } from '@/components/SoundProvider';
import Navigation from '@/components/Navigation';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SoundProvider>
          <Navigation />
          {children}
        </SoundProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
