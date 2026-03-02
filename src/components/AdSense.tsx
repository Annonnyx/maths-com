/**
 * Composant wrapper AdSense avec chargement conditionnel
 * Conforme CNIL : ne charge les scripts qu'après consentement explicite
 * Maths-app.com - v1.0 - 2 mars 2026
 */

'use client';

import { useState, useEffect } from 'react';
import { isAdvertisingAllowed } from '@/lib/cookies-consent';

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSense({ adSlot, adFormat = 'auto', style, className }: AdSenseProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Vérifier le consentement publicitaire
    const advertisingAllowed = isAdvertisingAllowed();
    setShowAd(advertisingAllowed);

    if (advertisingAllowed && !isScriptLoaded) {
      loadAdSenseScript();
    }

    // Écouter les changements de consentement
    const handleConsentUpdate = () => {
      const newAdvertisingAllowed = isAdvertisingAllowed();
      setShowAd(newAdvertisingAllowed);
      
      if (newAdvertisingAllowed && !isScriptLoaded) {
        loadAdSenseScript();
      }
    };

    window.addEventListener('cookieConsentUpdated', handleConsentUpdate);
    
    return () => {
      window.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
    };
  }, [isScriptLoaded]);

  const loadAdSenseScript = () => {
    if (typeof window === 'undefined' || window.adsbygoogle) {
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        setIsScriptLoaded(true);
        console.log('✅ Script AdSense chargé conformément au consentement CNIL');
      };
      
      script.onerror = () => {
        console.error('❌ Erreur lors du chargement du script AdSense');
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du script AdSense:', error);
    }
  };

  // Si pas de consentement, afficher un placeholder
  if (!showAd) {
    return (
      <div 
        className={`bg-muted/20 border border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm ${className}`}
        style={{ minHeight: '250px', ...style }}
      >
        <div className="text-center p-4">
          <p className="font-medium mb-2">Publicité désactivée</p>
          <p className="text-xs">
            Vous pouvez activer les publicités dans les paramètres des cookies
          </p>
        </div>
      </div>
    );
  }

  // Si consentement mais script pas encore chargé
  if (!isScriptLoaded) {
    return (
      <div 
        className={`bg-muted/20 border border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm ${className}`}
        style={{ minHeight: '250px', ...style }}
      >
        <div className="text-center p-4">
          <p className="font-medium mb-2">Chargement de la publicité...</p>
          <p className="text-xs">Merci de votre patience</p>
        </div>
      </div>
    );
  }

  // Afficher l'annonce AdSense
  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5606384371601059"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
