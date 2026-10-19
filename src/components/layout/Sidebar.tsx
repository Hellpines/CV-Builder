'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  FileUser,
  Languages,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { UserMenu } from './UserMenu';

const navItems = [
  { href: '/users', label: 'Employees', Icon: Users },
  { href: '/skills', label: 'Skills', Icon: TrendingUp },
  { href: '/languages', label: 'Languages', Icon: Languages },
  { href: '/cvs', label: 'CVs', Icon: FileUser },
  { href: '/settings', label: 'Settings', Icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const handleSidebar = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <div className="relative min-h-screen">
      <aside
        className={`relative min-h-full overflow-hidden transition-all duration-400 ${
          isOpen ? 'w-50' : 'w-0'
        }`}
      >
        <div className="flex h-full min-w-50 flex-col">
          <div className="flex items-center gap-4 p-4">
            <Image src="/icon.svg" alt="CV Builder Logo" width={24} height={24} />
            <h2 className="text-primary-bold text-lg whitespace-nowrap">CV Builder</h2>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, label, Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'flex cursor-pointer items-center gap-4 rounded-r-[200px] p-4 whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary-hover text-primary-bold'
                      : 'hover:bg-primary-hover hover:text-primary-bold',
                  ].join(' ')}
                >
                  <Icon className={isActive ? 'text-primary-bold' : ''} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-16 left-0 w-50">
          <UserMenu />
        </div>
      </aside>

      <Button
        onClick={handleSidebar}
        variant="icon"
        className={[
          'absolute top-9 p-1 transition-all duration-400',
          isOpen ? '-right-4' : '-right-9',
        ].join(' ')}
        aria-label={isOpen ? 'Hide sidebar' : 'Open sidebar'}
      >
        {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </Button>
    </div>
  );
}
