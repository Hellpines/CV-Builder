'use client';

import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface AppLoaderProps {
  className?: string;
  size?: number;
}

export function AppLoader({ className, size = 72 }: AppLoaderProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-5 flex items-center justify-center bg-black/50">
      <Loader2
        size={size}
        className={['text-primary animate-spin', className].filter(Boolean).join(' ')}
        role="status"
        aria-label={t('common.loading')}
      />
    </div>
  );
}
