'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';

export function LanguagesPage() {
  const { t } = useTranslation();
  return <div className="text-foregroundt-6">{t('nav.languages')}</div>;
}
