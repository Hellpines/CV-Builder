'use client';

import { useEffect, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { getStoredLanguage } from './config';
import { i18n } from './i18n';
import { subscribeToLanguage } from './languageStore';

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const apply = () => {
      const language = getStoredLanguage();
      document.documentElement.lang = language;
      if (i18n.language !== language) void i18n.changeLanguage(language);
    };

    apply();
    return subscribeToLanguage(apply);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
