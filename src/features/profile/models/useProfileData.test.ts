import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, skipToken, authState, params } = vi.hoisted(() => ({
  useQuery: vi.fn(),
  skipToken: Symbol('skipToken'),
  authState: { user: { id: 'auth-user' } as { id: string } | null },
  params: { id: 'auth-user' as string | undefined },
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQuery(...args),
  skipToken,
}));

vi.mock('next/navigation', () => ({
  useParams: () => params,
}));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));

import { GET_DEPARTMENTS, GET_POSITIONS, GET_USER_PROFILE } from '../api/ProfileQueries';
import { useProfileData } from './useProfileData';

describe('useProfileData', () => {
  beforeEach(() => {
    authState.user = { id: 'auth-user' };
    params.id = 'auth-user';
    useQuery.mockReset();
    useQuery.mockImplementation((query: unknown) => {
      if (query === GET_USER_PROFILE) {
        return {
          data: { user: { id: 'auth-user', email: 'a@b.c' } },
          loading: false,
          error: undefined,
        };
      }
      if (query === GET_DEPARTMENTS) {
        return { data: { departments: { items: [{ id: 'd1', name: 'Eng' }] } } };
      }
      if (query === GET_POSITIONS) {
        return { data: { positions: { items: [{ id: 'p1', name: 'Dev' }] } } };
      }
      return { data: undefined, loading: false };
    });
  });

  it('loads departments and positions with limit 50', () => {
    renderHook(() => useProfileData());

    expect(useQuery).toHaveBeenCalledWith(GET_DEPARTMENTS, {
      variables: { params: { limit: 50 } },
    });
    expect(useQuery).toHaveBeenCalledWith(GET_POSITIONS, {
      variables: { params: { limit: 50 } },
    });
  });

  it('returns user profile plus department and position options', () => {
    const { result } = renderHook(() => useProfileData());

    expect(result.current.userData).toEqual({ id: 'auth-user', email: 'a@b.c' });
    expect(result.current.departments).toEqual([{ id: 'd1', name: 'Eng' }]);
    expect(result.current.positions).toEqual([{ id: 'p1', name: 'Dev' }]);
    expect(result.current.isEditable).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('falls back to empty option lists when option queries have no data', () => {
    useQuery.mockImplementation((query: unknown) => {
      if (query === GET_USER_PROFILE) {
        return {
          data: { user: { id: 'auth-user' } },
          loading: true,
          error: new Error('profile'),
        };
      }
      return { data: undefined };
    });

    const { result } = renderHook(() => useProfileData());

    expect(result.current.departments).toEqual([]);
    expect(result.current.positions).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toEqual(new Error('profile'));
  });
});
