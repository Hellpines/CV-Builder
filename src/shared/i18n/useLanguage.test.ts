import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './config';
import { i18n } from './i18n';
import { useLanguage } from './useLanguage';

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    void i18n.changeLanguage(DEFAULT_LANGUAGE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns default language when nothing stored', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe(DEFAULT_LANGUAGE);
  });

  it('returns stored language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'it');
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe('it');
  });

  it('setLanguage persists, applies and notifies', () => {
    const { result } = renderHook(() => useLanguage());

    act(() => {
      result.current.setLanguage('uk');
    });

    expect(result.current.language).toBe('uk');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('uk');
    expect(document.documentElement.lang).toBe('uk');
    expect(i18n.language).toBe('uk');
  });

  it('shares updates across hook instances', () => {
    const first = renderHook(() => useLanguage());
    const second = renderHook(() => useLanguage());

    act(() => {
      first.result.current.setLanguage('pl');
    });

    expect(first.result.current.language).toBe('pl');
    expect(second.result.current.language).toBe('pl');
  });
});
