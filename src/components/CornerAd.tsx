'use client';

import { useState, useEffect } from 'react';
import { AdSenseBanner } from './AdSenseBanner';
import { AdWrapper } from './AdWrapper';

interface CornerAdProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export function CornerAd({ position, className = "" }: CornerAdProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher la pub après 2 secondes pour ne pas perturber l'arrivée
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'fixed top-4 left-4 z-40';
      case 'top-right':
        return 'fixed top-4 right-4 z-40';
      case 'bottom-left':
        return 'fixed bottom-4 left-4 z-40';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-40';
      default:
        return 'fixed top-4 right-4 z-40';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      <AdWrapper showAdBlockMessage={false}>
        <AdSenseBanner 
          adSlot="XXXXXXXXXX" // Slot pour petits coins
          adFormat="rectangle"
          className="transform scale-75 origin-top-right"
        />
      </AdWrapper>
    </div>
  );
}

// Composant pour les pubs mobiles (plus petites)
export function MobileCornerAd({ position }: { position: 'top-left' | 'top-right' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // Plus tard sur mobile

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed ${position === 'top-left' ? 'top-2 left-2' : 'top-2 right-2'} z-40 md:hidden`}>
      <AdWrapper showAdBlockMessage={false}>
        <AdSenseBanner 
          adSlot="XXXXXXXXXX" // Slot mobile
          adFormat="rectangle"
          className="transform scale-50 origin-top-right"
        />
      </AdWrapper>
    </div>
  );
}
