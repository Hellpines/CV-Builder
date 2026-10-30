import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './config';
import { i18n } from './i18n';
import { changeLanguage } from './languageStore';
import { useTranslation } from './useTranslation';

describe('useTranslation', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    void i18n.changeLanguage(DEFAULT_LANGUAGE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns default language and translates', () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.language).toBe(DEFAULT_LANGUAGE);
    expect(result.current.i18n).toBe(i18n);
    expect(result.current.t('common.cancel')).toBe('Cancel');
  });

  it('returns stored language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ru');
    const { result } = renderHook(() => useTranslation());

    expect(result.current.language).toBe('ru');
    expect(result.current.t('common.cancel')).toBe('Отмена');
  });

  it('updates when language changes', () => {
    const { result } = renderHook(() => useTranslation());

    act(() => {
      changeLanguage('de');
    });

    expect(result.current.language).toBe('de');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('de');
  });

  it('updates when storage event fires for language key', () => {
    const { result } = renderHook(() => useTranslation());

    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr');
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: LANGUAGE_STORAGE_KEY, newValue: 'fr' })
      );
    });

    expect(result.current.language).toBe('fr');
  });

  it('ignores storage events for other keys', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'es');
    const { result } = renderHook(() => useTranslation());

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: 'x' }));
    });

    expect(result.current.language).toBe('es');
  });

  it('shares updates across hook instances', () => {
    const first = renderHook(() => useTranslation());
    const second = renderHook(() => useTranslation());

    act(() => {
      changeLanguage('pt');
    });

    expect(first.result.current.language).toBe('pt');
    expect(second.result.current.language).toBe('pt');
  });

  it('uses default language as server snapshot', () => {
    function Probe() {
      const { language } = useTranslation();
      return createElement('span', null, language);
    }

    expect(renderToString(createElement(Probe))).toBe(`<span>${DEFAULT_LANGUAGE}</span>`);
  });
});
