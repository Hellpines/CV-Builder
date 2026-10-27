import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE, isLanguage, storeLanguage, type Language } from './config';

export function useLanguage() {
  const { i18n } = useTranslation();
  const language: Language = isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;

  const setLanguage = useCallback(
    (next: Language) => {
      storeLanguage(next);
      document.documentElement.lang = next;
      void i18n.changeLanguage(next);
    },
    [i18n]
  );

  return { language, setLanguage };
}
