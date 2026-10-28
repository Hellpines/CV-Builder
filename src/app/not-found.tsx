'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ErrorScreen } from '@/components/ui/error-screen';

export default function NotFound() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/users');
  };

  return (
    <ErrorScreen
      title={t('errors.notFoundTitle')}
      description={
        <>
          {t('errors.notFoundDescription')}
          <br />
          {t('errors.notFoundHint')}
        </>
      }
      actionLabel={t('common.goBack')}
      onAction={handleBack}
    />
  );
}
