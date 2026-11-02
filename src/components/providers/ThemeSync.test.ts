import { createElement as h } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from '@/shared/lib/theme';
import { ThemeSync } from './ThemeSync';

const mediaListeners = new Set<() => void>();
const storageListeners = new Set<EventListener>();

function mockMatchMedia(matches = false) {
  mediaListeners.clear();

  window.matchMedia = vi.fn().mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (_event: string, callback: () => void) => {
          mediaListeners.add(callback);
        },
        removeEventListener: (_event: string, callback: () => void) => {
          mediaListeners.delete(callback);
        },
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList
  );
}

describe('ThemeSync', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    mockMatchMedia(false);

    const originalAdd = window.addEventListener.bind(window);
    const originalRemove = window.removeEventListener.bind(window);
    storageListeners.clear();

    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
      if (type === 'storage') {
        storageListeners.add(listener as EventListener);
      }
      return originalAdd(type, listener, options);
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation((type, listener, options) => {
      if (type === 'storage') {
        storageListeners.delete(listener as EventListener);
      }
      return originalRemove(type, listener, options);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
  });

  it('renders nothing and applies stored theme on mount', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    const { container } = render(h(ThemeSync));

    expect(container.firstChild).toBeNull();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('reapplies theme when prefers-color-scheme changes', () => {
    let matches = false;
    mediaListeners.clear();
    window.matchMedia = vi.fn().mockImplementation(
      (query: string) =>
        ({
          get matches() {
            return matches;
          },
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: (_event: string, callback: () => void) => {
            mediaListeners.add(callback);
          },
          removeEventListener: (_event: string, callback: () => void) => {
            mediaListeners.delete(callback);
          },
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList
    );

    localStorage.setItem(THEME_STORAGE_KEY, 'system');
    render(h(ThemeSync));

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => {
      matches = true;
      mediaListeners.forEach((listener) => listener());
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('reapplies theme on matching storage events', () => {
    render(h(ThemeSync));
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'dark' })
      );
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('ignores storage events for other keys', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    render(h(ThemeSync));

    document.documentElement.classList.add('dark');
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: 'dark' }));
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes media and storage listeners on unmount', () => {
    const { unmount } = render(h(ThemeSync));
    expect(mediaListeners.size).toBe(1);
    expect(storageListeners.size).toBe(1);

    unmount();

    expect(mediaListeners.size).toBe(0);
    expect(storageListeners.size).toBe(0);
  });
});
