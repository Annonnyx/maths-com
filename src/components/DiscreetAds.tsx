'use client';

import { CornerAd, MobileCornerAd } from './CornerAd';

interface DiscreetAdsProps {
  showAds?: boolean;
}

export function DiscreetAds({ showAds = true }: DiscreetAdsProps) {
  if (!showAds) {
    return null;
  }

  return (
    <>
      {/* Pubs desktop - coins discrets */}
      <div className="hidden md:block">
        <CornerAd position="top-right" />
        <CornerAd position="bottom-left" />
      </div>

      {/* Pubs mobiles - plus petites et plus tardives */}
      <div className="md:hidden">
        <MobileCornerAd position="top-right" />
      </div>

      {/* Pub flottante basse (uniquement sur desktop) */}
      <div className="hidden lg:block">
        <div className="fixed bottom-4 right-4 z-30 opacity-80 hover:opacity-100 transition-opacity">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            <div className="text-xs text-gray-400 mb-1">Publicité</div>
            {/* Petite pub rectangulaire */}
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '200px', height: '90px' }}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
              data-ad-format="rectangle"
            />
          </div>
        </div>
      </div>
    </>
  );
}
