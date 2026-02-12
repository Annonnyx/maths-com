'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Providers = dynamic(() => import('@/components/Providers'), { ssr: true });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return <Providers>{children}</Providers>;
}
