'use client';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (accessToken) {
      router.replace('/users');
    }
  }, [_hasHydrated, accessToken, router]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
