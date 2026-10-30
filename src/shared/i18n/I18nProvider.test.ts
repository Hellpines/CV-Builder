import { act, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from './I18nProvider';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './config';
import { i18n } from './i18n';
import { changeLanguage } from './languageStore';

describe('I18nProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
    void i18n.changeLanguage(DEFAULT_LANGUAGE);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children', () => {
    render(createElement(I18nProvider, null, createElement('span', null, 'hello')));
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies stored language on mount', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'ru');

    render(createElement(I18nProvider, null, createElement('span', null, 'child')));

    await vi.waitFor(() => {
      expect(document.documentElement.lang).toBe('ru');
      expect(i18n.language).toBe('ru');
    });
  });

  it('skips i18n.changeLanguage when already in sync', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    void i18n.changeLanguage('en');
    const changeSpy = vi.spyOn(i18n, 'changeLanguage');

    render(createElement(I18nProvider, null, createElement('span', null, 'child')));

    await vi.waitFor(() => {
      expect(document.documentElement.lang).toBe('en');
    });
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('reapplies language when store notifies', async () => {
    render(createElement(I18nProvider, null, createElement('span', null, 'child')));

    await vi.waitFor(() => {
      expect(document.documentElement.lang).toBe(DEFAULT_LANGUAGE);
    });

    act(() => {
      changeLanguage('fr');
    });

    expect(document.documentElement.lang).toBe('fr');
    expect(i18n.language).toBe('fr');
  });

  it('unsubscribes on unmount', async () => {
    const { unmount } = render(
      createElement(I18nProvider, null, createElement('span', null, 'child'))
    );

    await vi.waitFor(() => {
      expect(document.documentElement.lang).toBe(DEFAULT_LANGUAGE);
    });

    unmount();
    document.documentElement.lang = 'xx';
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de');

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: LANGUAGE_STORAGE_KEY, newValue: 'de' })
      );
    });

    expect(document.documentElement.lang).toBe('xx');
  });
});
