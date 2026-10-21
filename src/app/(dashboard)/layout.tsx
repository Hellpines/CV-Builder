'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import Sidebar from '@/components/layout/Sidebar';
import { AuthLoader } from '@/features/auth/ui/AuthLoader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!accessToken) {
      router.replace('/login');
    }
  }, [_hasHydrated, accessToken, router]);

  const showLoader = !_hasHydrated || !accessToken;

  return (
    <div className="bg-background flex min-h-screen w-full">
      {showLoader && <AuthLoader />}
      <Sidebar />
      <main className="flex-1 p-5 pb-1.5">
        <Breadcrumbs />
        <div className="mt-4">{children}</div>
      </main>
    </div>
  );
}
