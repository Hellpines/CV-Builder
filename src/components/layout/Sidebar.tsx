'use client';

import Image from 'next/image';
import Link from 'next/link';
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

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const handleOpenSidebar = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative min-h-screen">
      <aside
        className={`relative overflow-hidden transition-all duration-200 ${
          isOpen ? 'w-50' : 'w-0'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-4 p-4">
            <Image src="/icon.svg" alt="CV Builder Logo" width={24} height={24} />
            {isOpen && <h2 className="text-primary-bold text-lg">CV Builder</h2>}
          </div>

          {isOpen && (
            <nav className="space-y-2">
              <Link
                href="/employees"
                className="hover:bg-primary-hover hover:text-primary-bold flex cursor-pointer items-center gap-4 rounded-r-[200px] p-4"
              >
                <Users />
                <span>Employees</span>
              </Link>
              <Link
                href="/skills"
                className="hover:bg-primary-hover hover:text-primary-bold flex cursor-pointer items-center gap-4 rounded-r-[200px] p-4"
              >
                <TrendingUp />
                <span>Skills</span>
              </Link>
              <Link
                href="/languages"
                className="hover:bg-primary-hover hover:text-primary-bold flex cursor-pointer items-center gap-4 rounded-r-[200px] p-4"
              >
                <Languages />
                <span>Languages</span>
              </Link>
              <Link
                href="/cvs"
                className="hover:bg-primary-hover hover:text-primary-bold flex cursor-pointer items-center gap-4 rounded-r-[200px] p-4"
              >
                <FileUser />
                <span>CVs</span>
              </Link>
              <Link
                href="/settings"
                className="hover:bg-primary-hover hover:text-primary-bold flex cursor-pointer items-center gap-4 rounded-r-[200px] p-4"
              >
                <Settings />
                <span>Settings</span>
              </Link>
            </nav>
          )}
        </div>
      </aside>

      {!isOpen && (
        <button
          type="button"
          onClick={handleOpenSidebar}
          className="hover:bg-primary-hover/80 absolute top-1/2 left-4 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full"
          aria-label="Open sidebar"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="hover:bg-primary-hover/80 absolute top-10 -right-3.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
          aria-label="Hide sidebar"
        >
          <ChevronLeft size={24} />
        </button>
      )}
    </div>
  );
}
