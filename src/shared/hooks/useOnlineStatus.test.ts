import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { useOnlineStatus } from './useOnlineStatus';

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: () => value,
  });
}

describe('useOnlineStatus', () => {
  afterEach(() => {
    setOnline(true);
  });

  it('returns current navigator.onLine', () => {
    setOnline(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    setOnline(false);
    const offline = renderHook(() => useOnlineStatus());
    expect(offline.result.current).toBe(false);
  });

  it('reacts to online and offline events', () => {
    setOnline(true);
    const { result } = renderHook(() => useOnlineStatus());

    setOnline(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    setOnline(true);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });

  it('uses online as server snapshot', () => {
    function Probe() {
      return createElement('span', null, String(useOnlineStatus()));
    }

    expect(renderToString(createElement(Probe))).toBe('<span>true</span>');
  });
});
