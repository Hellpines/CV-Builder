'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, FileUser, Languages, TrendingUp, Users } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
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
  const isDarkMode = useSyncExternalStore(subscribeToDarkMode, getDarkModeSnapshot, () => false);

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

  return (
    <div className="sticky top-0 z-2 h-screen shrink-0 self-start">
      <aside
        className={`relative h-full overflow-hidden transition-all duration-400 ${
          isOpen ? 'w-50' : 'w-14'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-4 p-4">
            <Image src={logoSrc} alt={t('sidebar.cvBuilderLogo')} width={24} height={24} />
            {isOpen && <h2 className="text-foreground text-lg whitespace-nowrap">CV Builder</h2>}
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, labelKey, Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href);
              const label = t(labelKey);

              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'flex cursor-pointer items-center gap-4 rounded-r-[200px] p-4 whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary-hover text-foreground'
                      : 'hover:bg-primary-hover hover:text-foreground',
                  ].join(' ')}
                >
                  <Icon className={isActive ? 'text-foreground' : ''} />
                  {isOpen ? <span>{label}</span> : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-16 left-0 w-50 px-2">
          <UserMenu isOpen={isOpen} />
        </div>
      </aside>

      <Button
        onClick={handleSidebar}
        variant="icon"
        className={[
          'absolute top-9 p-1 transition-all duration-400',
          isOpen ? '-right-4' : '-right-6',
        ].join(' ')}
        aria-label={isOpen ? t('sidebar.toggleClose') : t('sidebar.toggleOpen')}
      >
        {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </Button>
    </div>
  );
}
