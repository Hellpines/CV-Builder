'use client';

import { useParams } from 'next/navigation';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Tabs } from '@/components/ui/tabs';

export function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const params = useParams();
  const id = params?.id as string;

  const base = `/users/${id}`;
  const tabs = [
    { href: base, label: t('nav.profile') },
    { href: `${base}/skills`, label: t('nav.skills') },
    { href: `${base}/languages`, label: t('nav.languages') },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <Tabs items={tabs} />
      {children}
    </div>
  );
}
