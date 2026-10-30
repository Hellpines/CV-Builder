import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredTheme,
  resolveTheme,
  storeTheme,
} from './theme';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getStoredTheme', () => {
    it('returns default when nothing stored', () => {
      expect(getStoredTheme()).toBe(DEFAULT_THEME);
    });

    it('returns stored theme', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      expect(getStoredTheme()).toBe('dark');
    });

    it('falls back for invalid stored value', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'neon');
      expect(getStoredTheme()).toBe(DEFAULT_THEME);
    });

    it('falls back when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(getStoredTheme()).toBe(DEFAULT_THEME);
    });
  });

  describe('storeTheme', () => {
    it('persists theme', () => {
      storeTheme('light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });

    it('swallows localStorage errors', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(() => storeTheme('dark')).not.toThrow();
    });
  });

  describe('resolveTheme', () => {
    it('returns explicit themes as-is', () => {
      expect(resolveTheme('light')).toBe('light');
      expect(resolveTheme('dark')).toBe('dark');
    });

    it('resolves system via matchMedia', () => {
      window.matchMedia = vi.fn().mockImplementation(
        (query: string) =>
          ({
            matches: query.includes('dark'),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }) as MediaQueryList
      );

      expect(resolveTheme('system')).toBe('dark');
    });
  });

  describe('applyTheme', () => {
    it('toggles dark class and color-scheme', () => {
      applyTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.style.colorScheme).toBe('dark');

      applyTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.style.colorScheme).toBe('light');
    });
  });
});
