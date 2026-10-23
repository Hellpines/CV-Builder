'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Tabs } from '@/components/ui/tabs';
import { useCv } from '../model/useCv';

export function CvLayout({ children }: { children: ReactNode }) {
  const { cvId, cv, isOwner } = useCv();

  if (cv && !isOwner) notFound();

  const base = `/cvs/${cvId}`;
  const tabs = [
    { href: base, label: 'DETAILS' },
    { href: `${base}/skills`, label: 'SKILLS' },
    { href: `${base}/projects`, label: 'PROJECTS' },
    { href: `${base}/preview`, label: 'PREVIEW' },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <Tabs items={tabs} className="gap-8" />
      {children}
    </div>
  );
}
