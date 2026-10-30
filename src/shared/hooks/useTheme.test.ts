import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_THEME, THEME_STORAGE_KEY } from '@/shared/lib/theme';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns default theme when nothing stored', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(DEFAULT_THEME);
  });

  it('returns stored theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('setTheme persists, applies and notifies', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('updates when storage event fires for theme key', () => {
    const { result } = renderHook(() => useTheme());

    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'light' })
      );
    });

    expect(result.current.theme).toBe('light');
  });

  it('ignores storage events for other keys', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme());

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: 'x' }));
    });

    expect(result.current.theme).toBe('dark');
  });

  it('shares updates across hook instances', () => {
    const first = renderHook(() => useTheme());
    const second = renderHook(() => useTheme());

    act(() => {
      first.result.current.setTheme('light');
    });

    expect(first.result.current.theme).toBe('light');
    expect(second.result.current.theme).toBe('light');
  });

  it('uses default theme as server snapshot', () => {
    function Probe() {
      const { theme } = useTheme();
      return createElement('span', null, theme);
    }

    expect(renderToString(createElement(Probe))).toBe(`<span>${DEFAULT_THEME}</span>`);
  });
});
