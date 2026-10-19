'use client';

import { useParams } from 'next/navigation';
import { Tabs } from '@/components/ui/tabs';

export function ProfileLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = params?.id as string;

  const base = `/users/${id}`;
  const tabs = [
    { href: base, label: 'PROFILE' },
    { href: `${base}/skills`, label: 'SKILLS' },
    { href: `${base}/languages`, label: 'LANGUAGES' },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <Tabs items={tabs} />
      {children}
    </div>
  );
}
