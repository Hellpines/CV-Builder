import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, useMutation, toast, addProject, updateProject, removeProject } = vi.hoisted(
  () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
    addProject: vi.fn(),
    updateProject: vi.fn(),
    removeProject: vi.fn(),
  })
);

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQuery(...args),
  useMutation: (...args: unknown[]) => useMutation(...args),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

import { GET_PROJECTS_CATALOG, GET_ROLE_OPTIONS } from '../api/CvProjectQueries';
import { useCvProjectActions } from './useCvProjectActions';

const payload = {
  projectId: 'p1',
  start_date: '2020-01-01',
  end_date: null,
  roles: ['Dev'],
  responsibilities: ['Ship'],
};

describe('useCvProjectActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuery.mockReturnValue({ data: undefined });
    const mutations = [[addProject], [updateProject], [removeProject]];
    let index = 0;
    useMutation.mockImplementation(() => mutations[index++ % mutations.length]);
  });

  it('loads catalog and role options with limit 100', () => {
    renderHook(() => useCvProjectActions('cv-1'));

    expect(useQuery).toHaveBeenCalledWith(GET_PROJECTS_CATALOG, {
      variables: { params: { limit: 100 } },
    });
    expect(useQuery).toHaveBeenCalledWith(GET_ROLE_OPTIONS, {
      variables: { params: { limit: 100 } },
    });
  });

  it('maps catalog items and unique role names', () => {
    useQuery
      .mockReturnValueOnce({
        data: {
          projects: {
            items: [
              { id: '1', name: 'Alpha' },
              { id: '2', name: 'Beta' },
            ],
          },
        },
      })
      .mockReturnValueOnce({
        data: {
          positions: {
            items: [{ name: 'Dev' }, { name: 'Lead' }, { name: 'Dev' }],
          },
        },
      });

    const { result } = renderHook(() => useCvProjectActions('cv-1'));

    expect(result.current.catalog).toEqual([
      { id: '1', name: 'Alpha' },
      { id: '2', name: 'Beta' },
    ]);
    expect(result.current.roles).toEqual(['Dev', 'Lead']);
  });

  it('requires cvId for add/update/remove', async () => {
    const { result } = renderHook(() => useCvProjectActions());

    await expect(result.current.add(payload)).rejects.toThrow('CV not found');
    await expect(result.current.update(payload)).rejects.toThrow('CV not found');
    await expect(result.current.remove('p1')).rejects.toThrow('CV not found');
  });

  it('adds a project and toasts success', async () => {
    addProject.mockResolvedValue({});
    const { result } = renderHook(() => useCvProjectActions('cv-1'));

    await act(async () => {
      await result.current.add(payload);
    });

    expect(addProject).toHaveBeenCalledWith({
      variables: { project: { cvId: 'cv-1', ...payload } },
    });
    expect(toast.success).toHaveBeenCalledWith('notifications.projectAdded');
  });

  it('updates a project and toasts success', async () => {
    updateProject.mockResolvedValue({});
    const { result } = renderHook(() => useCvProjectActions('cv-1'));

    await act(async () => {
      await result.current.update(payload);
    });

    expect(updateProject).toHaveBeenCalledWith({
      variables: { project: { cvId: 'cv-1', ...payload } },
    });
    expect(toast.success).toHaveBeenCalledWith('notifications.projectUpdated');
  });

  it('removes a project and toasts success', async () => {
    removeProject.mockResolvedValue({});
    const { result } = renderHook(() => useCvProjectActions('cv-1'));

    await act(async () => {
      await result.current.remove('p1');
    });

    expect(removeProject).toHaveBeenCalledWith({
      variables: { project: { cvId: 'cv-1', projectId: 'p1' } },
    });
    expect(toast.success).toHaveBeenCalledWith('notifications.projectRemoved');
  });

  it('toasts Error.message and rethrows on mutation failures', async () => {
    addProject.mockRejectedValue(new Error('add failed'));
    updateProject.mockRejectedValue(new Error('update failed'));
    removeProject.mockRejectedValue(new Error('remove failed'));

    const { result } = renderHook(() => useCvProjectActions('cv-1'));

    await expect(result.current.add(payload)).rejects.toThrow('add failed');
    expect(toast.error).toHaveBeenCalledWith('add failed');

    await expect(result.current.update(payload)).rejects.toThrow('update failed');
    expect(toast.error).toHaveBeenCalledWith('update failed');

    await expect(result.current.remove('p1')).rejects.toThrow('remove failed');
    expect(toast.error).toHaveBeenCalledWith('remove failed');
  });

  it('falls back to i18n keys when rejection is not an Error', async () => {
    addProject.mockRejectedValue('boom');
    updateProject.mockRejectedValue('boom');
    removeProject.mockRejectedValue('boom');

    const { result } = renderHook(() => useCvProjectActions('cv-1'));

    await expect(result.current.add(payload)).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.projectAddFailed');

    await expect(result.current.update(payload)).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.projectUpdateFailed');

    await expect(result.current.remove('p1')).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.projectRemoveFailed');
  });
});
