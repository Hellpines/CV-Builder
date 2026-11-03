import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, skipToken } = vi.hoisted(() => ({
  useQuery: vi.fn(),
  skipToken: Symbol('skipToken'),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQuery(...args),
  skipToken,
}));

import { GET_CV_PROJECTS } from '../api/CvProjectQueries';
import { useCvProjects } from './useCvProjects';

const projects = [
  {
    id: '1',
    name: 'Alpha Bank',
    domain: 'FinTech',
    start_date: '2021-01-01',
    end_date: '2022-01-01',
  },
  {
    id: '2',
    name: 'Beta Health',
    domain: 'Healthcare',
    start_date: '2019-06-01',
    end_date: null,
  },
  {
    id: '3',
    name: 'Gamma Shop',
    domain: 'Retail',
    start_date: '2020-03-01',
    end_date: '2020-12-01',
  },
];

describe('useCvProjects', () => {
  const refetch = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    useQuery.mockReset();
    refetch.mockReset();
    useQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
      refetch,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('skips the query when cvId is missing', () => {
    renderHook(() => useCvProjects());
    expect(useQuery).toHaveBeenCalledWith(GET_CV_PROJECTS, skipToken);
  });

  it('queries projects by cvId', () => {
    renderHook(() => useCvProjects('cv-1'));
    expect(useQuery).toHaveBeenCalledWith(GET_CV_PROJECTS, {
      variables: { cvId: 'cv-1' },
      fetchPolicy: 'cache-and-network',
    });
  });

  it('returns empty items without data and tracks initialLoading', () => {
    useQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch,
    });

    const { result } = renderHook(() => useCvProjects('cv-1'));

    expect(result.current.allItems).toEqual([]);
    expect(result.current.items).toEqual([]);
    expect(result.current.initialLoading).toBe(true);
  });

  it('debounces search and filters by name or domain', () => {
    useQuery.mockReturnValue({
      data: { cv: { projects } },
      loading: false,
      error: undefined,
      refetch,
    });

    const { result } = renderHook(() => useCvProjects('cv-1'));

    act(() => {
      result.current.setSearch('  health  ');
    });

    expect(result.current.search).toBe('  health  ');
    expect(result.current.isSearching).toBe(false);
    expect(result.current.items.map((item) => item.id)).toEqual(['1', '2', '3']);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isSearching).toBe(true);
    expect(result.current.items.map((item) => item.id)).toEqual(['2']);

    act(() => {
      result.current.setSearch('fin');
    });
    expect(result.current.items.map((item) => item.id)).toEqual(['2']);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.items.map((item) => item.id)).toEqual(['1']);
  });

  it('sorts by name asc then desc on toggle', () => {
    useQuery.mockReturnValue({
      data: { cv: { projects } },
      loading: false,
      error: undefined,
      refetch,
    });

    const { result } = renderHook(() => useCvProjects('cv-1'));

    act(() => {
      result.current.toggleSort('name');
    });
    expect(result.current.sortKey).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.items.map((item) => item.name)).toEqual([
      'Alpha Bank',
      'Beta Health',
      'Gamma Shop',
    ]);

    act(() => {
      result.current.toggleSort('name');
    });
    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.items.map((item) => item.name)).toEqual([
      'Gamma Shop',
      'Beta Health',
      'Alpha Bank',
    ]);
  });

  it('sorts by startDate', () => {
    useQuery.mockReturnValue({
      data: { cv: { projects } },
      loading: false,
      error: undefined,
      refetch,
    });

    const { result } = renderHook(() => useCvProjects('cv-1'));

    act(() => {
      result.current.toggleSort('startDate');
    });

    expect(result.current.items.map((item) => item.id)).toEqual(['2', '3', '1']);
  });

  it('sorts by endDate and puts null ends last in asc', () => {
    useQuery.mockReturnValue({
      data: { cv: { projects } },
      loading: false,
      error: undefined,
      refetch,
    });

    const { result } = renderHook(() => useCvProjects('cv-1'));

    act(() => {
      result.current.toggleSort('endDate');
    });

    expect(result.current.items.map((item) => item.id)).toEqual(['3', '1', '2']);
  });

  it('switches sort key and resets direction to asc', () => {
    useQuery.mockReturnValue({
      data: { cv: { projects } },
      loading: false,
      error: undefined,
      refetch,
    });

    const { result } = renderHook(() => useCvProjects('cv-1'));

    act(() => {
      result.current.toggleSort('name');
    });
    act(() => {
      result.current.toggleSort('name');
    });
    expect(result.current.sortDirection).toBe('desc');

    act(() => {
      result.current.toggleSort('startDate');
    });
    expect(result.current.sortKey).toBe('startDate');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('swallows refetch rejection', async () => {
    refetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useCvProjects('cv-1'));

    await expect(result.current.refetch()).resolves.toBeUndefined();
  });
});
