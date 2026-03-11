'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const adRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Only try to load ad if component is mounted and ad element exists
    if (!adRef.current || isAdLoaded) return;

    try {
      // Ensure adsbygoogle array exists
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }

      // Check if ad is already initialized for this element
      const adElement = adRef.current;
      if (adElement.getAttribute('data-adsbygoogle-status') === 'done') {
        setIsAdLoaded(true);
        return;
      }

      // Push the ad request
      (window.adsbygoogle).push({});
      setIsAdLoaded(true);

    } catch (error) {
      console.log('AdSense error:', error);
    }
  }, [isAdLoaded]);

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
        ref={adRef as any}
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
        data-ad-test={process.env.NODE_ENV === 'development' ? 'on' : 'off'} // Test mode in dev
      />
    </div>
  );
}
