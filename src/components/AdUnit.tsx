'use client';

import { AdSenseBanner } from './AdSenseBanner';
import { AdWrapper } from './AdWrapper';
import { AdAnalytics } from './AdAnalytics';

interface AdUnitProps {
  type: 'header' | 'sidebar' | 'footer' | 'inline';
  className?: string;
}

export function AdUnit({ type, className = "" }: AdUnitProps) {
  const getAdSlot = () => {
    switch (type) {
      case 'header':
        return 'XXXXXXXXXX'; // Slot pour pub header
      case 'sidebar':
        return 'XXXXXXXXXX'; // Slot pour pub sidebar
      case 'footer':
        return 'XXXXXXXXXX'; // Slot pour pub footer
      case 'inline':
        return 'XXXXXXXXXX'; // Slot pour pub inline
      default:
        return 'XXXXXXXXXX';
    }
  };

  const getAdFormat = () => {
    switch (type) {
      case 'header':
      case 'footer':
        return 'horizontal';
      case 'sidebar':
        return 'vertical';
      case 'inline':
        return 'rectangle';
      default:
        return 'auto';
    }
  };

  return (
    <AdWrapper className={className}>
      <AdAnalytics adType={type} location={typeof window !== 'undefined' ? window.location.pathname : 'unknown'} />
      <AdSenseBanner 
        adSlot={getAdSlot()} 
        adFormat={getAdFormat()}
        className="w-full"
      />
    </AdWrapper>
  );
}
