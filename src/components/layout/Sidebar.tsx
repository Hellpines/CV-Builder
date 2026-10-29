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
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const isCompact = useIsCompact();
  const isDarkMode = useSyncExternalStore(subscribeToDarkMode, getDarkModeSnapshot, () => false);

  const showLabels = isOpen && !isCompact;
  const isFullyHidden = isCompact && !isOpen;

  const logoSrc = isDarkMode ? '/logo-light.svg' : '/logo-dark.svg';
  const navItems = [
    { href: '/users', labelKey: 'nav.employees', Icon: Users },
    { href: '/skills', labelKey: 'nav.skills', Icon: TrendingUp },
    { href: '/languages', labelKey: 'nav.languages', Icon: Languages },
    { href: '/cvs', labelKey: 'nav.cvs', Icon: FileUser },
  ] as const;

  const handleSidebar = () => {
    setIsOpen((prevState) => !prevState);
  };

  const sidebarWidth = isCompact ? (isOpen ? 'w-14' : 'w-0') : isOpen ? 'w-50' : 'w-14';

  const togglePosition = isFullyHidden ? 'left-0' : isOpen ? '-right-4' : '-right-6';

  return (
    <div
      className={[
        'sticky top-0 z-2 h-screen shrink-0 self-start overflow-visible transition-[width] duration-400',
        sidebarWidth,
      ].join(' ')}
    >
      <aside
        className={[
          'relative h-full w-full min-w-0 overflow-hidden transition-opacity duration-400',
          isFullyHidden ? 'pointer-events-none opacity-0' : 'opacity-100',
        ].join(' ')}
        aria-hidden={isFullyHidden}
      >
        <div className={`flex h-full flex-col ${showLabels ? 'w-50' : 'w-14'}`}>
          <div className="flex items-center gap-4 p-4">
            <Image src={logoSrc} alt={t('sidebar.cvBuilderLogo')} width={24} height={24} />
            {showLabels && (
              <h2 className="text-foreground text-lg whitespace-nowrap">CV Builder</h2>
            )}
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, labelKey, Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href);
              const label = t(labelKey);

              return (
                <Link
                  key={href}
                  href={href}
                  tabIndex={isFullyHidden ? -1 : undefined}
                  className={[
                    'flex cursor-pointer items-center gap-4 rounded-r-[200px] p-4 whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary-hover text-foreground'
                      : 'hover:bg-primary-hover hover:text-foreground',
                  ].join(' ')}
                >
                  <Icon className={isActive ? 'text-foreground' : ''} />
                  {showLabels ? <span>{label}</span> : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-16 left-0 w-50 px-2">
          <UserMenu isOpen={showLabels} />
        </div>
      </aside>

      <Button
        onClick={handleSidebar}
        variant="icon"
        className={['absolute top-9 z-1 p-1 transition-all duration-400', togglePosition].join(' ')}
        aria-label={isOpen ? t('sidebar.toggleClose') : t('sidebar.toggleOpen')}
        aria-expanded={isOpen}
      >
        {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </Button>
    </div>
  );
}
