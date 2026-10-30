import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, skipToken, buildCvPreview } = vi.hoisted(() => ({
  useQuery: vi.fn(),
  skipToken: Symbol('skipToken'),
  buildCvPreview: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQuery(...args),
  skipToken,
}));

vi.mock('../helpers/buildCvPreview', () => ({
  buildCvPreview: (...args: unknown[]) => buildCvPreview(...args),
}));

import { GET_CV_PREVIEW, GET_PREVIEW_CATEGORIES } from '../api/CvPreviewQueries';
import { useCvPreview } from './useCvPreview';

describe('useCvPreview', () => {
  const cvRefetch = vi.fn();
  const categoriesRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cvRefetch.mockResolvedValue({});
    categoriesRefetch.mockResolvedValue({});
    useQuery.mockImplementation((query) => {
      if (query === GET_CV_PREVIEW) {
        return {
          data: undefined,
          loading: false,
          error: undefined,
          refetch: cvRefetch,
        };
      }
      return {
        data: undefined,
        loading: false,
        error: undefined,
        refetch: categoriesRefetch,
      };
    });
  });

  it('skips CV query when cvId is missing and still loads categories', () => {
    renderHook(() => useCvPreview());

    expect(useQuery).toHaveBeenCalledWith(GET_CV_PREVIEW, skipToken);
    expect(useQuery).toHaveBeenCalledWith(GET_PREVIEW_CATEGORIES, {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    });
  });

  it('queries CV preview by id', () => {
    renderHook(() => useCvPreview('cv-1'));

    expect(useQuery).toHaveBeenCalledWith(GET_CV_PREVIEW, {
      variables: { cvId: 'cv-1' },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    });
  });

  it('returns null model until both cv and categories exist', () => {
    useQuery.mockImplementation((query) => {
      if (query === GET_CV_PREVIEW) {
        return {
          data: { cv: { id: 'cv-1', name: 'Main' } },
          loading: false,
          error: undefined,
          refetch: cvRefetch,
        };
      }
      return {
        data: undefined,
        loading: false,
        error: undefined,
        refetch: categoriesRefetch,
      };
    });

    const { result } = renderHook(() => useCvPreview('cv-1'));

    expect(result.current.model).toBeNull();
    expect(buildCvPreview).not.toHaveBeenCalled();
  });

  it('builds model when both queries have data', () => {
    const cv = { id: 'cv-1', name: 'Main' };
    const categories = [{ id: 'fe', name: 'Frontend' }];
    const model = { name: 'Main', projects: [] };
    buildCvPreview.mockReturnValue(model);

    useQuery.mockImplementation((query) => {
      if (query === GET_CV_PREVIEW) {
        return { data: { cv }, loading: false, error: undefined, refetch: cvRefetch };
      }
      return {
        data: { skillCategories: categories },
        loading: false,
        error: undefined,
        refetch: categoriesRefetch,
      };
    });

    const { result } = renderHook(() => useCvPreview('cv-1'));

    expect(buildCvPreview).toHaveBeenCalledWith(cv, categories);
    expect(result.current.model).toBe(model);
    expect(result.current.error).toBeUndefined();
    expect(result.current.initialLoading).toBe(false);
  });

  it('exposes first error when data is incomplete', () => {
    const cvError = new Error('cv failed');

    useQuery.mockImplementation((query) => {
      if (query === GET_CV_PREVIEW) {
        return {
          data: undefined,
          loading: false,
          error: cvError,
          refetch: cvRefetch,
        };
      }
      return {
        data: undefined,
        loading: false,
        error: new Error('categories failed'),
        refetch: categoriesRefetch,
      };
    });

    const { result } = renderHook(() => useCvPreview('cv-1'));
    expect(result.current.error).toBe(cvError);
  });

  it('tracks initialLoading while queries load without data or error', () => {
    useQuery.mockImplementation((query) => {
      if (query === GET_CV_PREVIEW) {
        return {
          data: undefined,
          loading: true,
          error: undefined,
          refetch: cvRefetch,
        };
      }
      return {
        data: undefined,
        loading: true,
        error: undefined,
        refetch: categoriesRefetch,
      };
    });

    const { result } = renderHook(() => useCvPreview('cv-1'));
    expect(result.current.initialLoading).toBe(true);
  });

  it('refetches both queries and swallows rejections', async () => {
    cvRefetch.mockRejectedValue(new Error('cv'));
    categoriesRefetch.mockRejectedValue(new Error('cats'));

    const { result } = renderHook(() => useCvPreview('cv-1'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(cvRefetch).toHaveBeenCalled();
    expect(categoriesRefetch).toHaveBeenCalled();
  });
});
