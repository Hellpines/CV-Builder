'use client';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { AuthLoader } from '@/features/auth/ui/AuthLoader';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { accessToken, user, _hasHydrated } = useAuthStore();

  const isVerifyEmailPage = pathname === '/verify-email';
  const isVerified = user?.is_verified === true;

  let redirectTo: string | null = null;

  if (_hasHydrated) {
    if (!accessToken && pathname !== '/login') {
      redirectTo = '/login';
    } else if (accessToken && isVerifyEmailPage && isVerified) {
      redirectTo = '/users';
    } else if (accessToken && !isVerifyEmailPage && pathname !== '/users') {
      redirectTo = '/users';
    }
  }

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  if (!_hasHydrated || redirectTo) {
    return <AuthLoader />;
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">{children}</div>
  );
}
