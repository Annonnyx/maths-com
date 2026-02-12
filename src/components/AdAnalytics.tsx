'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (command: string, action: string, options?: any) => void;
  }
}

export function AdAnalytics({ adType = 'banner', location = 'unknown' }: {
  adType?: string;
  location?: string;
}) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'ad_impression', {
          ad_type: adType,
          page_location: location,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.log('Analytics error:', error);
    }
  }, [adType, location]);

  return null;
}
