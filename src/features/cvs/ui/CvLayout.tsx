'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Tabs } from '@/components/ui/tabs';
import { useCv } from '../model/useCv';

export function CvLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { cvId, cv, isOwner } = useCv();

  if (cv && !isOwner) notFound();

  const base = `/cvs/${cvId}`;
  const tabs = [
    { href: base, label: t('nav.details') },
    { href: `${base}/skills`, label: t('nav.skills') },
    { href: `${base}/projects`, label: t('nav.projects') },
    { href: `${base}/preview`, label: t('nav.preview') },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <Tabs items={tabs} />
      {children}
    </div>
  );
}
