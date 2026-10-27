export const LANGUAGES = ['en', 'fr', 'de', 'it', 'pl', 'pt', 'ru', 'es', 'uk'] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';
export const LANGUAGE_STORAGE_KEY = 'language';

export const isLanguage = (value: unknown): value is Language =>
  LANGUAGES.includes(value as Language);

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function storeLanguage(language: Language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {}
}
