'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/useAuthStore';

export default function Page() {
  const router = useRouter();
  const { accessToken, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    router.replace(accessToken ? '/users' : '/login');
  }, [accessToken, _hasHydrated, router]);

  return null;
}
