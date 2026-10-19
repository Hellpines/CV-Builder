'use client';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { AuthLoader } from '@/features/auth/ui/AuthLoader';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { accessToken, user, verificationRequested, _hasHydrated } = useAuthStore();

  const isVerified = user?.is_verified === true;
  const canVerify = verificationRequested && !isVerified;

  let redirectTo: string | null = null;

  if (_hasHydrated) {
    if (!accessToken) {
      if (!PUBLIC_PATHS.includes(pathname)) redirectTo = '/login';
    } else if (pathname === '/verify-email') {
      if (!canVerify) redirectTo = '/users';
    } else {
      redirectTo = canVerify ? '/verify-email' : '/users';
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
