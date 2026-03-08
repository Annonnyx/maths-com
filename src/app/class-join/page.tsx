'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ClassJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      // Rediriger vers class-groups avec le code
      router.push(`/class-groups?code=${code}`);
    } else {
      // Rediriger vers class-groups sans code
      router.push('/class-groups');
    }
  }, [router, code]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirection en cours...</p>
      </div>
    </div>
  );
}

export default function ClassJoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <ClassJoinContent />
    </Suspense>
  );
}
