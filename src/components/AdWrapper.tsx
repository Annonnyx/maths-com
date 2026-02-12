'use client';

import { useState, useEffect, ReactNode } from 'react';

interface AdWrapperProps {
  children: ReactNode;
  className?: string;
  showAdBlockMessage?: boolean;
}

export function AdWrapper({ children, className = "", showAdBlockMessage = true }: AdWrapperProps) {
  const [hasAdBlock, setHasAdBlock] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAdBlock = () => {
      try {
        // Créer une fausse pub pour tester les ad-blockers
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad';
        testAd.style.cssText = 'position: absolute; top: -10px; left: -10px; width: 1px; height: 1px; visibility: hidden;';
        
        document.body.appendChild(testAd);
        
        setTimeout(() => {
          const isBlocked = testAd.offsetHeight === 0;
          setHasAdBlock(isBlocked);
          setChecked(true);
          document.body.removeChild(testAd);
        }, 100);
      } catch (error) {
        setHasAdBlock(true);
        setChecked(true);
      }
    };

    if (typeof window !== 'undefined') {
      checkAdBlock();
    }
  }, []);

  if (!checked) {
    return <div className={className}>{children}</div>;
  }

  if (hasAdBlock && showAdBlockMessage) {
    return (
      <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 text-yellow-800 p-4 rounded-xl ${className}`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">🚫</div>
          <div>
            <p className="font-semibold text-sm">S'il te plaît, désactive ton ad-blocker !</p>
            <p className="text-xs mt-1">Les publicités aident à maintenir Maths.com gratuit</p>
          </div>
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
