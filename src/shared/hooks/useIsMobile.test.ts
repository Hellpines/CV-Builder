import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useIsMobile } from './useIsMobile';

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<() => void>();

  const mql = {
    get matches() {
      return matches;
    },
    media: '(max-width: 767px)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_type: string, listener: EventListener) => {
      listeners.add(listener as () => void);
    }),
    removeEventListener: vi.fn((_type: string, listener: EventListener) => {
      listeners.delete(listener as () => void);
    }),
    dispatchEvent: vi.fn(),
  } as MediaQueryList;

  window.matchMedia = vi.fn().mockImplementation(() => mql);

  return {
    setMatches(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

describe('useIsMobile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when viewport matches mobile query', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false when viewport does not match', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('updates when media query changes', () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      media.setMatches(true);
    });
    expect(result.current).toBe(true);

    act(() => {
      media.setMatches(false);
    });
    expect(result.current).toBe(false);
  });

  it('removes media listener on unmount', () => {
    const media = mockMatchMedia(false);
    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(() => {
      act(() => {
        media.setMatches(true);
      });
    }).not.toThrow();
  });

  it('returns false on the server', () => {
    function Probe() {
      return createElement('span', null, String(useIsMobile()));
    }

    expect(renderToString(createElement(Probe))).toBe('<span>false</span>');
  });
});
