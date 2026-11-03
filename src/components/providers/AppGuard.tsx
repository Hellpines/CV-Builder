'use client';

import type { ReactNode } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ErrorScreen } from '@/components/ui/error-screen';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';

export function AppGuard({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isOnline = useOnlineStatus();

  let screen: ReactNode = null;

  if (isMobile) {
    screen = (
      <ErrorScreen
        title={t('errors.mobileTitle')}
        description={
          <>
            {t('errors.mobileDescription')}
            <br />
            {t('errors.mobileHint')}
          </>
        }
      />
    );
  } else if (!isOnline) {
    screen = (
      <ErrorScreen
        title={t('errors.networkTitle')}
        description={
          <>
            {t('errors.networkDescription')}
            <br />
            {t('errors.networkHint')}
          </>
        }
        actionLabel={t('common.retry')}
        onAction={() => {
          if (navigator.onLine) window.location.reload();
        }}
      />
    );
  }

  return (
    <>
      {children}
      {screen ? (
        <div className="bg-background fixed inset-0 z-7 overflow-auto">{screen}</div>
      ) : null}
    </>
  );
}
