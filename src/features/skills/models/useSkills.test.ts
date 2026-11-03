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

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));

import { GET_PROFILE_SKILLS, GET_SKILL_CATEGORIES } from '../api/SkillQueries';
import { useSkills } from './useSkills';

function mockQueries({
  skillsData,
  categoriesData,
  skillsLoading = false,
  categoriesLoading = false,
  error,
}: {
  skillsData?: unknown;
  categoriesData?: unknown;
  skillsLoading?: boolean;
  categoriesLoading?: boolean;
  error?: Error;
} = {}) {
  useQuery.mockImplementation((query: unknown) => {
    if (query === GET_PROFILE_SKILLS) {
      return { data: skillsData, loading: skillsLoading, error };
    }
    if (query === GET_SKILL_CATEGORIES) {
      return { data: categoriesData, loading: categoriesLoading };
    }
    return { data: undefined, loading: false };
  });
}

describe('useSkills', () => {
  beforeEach(() => {
    authState.user = { id: 'auth-user' };
    useQuery.mockReset();
    mockQueries();
  });

  it('resolves me / missing userId to the auth user and queries', () => {
    const { result: me } = renderHook(() => useSkills('me'));
    expect(me.current.targetId).toBe('auth-user');
    expect(useQuery).toHaveBeenCalledWith(GET_PROFILE_SKILLS, {
      variables: { userId: 'auth-user' },
    });
    expect(useQuery).toHaveBeenCalledWith(GET_SKILL_CATEGORIES);

    useQuery.mockClear();
    mockQueries();
    const { result: missing } = renderHook(() => useSkills());
    expect(missing.current.targetId).toBe('auth-user');
    expect(useQuery).toHaveBeenCalledWith(GET_PROFILE_SKILLS, {
      variables: { userId: 'auth-user' },
    });
  });

  it('uses an explicit userId', () => {
    const { result } = renderHook(() => useSkills('other-user'));
    expect(result.current.targetId).toBe('other-user');
    expect(useQuery).toHaveBeenCalledWith(GET_PROFILE_SKILLS, {
      variables: { userId: 'other-user' },
    });
  });

  it('skips the skills query when there is no target id', () => {
    authState.user = null;
    renderHook(() => useSkills('me'));
    expect(useQuery).toHaveBeenCalledWith(GET_PROFILE_SKILLS, skipToken);
  });

  it('returns empty skills and groups without data', () => {
    const { result } = renderHook(() => useSkills('u1'));

    expect(result.current.skills).toEqual([]);
    expect(result.current.groups).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('maps profile skills into category groups', () => {
    mockQueries({
      skillsData: {
        profile: {
          skills: [
            { name: 'React', categoryId: 'fe', mastery: 'Expert' },
            { name: 'Node', categoryId: 'be', mastery: 'Competent' },
          ],
        },
      },
      categoriesData: {
        skillCategories: [
          { id: 'be', name: 'Backend', order: 0 },
          { id: 'fe', name: 'Frontend', order: 1 },
        ],
      },
    });

    const { result } = renderHook(() => useSkills('u1'));

    expect(result.current.skills).toHaveLength(2);
    expect(result.current.groups).toEqual([
      {
        id: 'be',
        title: 'Backend',
        items: [
          {
            key: 'Node',
            label: 'Node',
            level: 'Competent',
            progress: 0.6,
            tone: 'green',
          },
        ],
      },
      {
        id: 'fe',
        title: 'Frontend',
        items: [
          {
            key: 'React',
            label: 'React',
            level: 'Expert',
            progress: 1,
            tone: 'red',
          },
        ],
      },
    ]);
  });

  it('falls back to Novice metadata for unknown mastery and combines loading', () => {
    mockQueries({
      skillsData: {
        profile: {
          skills: [{ name: 'Weird', categoryId: null, mastery: 'Z9' }],
        },
      },
      categoriesData: { skillCategories: [] },
      skillsLoading: true,
      error: new Error('partial'),
    });

    const { result } = renderHook(() => useSkills('u1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toEqual(new Error('partial'));
    expect(result.current.groups[0].items[0]).toMatchObject({
      key: 'Weird',
      level: 'Z9',
      progress: 0.2,
      tone: 'gray',
    });
  });
});
