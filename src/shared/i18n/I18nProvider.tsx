'use client';

import { useEffect, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { getStoredLanguage, isLanguage, LANGUAGE_STORAGE_KEY } from './config';
import { i18n } from './i18n';

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const sync = (language = getStoredLanguage()) => {
      if (language !== i18n.language) void i18n.changeLanguage(language);
      document.documentElement.lang = language;
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === LANGUAGE_STORAGE_KEY && isLanguage(event.newValue)) sync(event.newValue);
    };

    sync();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
