import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, skipToken, refetch } = vi.hoisted(() => ({
  useQuery: vi.fn(),
  skipToken: Symbol('skipToken'),
  refetch: vi.fn(),
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

import { GET_CV_SKILLS } from '../api/CvSkillQueries';
import { GET_SKILL_CATEGORIES } from '../api/SkillQueries';
import { useCvSkills } from './useCvSkills';

function mockQueries({
  cvData,
  categoriesData,
  cvLoading = false,
  categoriesLoading = false,
  error,
  refetchImpl = refetch,
}: {
  cvData?: unknown;
  categoriesData?: unknown;
  cvLoading?: boolean;
  categoriesLoading?: boolean;
  error?: Error;
  refetchImpl?: typeof refetch;
} = {}) {
  useQuery.mockImplementation((query: unknown) => {
    if (query === GET_CV_SKILLS) {
      return { data: cvData, loading: cvLoading, error, refetch: refetchImpl };
    }
    if (query === GET_SKILL_CATEGORIES) {
      return { data: categoriesData, loading: categoriesLoading };
    }
    return { data: undefined, loading: false, refetch: refetchImpl };
  });
}

describe('useCvSkills', () => {
  beforeEach(() => {
    useQuery.mockReset();
    refetch.mockReset();
    refetch.mockResolvedValue({});
    mockQueries();
  });

  it('skips the CV skills query without cvId', () => {
    renderHook(() => useCvSkills());
    expect(useQuery).toHaveBeenCalledWith(GET_CV_SKILLS, skipToken);
    expect(useQuery).toHaveBeenCalledWith(GET_SKILL_CATEGORIES);
  });

  it('queries CV skills when cvId is provided', () => {
    renderHook(() => useCvSkills('cv-1'));
    expect(useQuery).toHaveBeenCalledWith(GET_CV_SKILLS, {
      variables: { cvId: 'cv-1' },
    });
  });

  it('returns empty skills and groups without data', () => {
    const { result } = renderHook(() => useCvSkills('cv-1'));

    expect(result.current.skills).toEqual([]);
    expect(result.current.groups).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('maps CV skills into level groups', () => {
    mockQueries({
      cvData: {
        cv: {
          skills: [
            { name: 'React', categoryId: 'fe', mastery: 'Expert' },
            { name: 'Rust', categoryId: null, mastery: 'Novice' },
          ],
        },
      },
      categoriesData: {
        skillCategories: [{ id: 'fe', name: 'Frontend', order: 0 }],
      },
    });

    const { result } = renderHook(() => useCvSkills('cv-1'));

    expect(result.current.skills).toHaveLength(2);
    expect(result.current.groups).toEqual([
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
      {
        id: 'other',
        title: 'common.other',
        items: [
          {
            key: 'Rust',
            label: 'Rust',
            level: 'Novice',
            progress: 0.2,
            tone: 'gray',
          },
        ],
      },
    ]);
  });

  it('combines loading flags and surfaces error', () => {
    mockQueries({
      cvLoading: false,
      categoriesLoading: true,
      error: new Error('cv failed'),
    });

    const { result } = renderHook(() => useCvSkills('cv-1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toEqual(new Error('cv failed'));
  });

  it('refetch swallows rejected promises', async () => {
    refetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useCvSkills('cv-1'));

    await act(async () => {
      await expect(result.current.refetch()).resolves.toBeUndefined();
    });
    expect(refetch).toHaveBeenCalled();
  });

  it('refetch resolves with Apollo result on success', async () => {
    refetch.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useCvSkills('cv-1'));

    await act(async () => {
      await expect(result.current.refetch()).resolves.toEqual({ data: {} });
    });
  });
});
