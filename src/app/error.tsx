'use client';

import { useEffect } from 'react';
import { ErrorScreen } from '@/components/ui/error-screen';
import { useTranslation } from '@/shared/i18n/useTranslation';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      title={t('errors.genericTitle')}
      description={
        <>
          {t('errors.genericDescription')}
          <br />
          {t('errors.genericHint')}
        </>
      }
      actionLabel={t('common.retry')}
      onAction={reset}
    />
  );
}
