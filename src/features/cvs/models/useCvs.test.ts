import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, skipToken, authState } = vi.hoisted(() => ({
  useQuery: vi.fn(),
  skipToken: Symbol('skipToken'),
  authState: {
    user: { id: 'auth-user', email: 'user@example.com' } as {
      id: string;
      email: string;
    } | null,
  },
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQuery(...args),
  skipToken,
}));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));

import { GET_USER_CVS } from '../api/CvQueries';
import { useCvs } from './useCvs';

describe('useCvs', () => {
  const refetch = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    authState.user = { id: 'auth-user', email: 'user@example.com' };
    useQuery.mockReset();
    refetch.mockReset();
    useQuery.mockReturnValue({
      data: undefined,
      previousData: undefined,
      loading: false,
      error: undefined,
      refetch,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('skips the query when there is no user', () => {
    authState.user = null;
    const { result } = renderHook(() => useCvs());

    expect(useQuery).toHaveBeenCalledWith(GET_USER_CVS, skipToken);
    expect(result.current.email).toBeUndefined();
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.totalPages).toBe(1);
  });

  it('queries with default pagination and sort', () => {
    const { result } = renderHook(() => useCvs());

    expect(result.current.email).toBe('user@example.com');
    expect(useQuery).toHaveBeenCalledWith(GET_USER_CVS, {
      variables: {
        userId: 'auth-user',
        params: {
          search: undefined,
          page: 1,
          limit: 10,
          sort_by: 'name',
          sort_order: 'asc',
        },
      },
      fetchPolicy: 'cache-and-network',
    });
  });

  it('maps result data and previousData fallback', () => {
    useQuery.mockReturnValue({
      data: {
        cvsByUserId: {
          items: [{ id: '1', name: 'A' }],
          total: 1,
          total_pages: 1,
        },
      },
      previousData: undefined,
      loading: false,
      error: undefined,
      refetch,
    });

    const { result, rerender } = renderHook(() => useCvs());
    expect(result.current.items).toEqual([{ id: '1', name: 'A' }]);
    expect(result.current.total).toBe(1);
    expect(result.current.initialLoading).toBe(false);

    useQuery.mockReturnValue({
      data: undefined,
      previousData: {
        cvsByUserId: {
          items: [{ id: '2', name: 'B' }],
          total: 5,
          total_pages: 2,
        },
      },
      loading: true,
      error: undefined,
      refetch,
    });
    rerender();

    expect(result.current.items).toEqual([{ id: '2', name: 'B' }]);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.initialLoading).toBe(false);
  });

  it('treats loading without result as initialLoading', () => {
    useQuery.mockReturnValue({
      data: undefined,
      previousData: undefined,
      loading: true,
      error: undefined,
      refetch,
    });

    const { result } = renderHook(() => useCvs());
    expect(result.current.initialLoading).toBe(true);
  });

  it('debounces search and resets page', () => {
    const { result } = renderHook(() => useCvs());

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.setSearch('  alpha  ');
    });

    expect(result.current.search).toBe('  alpha  ');
    expect(result.current.page).toBe(1);
    expect(result.current.isSearching).toBe(false);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isSearching).toBe(true);
    expect(useQuery).toHaveBeenLastCalledWith(
      GET_USER_CVS,
      expect.objectContaining({
        variables: expect.objectContaining({
          params: expect.objectContaining({ search: 'alpha', page: 1 }),
        }),
      })
    );
  });

  it('setLimit resets page', () => {
    const { result } = renderHook(() => useCvs());

    act(() => {
      result.current.setPage(2);
      result.current.setLimit(25);
    });

    expect(result.current.limit).toBe(25);
    expect(result.current.page).toBe(1);
  });

  it('toggleSort flips direction and resets page', () => {
    const { result } = renderHook(() => useCvs());

    act(() => {
      result.current.setPage(2);
      result.current.toggleSort();
    });

    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.page).toBe(1);

    act(() => {
      result.current.toggleSort();
    });
    expect(result.current.sortDirection).toBe('asc');
  });

  it('swallows refetch rejection', async () => {
    refetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useCvs());

    await expect(result.current.refetch()).resolves.toBeUndefined();
  });
});
