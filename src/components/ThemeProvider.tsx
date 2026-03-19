'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, ThemeId } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: typeof THEMES;
  isClient: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function ThemeProviderComponent({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('neon');
  const [isClient, setIsClient] = useState(false);

  // Appliquer le thème
  const applyTheme = (themeId: ThemeId) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeId);
      localStorage.setItem('theme', themeId);
    }
  };

  // Changer de thème avec sync DB
  const setTheme = async (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);

    // Sync avec la DB en arrière-plan
    if (isClient) {
      try {
        await fetch('/api/profile/theme', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme: themeId }),
        });
      } catch (error) {
        console.warn('Failed to sync theme to database:', error);
      }
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    // Charger le thème depuis localStorage au montage (instantané, pas de flash)
    const savedTheme = localStorage.getItem('theme') as ThemeId;
    if (savedTheme && THEMES.find(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Thème par défaut
      setCurrentTheme('neon');
      applyTheme('neon');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      setTheme, 
      themes: THEMES,
      isClient 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

const ThemeProvider = ThemeProviderComponent;
export { ThemeProvider };
export default ThemeProvider;
