import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, skipToken, authState, params } = vi.hoisted(() => ({
  useQuery: vi.fn(),
  skipToken: Symbol('skipToken'),
  authState: { user: { id: 'auth-user' } as { id: string } | null },
  params: { id: 'me' as string | undefined },
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

import { GET_USER_PROFILE } from '../api/ProfileQueries';
import { useProfileUser } from './useProfileUser';

describe('useProfileUser', () => {
  beforeEach(() => {
    authState.user = { id: 'auth-user' };
    params.id = 'me';
    useQuery.mockReset();
    useQuery.mockReturnValue({ data: undefined, loading: false, error: undefined });
  });

  it('treats me as editable and queries the auth user', () => {
    const { result } = renderHook(() => useProfileUser());

    expect(result.current.isEditable).toBe(true);
    expect(useQuery).toHaveBeenCalledWith(GET_USER_PROFILE, {
      variables: { userId: 'auth-user' },
    });
  });

  it('treats matching current user id as editable', () => {
    params.id = 'auth-user';
    const { result } = renderHook(() => useProfileUser());

    expect(result.current.isEditable).toBe(true);
    expect(useQuery).toHaveBeenCalledWith(GET_USER_PROFILE, {
      variables: { userId: 'auth-user' },
    });
  });

  it('treats other users as read-only and queries that id', () => {
    params.id = 'other-user';
    const { result } = renderHook(() => useProfileUser());

    expect(result.current.isEditable).toBe(false);
    expect(useQuery).toHaveBeenCalledWith(GET_USER_PROFILE, {
      variables: { userId: 'other-user' },
    });
  });

  it('skips the query when me has no auth user', () => {
    authState.user = null;
    params.id = 'me';
    renderHook(() => useProfileUser());

    expect(useQuery).toHaveBeenCalledWith(GET_USER_PROFILE, skipToken);
  });

  it('returns userData, loading, and error from the query', () => {
    const user = { id: 'auth-user', email: 'a@b.c' };
    useQuery.mockReturnValue({
      data: { user },
      loading: true,
      error: new Error('boom'),
    });

    const { result } = renderHook(() => useProfileUser());

    expect(result.current.userData).toEqual(user);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toEqual(new Error('boom'));
  });
});
