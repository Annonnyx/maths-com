'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSenseBanner({ 
  adSlot = "XXXXXXXXXX", 
  className = "",
  adFormat = "auto" 
}: {
  adSlot?: string;
  className?: string;
  adFormat?: string;
}) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.log('AdSense error:', error);
    }
  }, []);

  // Définir les dimensions selon le format
  const getDimensions = () => {
    switch (adFormat) {
      case 'horizontal':
        return { width: '728px', height: '90px' };
      case 'vertical':
        return { width: '300px', height: '600px' };
      case 'rectangle':
        return { width: '336px', height: '280px' };
      default:
        return { width: '100%', height: 'auto' };
    }
  };

  const dimensions = getDimensions();

  return (
    <div className={`w-full flex justify-center ${className}`} style={{ minHeight: dimensions.height === 'auto' ? '90px' : dimensions.height }}>
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          width: dimensions.width,
          height: dimensions.height
        }}
        data-ad-client="ca-pub-5606384371601059"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
