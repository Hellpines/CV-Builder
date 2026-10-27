'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, User as UserIcon } from 'lucide-react';
import { useProfileUser } from '@/features/profile/model/useProfileUser';
import { useCv } from '@/features/cvs/model/useCv';

const sections: Record<string, string> = {
  users: 'Employees',
  skills: 'Skills',
  languages: 'Languages',
  cvs: 'CVs',
  settings: 'Settings',
};

const userTabs: Record<string, string> = {
  skills: 'Skills',
  languages: 'Languages',
};

const cvTabs: Record<string, string> = {
  skills: 'Skills',
  projects: 'Projects',
  preview: 'Preview',
};

function Separator() {
  return <ChevronRight size={10} className="text-muted shrink-0" />;
}

function UserCrumbs({ tab }: { tab?: string }) {
  const { userData } = useProfileUser();

  const profile = userData?.profile;
  const userName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    '…';

  return (
    <>
      <Separator />
      <Link href="/users" className="text-primary flex items-center gap-1.5 font-medium">
        <UserIcon size={16} />
        {userName}
      </Link>
      <Separator />
      <span>{(tab && userTabs[tab]) ?? 'Profile'}</span>
    </>
  );
}

function CvCrumbs({ id, tab }: { id: string; tab?: string }) {
  const { cv } = useCv();

  return (
    <>
      <Separator />
      <Link
        href={`/cvs/${id}`}
        className="text-primary max-w-xs min-w-0 truncate font-medium capitalize sm:max-w-md"
      >
        {cv?.name ?? '…'}
      </Link>
      <Separator />
      <span>{(tab && cvTabs[tab]) ?? 'Details'}</span>
    </>
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();

  const [section, id, tab] = pathname.split('/').filter(Boolean);
  const sectionLabel = sections[section];

  if (!sectionLabel) return null;

  const isUserPage = section === 'users' && Boolean(id);
  const isCvPage = section === 'cvs' && Boolean(id);

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-primary-foreground flex items-center gap-2 px-2 py-4 text-sm"
    >
      {isUserPage || isCvPage ? (
        <Link
          href={isUserPage ? '/users' : '/cvs'}
          className="hover:text-foreground transition-colors"
        >
          {sectionLabel}
        </Link>
      ) : (
        <span>{sectionLabel}</span>
      )}

      {isUserPage && <UserCrumbs tab={tab} />}
      {isCvPage && <CvCrumbs id={id} tab={tab} />}
    </nav>
  );
}
