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
        return side === 'right' 
          ? 'fixed right-3 top-32 z-30' 
          : 'hidden'; // Seulement à droite sur tablette
      case 'desktop':
        return side === 'right'
          ? 'fixed right-4 top-1/2 -translate-y-1/2 z-30'
          : 'hidden'; // Seulement à droite sur desktop normal
      case 'wide':
        return side === 'left' 
          ? 'fixed left-4 top-1/2 -translate-y-1/2 z-30'
          : 'fixed right-4 top-1/2 -translate-y-1/2 z-30'; // Côtés sur écran large
      default:
        return 'hidden';
    }
  };

  const getAdSize = () => {
    switch (screenSize) {
      case 'tablet':
        return 'w-28 transform scale-70';
      case 'desktop':
        return 'w-32';
      case 'wide':
        return 'w-36';
      default:
        return 'w-32';
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
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-lg">
          <div className="text-xs text-foreground mb-2 text-center">Publicité</div>
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

// Composant qui gère les deux côtés
export function HomePageSideAds() {
  return (
    <>
      <ResponsiveSideAd side="left" />
      <ResponsiveSideAd side="right" />
    </>
  );
}
