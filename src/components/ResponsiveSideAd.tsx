'use client';

import { useState, useEffect } from 'react';
import { AdSenseBanner } from './AdSenseBanner';
import { AdWrapper } from './AdWrapper';

interface ResponsiveSideAdProps {
  side: 'left' | 'right';
  className?: string;
}

export function ResponsiveSideAd({ side, className = "" }: ResponsiveSideAdProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop' | 'wide'>('desktop');

  useEffect(() => {
    // Détection de la taille d'écran
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else if (width < 1280) setScreenSize('desktop');
      else setScreenSize('wide');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  useEffect(() => {
    // Affichage différé selon l'écran
    const delay = screenSize === 'mobile' ? 0 : screenSize === 'tablet' ? 2000 : 1500;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [screenSize]);

  const getPositionClasses = () => {
    if (!isVisible) return 'hidden';
    
    switch (screenSize) {
      case 'mobile':
        return 'hidden'; // Pas de pub sur mobile
      case 'tablet':
        return 'hidden'; // Plus de pub sur tablette
      case 'desktop':
        return side === 'right'
          ? 'fixed right-8 bottom-8 z-20' // En bas à droite, beaucoup plus petit
          : 'hidden'; // Seulement à droite sur desktop
      case 'wide':
        return side === 'right'
          ? 'fixed right-8 bottom-8 z-20' // En bas à droite
          : 'hidden'; // Plus que côté droit même sur écran large
      default:
        return 'hidden';
    }
  };

  const getAdSize = () => {
    switch (screenSize) {
      case 'desktop':
        return 'w-20 h-20'; // Beaucoup plus petit
      case 'wide':
        return 'w-24 h-24'; // Un peu plus grand sur écran large
      default:
        return 'w-20 h-20';
    }
  };

  const getSlotId = () => {
    switch (screenSize) {
      case 'tablet':
        return 'XXXXXXXXXX'; // Slot tablette
      case 'desktop':
        return 'XXXXXXXXXX'; // Slot desktop
      case 'wide':
        return 'XXXXXXXXXX'; // Slot écran large
      default:
        return 'XXXXXXXXXX';
    }
  };

  if (!isVisible || screenSize === 'mobile') {
    return null;
  }

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      <AdWrapper showAdBlockMessage={false}>
        <div className="bg-white/3 backdrop-blur-sm rounded-lg p-2 border border-white/5 hover:bg-white/5 transition-all duration-300">
          <div className="text-xs text-foreground/50 mb-1 text-center">Pub</div>
          <AdSenseBanner 
            adSlot={getSlotId()}
            adFormat="vertical"
            className={getAdSize()}
          />
        </div>
      </AdWrapper>
    </div>
  );
}

// Composant qui gère les deux côtés - maintenant seulement une pub
export function HomePageSideAds() {
  return (
    <ResponsiveSideAd side="right" />
  );
}
