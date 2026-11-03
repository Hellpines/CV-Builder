import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello'));
    expect(result.current).toBe('hello');
  });

  it('updates after default delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('b');
  });

  it('respects custom delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 1, delay: 500 },
    });

    rerender({ value: 2, delay: 500 });

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(2);
  });

  it('keeps only the latest value when updates arrive before delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: 'one' },
    });

    rerender({ value: 'two' });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'three' });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('three');
  });
});
