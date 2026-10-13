'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthPageProps } from '../types/AuthTypes';

const tabs = [
  { href: '/login', label: 'SIGN IN' },
  { href: '/register', label: 'SIGN UP' },
];

export function AuthPage({
  title,
  subtitle,
  onSubmit,
  children,
  submitButton,
  footer,
}: AuthPageProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="pt-6">
        <div className="mx-auto flex w-full max-w-140 justify-center text-sm font-medium">
          {tabs.map(({ href, label }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex w-37.5 justify-center pb-4 transition-colors',
                  isActive
                    ? 'border-primary text-primary border-b-2 font-semibold'
                    : 'text-primary-text hover:text-primary',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <div className="w-full max-w-140">
          <div className="mb-10.5 text-center">
            <h1 className="text-primary-bold mb-6 text-4xl font-normal">{title}</h1>
            <p className="text-md text-primary-bold">{subtitle}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-9">
            {children}

            <div className="flex justify-center pt-4">{submitButton}</div>
          </form>

          {footer && <div className="mt-2 text-center">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
