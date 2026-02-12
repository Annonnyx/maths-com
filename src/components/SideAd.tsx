'use client';

import { useState, useEffect } from 'react';
import { AdSenseBanner } from './AdSenseBanner';
import { AdWrapper } from './AdWrapper';

interface SideAdProps {
  side: 'left' | 'right';
  className?: string;
}

export function SideAd({ side, className = "" }: SideAdProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher après 1.5s pour ne pas perturber l'arrivée
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getPositionClasses = () => {
    switch (side) {
      case 'left':
        return 'fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden xl:block';
      case 'right':
        return 'fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden xl:block';
      default:
        return 'fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden xl:block';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      <AdWrapper showAdBlockMessage={false}>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <div className="text-xs text-gray-400 mb-2 text-center">Publicité</div>
          <AdSenseBanner 
            adSlot="XXXXXXXXXX" // Slot pour side ads
            adFormat="vertical"
            className="w-32"
          />
        </div>
      </AdWrapper>
    </div>
  );
}

// Pour les écrans larges (desktop uniquement)
export function WideScreenAds() {
  return (
    <>
      <SideAd side="left" />
      <SideAd side="right" />
    </>
  );
}

// Pour les écrans moyens (tablettes/medium desktop)
export function MediumScreenAds() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-32 z-30 hidden lg:block xl:hidden">
      <AdWrapper showAdBlockMessage={false}>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <div className="text-xs text-gray-400 mb-1 text-center">Pub</div>
          <AdSenseBanner 
            adSlot="XXXXXXXXXX" // Slot medium screen
            adFormat="rectangle"
            className="w-28 transform scale-75"
          />
        </div>
      </AdWrapper>
    </div>
  );
}
