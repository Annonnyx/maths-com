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
        return '1234567890'; // Slot réel pour header
      case 'sidebar':
        return '0987654321'; // Slot réel pour sidebar
      case 'footer':
        return '5678901234'; // Slot réel pour footer
      case 'inline':
        return '3456789012'; // Slot réel pour inline
      default:
        return '3456789012';
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
