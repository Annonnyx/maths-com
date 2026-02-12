'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import AuthProvider from './AuthProvider';
import { SoundProvider } from './SoundProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
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
