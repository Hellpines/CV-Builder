import { useMemo, useSyncExternalStore } from 'react';
import { i18n } from './i18n';
import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeToLanguage,
} from './languageStore';

export function useTranslation() {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot
  );
  const t = useMemo(() => i18n.getFixedT(language), [language]);

  return { t, i18n, language };
}
