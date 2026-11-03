import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  LANGUAGES,
  getStoredLanguage,
  isLanguage,
  storeLanguage,
} from './config';

describe('config', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('isLanguage', () => {
    it('accepts known languages', () => {
      for (const language of LANGUAGES) {
        expect(isLanguage(language)).toBe(true);
      }
    });

    it('rejects unknown values', () => {
      expect(isLanguage('xx')).toBe(false);
      expect(isLanguage(null)).toBe(false);
      expect(isLanguage(1)).toBe(false);
    });
  });

  describe('getStoredLanguage', () => {
    it('returns default when nothing stored', () => {
      expect(getStoredLanguage()).toBe(DEFAULT_LANGUAGE);
    });

    it('returns stored language', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ru');
      expect(getStoredLanguage()).toBe('ru');
    });

    it('falls back for invalid stored value', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'xx');
      expect(getStoredLanguage()).toBe(DEFAULT_LANGUAGE);
    });

    it('falls back when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(getStoredLanguage()).toBe(DEFAULT_LANGUAGE);
    });

    it('returns default when window is undefined', () => {
      vi.stubGlobal('window', undefined);
      expect(getStoredLanguage()).toBe(DEFAULT_LANGUAGE);
    });
  });

  describe('storeLanguage', () => {
    it('persists language', () => {
      storeLanguage('de');
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('de');
    });

    it('swallows localStorage errors', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(() => storeLanguage('fr')).not.toThrow();
    });
  });
});
