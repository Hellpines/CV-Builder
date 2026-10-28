import {
  DEFAULT_LANGUAGE,
  getStoredLanguage,
  LANGUAGE_STORAGE_KEY,
  storeLanguage,
  type Language,
} from './config';
import { i18n } from './i18n';

const listeners = new Set<() => void>();

export function subscribeToLanguage(callback: () => void) {
  listeners.add(callback);

  const onStorage = (event: StorageEvent) => {
    if (event.key === LANGUAGE_STORAGE_KEY) callback();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

export const getLanguageSnapshot = getStoredLanguage;

export const getServerLanguageSnapshot = () => DEFAULT_LANGUAGE;

export function changeLanguage(language: Language) {
  storeLanguage(language);
  document.documentElement.lang = language;
  void i18n.changeLanguage(language);
  listeners.forEach((listener) => listener());
}
