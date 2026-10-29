'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import Sidebar from '@/components/layout/Sidebar';
import { AppLoader } from '@/components/ui/app-loader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const showLoader = !hasHydrated || !accessToken;

  useEffect(() => {
    const finish = () => useAuthStore.setState({ _hasHydrated: true });

    if (useAuthStore.persist.hasHydrated()) {
      finish();
      return;
    }

    return useAuthStore.persist.onFinishHydration(finish);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!accessToken) {
      router.replace('/login');
    }
  }, [hasHydrated, accessToken, router]);

  return (
    <div className="bg-background flex min-h-screen w-full">
      {showLoader && <AppLoader />}
      <Sidebar />
      <main className="min-w-0 flex-1 p-5 pb-1.5 max-[900px]:px-3 max-[900px]:pt-3">
        <Breadcrumbs />
        <div className="mt-4">{hasHydrated && accessToken ? children : null}</div>
      </main>
    </div>
  );
}
