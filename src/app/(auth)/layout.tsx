'use client';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { AuthLoader } from '@/features/auth/ui/AuthLoader';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { accessToken, user, _hasHydrated } = useAuthStore();

  const isVerified = Boolean(user?.is_verified);

  const redirectTo = !accessToken
    ? null
    : isVerified
      ? '/users'
      : pathname !== '/verify-email'
        ? '/verify-email'
        : null;

  useEffect(() => {
    if (_hasHydrated && redirectTo) {
      router.replace(redirectTo);
    }
  }, [_hasHydrated, redirectTo, router]);

  if (!_hasHydrated || redirectTo) {
    return <AuthLoader />;
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">{children}</div>
  );
}
