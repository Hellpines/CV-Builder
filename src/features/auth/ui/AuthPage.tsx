'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { AuthPageProps } from '../types/AuthTypes';
import { Tabs } from '@/components/ui/tabs';

export function AuthPage({
  title,
  type = 'sign',
  subtitle,
  onSubmit,
  children,
  submitButton,
  footer,
}: AuthPageProps) {
  const { t } = useTranslation();

  const tabs = [
    { href: '/login', label: t('auth.signIn').toUpperCase() },
    { href: '/register', label: t('auth.signUp').toUpperCase() },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      {type === 'sign' ? (
        <div className="pt-6">
          <Tabs
            items={tabs}
            className="mx-auto w-full max-w-140 justify-center"
            tabClassName="pb-4"
            inactiveClassName="text-primary-foreground"
          />
        </div>
      ) : null}

      <div className="flex flex-1 items-center justify-center px-4 pb-8">
        <div className="w-full max-w-140">
          <div className="mb-10.5 text-center">
            <h1 className="text-foreground mb-6 text-4xl font-normal">{title}</h1>
            <p className="text-md text-foreground">{subtitle}</p>
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
