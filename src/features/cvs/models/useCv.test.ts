import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, skipToken, useParams, authState } = vi.hoisted(() => ({
  useQuery: vi.fn(),
  skipToken: Symbol('skipToken'),
  useParams: vi.fn(),
  authState: { user: { id: 'auth-user' } as { id: string } | null },
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQuery(...args),
  skipToken,
}));

vi.mock('next/navigation', () => ({
  useParams: (...args: unknown[]) => useParams(...args),
}));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));

import { GET_CV_DETAILS } from '../api/CvDetailsQueries';
import { useCv } from './useCv';

describe('useCv', () => {
  const refetch = vi.fn();

  beforeEach(() => {
    authState.user = { id: 'auth-user' };
    useParams.mockReset();
    useQuery.mockReset();
    refetch.mockReset();
    useParams.mockReturnValue({ id: 'cv-1' });
    useQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
      refetch,
    });
  });

  it('skips the query when cvId is missing', () => {
    useParams.mockReturnValue({});
    const { result } = renderHook(() => useCv());

    expect(result.current.cvId).toBeUndefined();
    expect(useQuery).toHaveBeenCalledWith(GET_CV_DETAILS, skipToken);
  });

  it('queries CV details by id from params', () => {
    const { result } = renderHook(() => useCv());

    expect(result.current.cvId).toBe('cv-1');
    expect(useQuery).toHaveBeenCalledWith(GET_CV_DETAILS, {
      variables: { cvId: 'cv-1' },
      fetchPolicy: 'cache-and-network',
    });
  });

  it('marks owner when cv has no user', () => {
    useQuery.mockReturnValue({
      data: { cv: { id: 'cv-1', name: 'Main', user: null } },
      loading: false,
      error: undefined,
      refetch,
    });

    const { result } = renderHook(() => useCv());

    expect(result.current.isOwner).toBe(true);
    expect(result.current.cv).toMatchObject({ id: 'cv-1' });
  });

  it('marks owner when cv user matches current user', () => {
    useQuery.mockReturnValue({
      data: { cv: { id: 'cv-1', name: 'Main', user: { id: 'auth-user' } } },
      loading: false,
      error: undefined,
      refetch,
    });

    const { result } = renderHook(() => useCv());
    expect(result.current.isOwner).toBe(true);
  });

  it('marks non-owner when cv user differs', () => {
    useQuery.mockReturnValue({
      data: { cv: { id: 'cv-1', name: 'Main', user: { id: 'other' } } },
      loading: true,
      error: new Error('partial'),
      refetch,
    });

    const { result } = renderHook(() => useCv());

    expect(result.current.isOwner).toBe(false);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toEqual(new Error('partial'));
  });

  it('swallows refetch rejection', async () => {
    refetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useCv());

    await expect(result.current.refetch()).resolves.toBeUndefined();
  });
});
