'use client';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { AuthLoader } from '@/features/auth/ui/AuthLoader';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (accessToken) {
      router.replace('/users');
    }
  }, [_hasHydrated, accessToken, router]);

  if (!_hasHydrated || accessToken) {
    return <AuthLoader />;
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">{children}</div>
  );
}
