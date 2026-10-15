'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import Sidebar from '@/components/layout/Sidebar';
import { AuthLoader } from '@/features/auth/ui/AuthLoader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!accessToken) {
      router.replace('/login');
    }
  }, [_hasHydrated, accessToken, router]);

  if (!_hasHydrated || !accessToken) {
    return <AuthLoader />;
  }

  return (
    <div className="bg-background flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
