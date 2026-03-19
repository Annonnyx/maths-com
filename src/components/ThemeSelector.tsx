'use client';

import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { THEMES } from '@/lib/themes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export default function ThemeSelector() {
  const { currentTheme, setTheme, themes } = useTheme();
  const [switchingTheme, setSwitchingTheme] = useState<string | null>(null);

  const handleThemeChange = async (themeId: string) => {
    if (themeId === currentTheme) return;
    
    setSwitchingTheme(themeId);
    await setTheme(themeId as any);
    setSwitchingTheme(null);
    
    // Toast simple (remplacer par votre système de notifications)
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      // Pour l'instant, un simple console.log - à remplacer par votre système de toast
      console.log(`Thème ${theme.name} appliqué ✓`);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        🎨 Apparence
      </h3>
      
      {/* Grid de thèmes - 3 desktop / 2 tablet / 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={currentTheme === theme.id}
            isLoading={switchingTheme === theme.id}
            onClick={() => handleThemeChange(theme.id)}
          />
        ))}
      </div>
      
      <div className="mt-4 text-sm text-[var(--text-muted)]">
        Les thèmes sont sauvegardés automatiquement et partagés entre vos appareils.
      </div>
    </div>
  );
}

interface ThemeCardProps {
  theme: typeof THEMES[number];
  isActive: boolean;
  isLoading: boolean;
  onClick: () => void;
}

function ThemeCard({ theme, isActive, isLoading, onClick }: ThemeCardProps) {
  return (
    <Card 
      className={`
        relative cursor-pointer transition-all duration-300 hover:scale-105
        bg-[var(--bg-card)] border-[var(--border)]
        ${isActive ? 'ring-2 ring-[var(--accent-primary)]' : 'hover:border-[var(--accent-secondary)]'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={isLoading ? undefined : onClick}
    >
      <CardContent className="p-4">
        {/* Preview miniature (80×50px, générée en CSS pur) */}
        <div 
          className="w-full h-12 rounded-md mb-3 relative overflow-hidden"
          style={{
            background: getThemePreviewColor(theme.id, 'bg-primary'),
          }}
        >
          {/* Barre d'accent */}
          <div 
            className="absolute top-2 left-2 right-2 h-1 rounded-full"
            style={{
              background: getThemePreviewColor(theme.id, 'accent-primary'),
            }}
          />
          
          {/* Petits orbes simulés */}
          <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full opacity-60"
            style={{
              background: getThemePreviewColor(theme.id, 'orb-1'),
            }}
          />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full opacity-40"
            style={{
              background: getThemePreviewColor(theme.id, 'orb-2'),
            }}
          />
          <div className="absolute top-3 right-3 w-1 h-1 rounded-full opacity-30"
            style={{
              background: getThemePreviewColor(theme.id, 'orb-3'),
            }}
          />
          
          {/* Échantillon de texte */}
          <div className="absolute top-4 left-2 text-xs font-medium"
            style={{
              color: getThemePreviewColor(theme.id, 'text-primary'),
            }}
          >
            Aa
          </div>
        </div>

        {/* Nom et emoji du thème */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{theme.emoji}</span>
            <span className="font-medium text-[var(--text-primary)]">
              {theme.name}
            </span>
          </div>
          
          {/* Badge "Actuel" ou spinner */}
          {isActive ? (
            <Badge variant="secondary" className="text-xs bg-[var(--accent-primary)] text-[var(--text-primary)]">
              <Check className="w-3 h-3 mr-1" />
              Actuel
            </Badge>
          ) : isLoading ? (
            <div className="w-4 h-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          ) : null}
        </div>

        {/* Indicateur thème clair/sombre */}
        <div className="mt-2 text-xs text-[var(--text-muted)]">
          {theme.isDark ? '🌙 Sombre' : '☀️ Clair'}
        </div>
      </CardContent>
    </Card>
  );
}

// Fonction pour obtenir les couleurs de preview quand les variables CSS ne sont pas encore appliquées
function getThemePreviewColor(themeId: string, variable: string): string {
  const previews: Record<string, Record<string, string>> = {
    neon: {
      'bg-primary': '#0a0f1e',
      'accent-primary': '#3b82f6',
      'text-primary': '#f1f5f9',
      'orb-1': 'rgba(59,130,246,0.15)',
      'orb-2': 'rgba(139,92,246,0.10)',
      'orb-3': 'rgba(6,182,212,0.08)',
    },
    cherry: {
      'bg-primary': '#1a0d12',
      'accent-primary': '#f472b6',
      'text-primary': '#fdf2f8',
      'orb-1': 'rgba(244,114,182,0.12)',
      'orb-2': 'rgba(251,113,133,0.08)',
      'orb-3': 'rgba(216,180,254,0.07)',
    },
    ocean: {
      'bg-primary': '#030d1a',
      'accent-primary': '#0ea5e9',
      'text-primary': '#e0f7ff',
      'orb-1': 'rgba(14,165,233,0.12)',
      'orb-2': 'rgba(6,182,212,0.08)',
      'orb-3': 'rgba(20,184,166,0.07)',
    },
    prairie: {
      'bg-primary': '#071a0e',
      'accent-primary': '#22c55e',
      'text-primary': '#f0fdf4',
      'orb-1': 'rgba(34,197,94,0.10)',
      'orb-2': 'rgba(16,185,129,0.08)',
      'orb-3': 'rgba(101,163,13,0.07)',
    },
    sunset: {
      'bg-primary': '#150a05',
      'accent-primary': '#fb923c',
      'text-primary': '#fff7ed',
      'orb-1': 'rgba(251,146,60,0.12)',
      'orb-2': 'rgba(239,68,68,0.08)',
      'orb-3': 'rgba(217,119,6,0.07)',
    },
    arctic: {
      'bg-primary': '#f0f9ff',
      'accent-primary': '#0ea5e9',
      'text-primary': '#0f172a',
      'orb-1': 'rgba(14,165,233,0.08)',
      'orb-2': 'rgba(224,242,254,0.06)',
      'orb-3': 'rgba(125,211,252,0.07)',
    },
    light: {
      'bg-primary': '#f8fafc',
      'accent-primary': '#6366f1',
      'text-primary': '#0f172a',
      'orb-1': 'rgba(99,102,241,0.06)',
      'orb-2': 'rgba(139,92,246,0.04)',
      'orb-3': 'rgba(59,130,246,0.05)',
    },
  };

  return previews[themeId]?.[variable] || '#000000';
}
