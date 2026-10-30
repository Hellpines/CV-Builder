import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './config';
import { i18n } from './i18n';
import {
  changeLanguage,
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeToLanguage,
} from './languageStore';

describe('languageStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    void i18n.changeLanguage(DEFAULT_LANGUAGE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getLanguageSnapshot reads stored language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'uk');
    expect(getLanguageSnapshot()).toBe('uk');
  });

  it('getServerLanguageSnapshot returns default', () => {
    expect(getServerLanguageSnapshot()).toBe(DEFAULT_LANGUAGE);
  });

  it('changeLanguage persists, sets document lang and updates i18n', () => {
    changeLanguage('ru');

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
    expect(i18n.language).toBe('ru');
  });

  it('notifies subscribers on changeLanguage', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToLanguage(listener);

    changeLanguage('pl');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    changeLanguage('es');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies on storage events for language key', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToLanguage(listener);

    window.dispatchEvent(
      new StorageEvent('storage', { key: LANGUAGE_STORAGE_KEY, newValue: 'it' })
    );
    expect(listener).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: 'x' }));
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('removes storage listener on unsubscribe', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const unsubscribe = subscribeToLanguage(vi.fn());

    unsubscribe();

    expect(removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
  });
});
