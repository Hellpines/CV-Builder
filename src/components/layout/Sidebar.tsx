'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, FileUser, Languages, TrendingUp, Users } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { useIsCompact } from '@/shared/hooks/useIsCompact';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Button } from '../ui/button';
import { UserMenu } from './UserMenu';

function subscribeToDarkMode(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const root = document.documentElement;
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const onMediaChange = () => callback();
  const observer = new MutationObserver(() => callback());

  mediaQuery.addEventListener('change', onMediaChange);
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });

  return () => {
    mediaQuery.removeEventListener('change', onMediaChange);
    observer.disconnect();
  };
}

function getDarkModeSnapshot() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

export default function Sidebar() {
  const { t } = useTranslation();
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const pathname = usePathname();
  const isCompact = useIsCompact();
  const isDarkMode = useSyncExternalStore(subscribeToDarkMode, getDarkModeSnapshot, () => false);
  const isOpen = userOpen ?? !isCompact;
  const isOverlayOpen = isCompact && isOpen;

  const logoSrc = isDarkMode ? '/logo-light.svg' : '/logo-dark.svg';
  const navItems = [
    { href: '/users', labelKey: 'nav.employees', Icon: Users },
    { href: '/skills', labelKey: 'nav.skills', Icon: TrendingUp },
    { href: '/languages', labelKey: 'nav.languages', Icon: Languages },
    { href: '/cvs', labelKey: 'nav.cvs', Icon: FileUser },
  ] as const;

  const handleSidebar = () => {
    setUserOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isOverlayOpen) setUserOpen(false);
  };

  const layoutWidth = isCompact ? 'w-14' : isOpen ? 'w-50' : 'w-14';
  const panelWidth = isOpen ? 'w-50' : 'w-14';
  const labelClass = [
    'overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-400',
    isOpen ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0',
  ].join(' ');

  return (
    <>
      {isOverlayOpen ? (
        <button
          type="button"
          aria-label={t('sidebar.toggleClose')}
          className="fixed inset-0 z-2 cursor-default bg-black/50"
          onClick={closeSidebar}
        />
      ) : null}

      <div
        className={[
          'sticky top-0 z-3 h-screen shrink-0 self-start overflow-visible transition-[width] duration-400',
          layoutWidth,
        ].join(' ')}
      >
        <aside
          className={[
            'bg-background relative h-full min-w-0 transition-[width] duration-400',
            isOverlayOpen ? 'fixed top-0 left-0 z-3 h-screen shadow-md' : 'w-full',
            panelWidth,
          ].join(' ')}
        >
          <div className="h-full overflow-hidden">
            <div
              className={[
                'relative flex h-full flex-col transition-[width] duration-400',
                panelWidth,
              ].join(' ')}
            >
              <div className="flex items-center gap-4 overflow-hidden p-4">
                <Image
                  src={logoSrc}
                  alt={t('sidebar.cvBuilderLogo')}
                  width={24}
                  height={24}
                  className="shrink-0"
                />
                <h2 className={['text-foreground text-lg', labelClass].join(' ')}>CV Builder</h2>
              </div>

              <nav className="space-y-2">
                {navItems.map(({ href, labelKey, Icon }) => {
                  const isActive = pathname === href || pathname.startsWith(href);
                  const label = t(labelKey);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeSidebar}
                      className={[
                        'flex cursor-pointer items-center gap-4 overflow-hidden rounded-r-[200px] p-4 transition-colors',
                        isActive
                          ? 'bg-primary-hover text-nav-link-selected'
                          : 'text-nav-link hover:bg-primary-hover hover:text-nav-link-selected',
                      ].join(' ')}
                    >
                      <Icon className="shrink-0" />
                      <span className={labelClass}>{label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="absolute bottom-16 left-0 w-full overflow-hidden px-2">
                <UserMenu isOpen={isOpen} />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSidebar}
            variant="icon"
            className={[
              'absolute top-9 z-4 p-1 transition-all duration-400',
              isOpen ? 'bg-background -right-4' : '-right-6',
            ].join(' ')}
            aria-label={isOpen ? t('sidebar.toggleClose') : t('sidebar.toggleOpen')}
            aria-expanded={isOpen}
          >
            {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </Button>
        </aside>
      </div>
    </>
  );
}
