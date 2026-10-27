'use client';

import { useEffect } from 'react';
import { applyTheme, getStoredTheme, THEME_STORAGE_KEY } from '@/shared/lib/theme';

export function ThemeSync() {
  useEffect(() => {
    const sync = () => applyTheme(getStoredTheme());
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) sync();
    };

    sync();
    media.addEventListener('change', sync);
    window.addEventListener('storage', onStorage);

    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return null;
}
