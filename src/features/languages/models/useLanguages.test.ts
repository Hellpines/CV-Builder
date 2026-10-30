import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, skipToken, authState } = vi.hoisted(() => ({
  useQuery: vi.fn(),
  skipToken: Symbol('skipToken'),
  authState: { user: { id: 'auth-user' } as { id: string } | null },
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQuery(...args),
  skipToken,
}));

vi.mock('@/shared/i18n/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));

import { GET_PROFILE_LANGUAGES } from '../api/LanguageQueries';
import { useLanguages } from './useLanguages';

describe('useLanguages', () => {
  beforeEach(() => {
    authState.user = { id: 'auth-user' };
    useQuery.mockReset();
    useQuery.mockReturnValue({ data: undefined, loading: false, error: undefined });
  });

  it('resolves me / missing userId to the auth user and queries', () => {
    const { result: me } = renderHook(() => useLanguages('me'));
    expect(me.current.targetId).toBe('auth-user');
    expect(useQuery).toHaveBeenCalledWith(GET_PROFILE_LANGUAGES, {
      variables: { userId: 'auth-user' },
    });

    useQuery.mockClear();
    const { result: missing } = renderHook(() => useLanguages());
    expect(missing.current.targetId).toBe('auth-user');
    expect(useQuery).toHaveBeenCalledWith(GET_PROFILE_LANGUAGES, {
      variables: { userId: 'auth-user' },
    });
  });

  it('uses an explicit userId', () => {
    const { result } = renderHook(() => useLanguages('other-user'));
    expect(result.current.targetId).toBe('other-user');
    expect(useQuery).toHaveBeenCalledWith(GET_PROFILE_LANGUAGES, {
      variables: { userId: 'other-user' },
    });
  });

  it('skips the query when there is no target id', () => {
    authState.user = null;
    renderHook(() => useLanguages('me'));
    expect(useQuery).toHaveBeenCalledWith(GET_PROFILE_LANGUAGES, skipToken);
  });

  it('returns empty languages and groups without data', () => {
    const { result } = renderHook(() => useLanguages('u1'));

    expect(result.current.languages).toEqual([]);
    expect(result.current.groups).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('maps profile languages into a current level group', () => {
    useQuery.mockReturnValue({
      data: {
        profile: {
          languages: [
            { name: 'English', proficiency: 'B2' },
            { name: 'German', proficiency: 'Native' },
          ],
        },
      },
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useLanguages('u1'));

    expect(result.current.languages).toHaveLength(2);
    expect(result.current.groups).toEqual([
      {
        id: 'current',
        title: 'languages.current',
        items: [
          {
            key: 'English',
            label: 'English',
            level: 'B2',
            progress: 0.6,
            tone: 'green',
          },
          {
            key: 'German',
            label: 'German',
            level: 'Native',
            progress: 1,
            tone: 'red',
          },
        ],
      },
    ]);
  });

  it('falls back to A1 metadata for unknown proficiency', () => {
    useQuery.mockReturnValue({
      data: {
        profile: {
          languages: [{ name: 'Klingon', proficiency: 'Z9' }],
        },
      },
      loading: true,
      error: new Error('partial'),
    });

    const { result } = renderHook(() => useLanguages('u1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toEqual(new Error('partial'));
    expect(result.current.groups[0].items[0]).toMatchObject({
      key: 'Klingon',
      level: 'Z9',
      progress: 0,
      tone: 'gray',
    });
  });
});
