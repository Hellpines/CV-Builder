'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, User as UserIcon } from 'lucide-react';
import { useProfileUser } from '@/features/profile/model/useProfileUser';

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

function Separator() {
  return <ChevronRight size={10} className="text-muted shrink-0" />;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const { userData } = useProfileUser();

  const [section, id, tab] = pathname.split('/').filter(Boolean);
  const sectionLabel = sections[section];

  if (!sectionLabel) return null;

  const isUserPage = section === 'users' && Boolean(id);
  const profile = userData?.profile;
  const userName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    '…';

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-primary-foreground flex items-center gap-2 text-sm"
    >
      {isUserPage ? (
        <Link href="/users" className="hover:text-primary-bold transition-colors">
          {sectionLabel}
        </Link>
      ) : (
        <span>{sectionLabel}</span>
      )}

      {isUserPage && (
        <>
          <Separator />
          <Link href="/users" className="text-primary flex items-center gap-1.5 font-medium">
            <UserIcon size={16} />
            {userName}
          </Link>
          <Separator />
          <span>{userTabs[tab] ?? 'Profile'}</span>
        </>
      )}
    </nav>
  );
}
