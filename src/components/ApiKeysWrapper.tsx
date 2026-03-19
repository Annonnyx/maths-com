'use client';

import React from 'react';

interface ApiKeysWrapperProps {
  children: React.ReactNode;
}

export default function ApiKeysWrapper({ children }: ApiKeysWrapperProps) {
  return (
    <div className="w-full">
      <React.Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      }>
        {children}
      </React.Suspense>
    </div>
  );
}
