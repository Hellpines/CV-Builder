import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, useMutation, skipToken, toast, addSkill, updateSkill, deleteSkill } = vi.hoisted(
  () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    skipToken: Symbol('skipToken'),
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
    addSkill: vi.fn(),
    updateSkill: vi.fn(),
    deleteSkill: vi.fn(),
  })
);

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQuery(...args),
  useMutation: (...args: unknown[]) => useMutation(...args),
  skipToken,
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

import { GET_SKILLS_CATALOG } from '../api/SkillQueries';
import { useSkillActions } from './useSkillActions';

const skills = [
  { name: 'React', categoryId: 'fe', mastery: 'Expert' as const },
  { name: 'Node', categoryId: 'be', mastery: 'Competent' as const },
];

const catalogItems = [
  { id: 's2', name: 'Node', category: { id: 'be', name: 'Backend' } },
  { id: 's1', name: 'React', category: { id: 'fe', name: 'Frontend' } },
  { id: 's3', name: 'Go', category: { id: 'be', name: 'Backend' } },
];

describe('useSkillActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuery.mockReturnValue({ data: undefined });
    const mutations = [[addSkill], [updateSkill], [deleteSkill]];
    let index = 0;
    useMutation.mockImplementation(() => mutations[index++ % mutations.length]);
  });

  it('skips catalog query when disabled', () => {
    renderHook(() => useSkillActions({ skills, enabled: false }));

    expect(useQuery).toHaveBeenCalledWith(GET_SKILLS_CATALOG, skipToken);
  });

  it('loads catalog with limit when enabled', () => {
    renderHook(() => useSkillActions({ userId: 'u1', skills, enabled: true }));

    expect(useQuery).toHaveBeenCalledWith(GET_SKILLS_CATALOG, {
      variables: { params: { limit: 100 } },
    });
  });

  it('builds sorted options and marks owned skills', () => {
    useQuery.mockReturnValue({ data: { skills: { items: catalogItems } } });

    const { result } = renderHook(() => useSkillActions({ userId: 'u1', skills, enabled: true }));

    expect(result.current.options.map((option) => option.label)).toEqual(['Go', 'Node', 'React']);
    expect(result.current.options).toEqual(
      expect.arrayContaining([
        { value: 's1', label: 'React', exists: true },
        { value: 's2', label: 'Node', exists: true },
        { value: 's3', label: 'Go', exists: false },
      ])
    );
  });

  it('adds a skill and toasts success', async () => {
    useQuery.mockReturnValue({ data: { skills: { items: catalogItems } } });
    addSkill.mockResolvedValue({});
    const { result } = renderHook(() => useSkillActions({ userId: 'u1', skills, enabled: true }));

    await act(async () => {
      await result.current.add('s3', 'Advanced');
    });

    expect(addSkill).toHaveBeenCalledWith({
      variables: {
        skill: {
          userId: 'u1',
          name: 'Go',
          categoryId: 'be',
          mastery: 'Advanced',
        },
      },
    });
    expect(toast.success).toHaveBeenCalledWith('notifications.skillAdded:{"name":"Go"}');
  });

  it('requires userId/catalog skill for add and userId for update/remove', async () => {
    useQuery.mockReturnValue({ data: { skills: { items: catalogItems } } });
    const { result: withoutUser } = renderHook(() => useSkillActions({ skills, enabled: true }));

    await expect(withoutUser.current.add('s3', 'Advanced')).rejects.toThrow('Skill not found');
    await expect(withoutUser.current.update('React', 'Expert')).rejects.toThrow('User not found');
    await expect(withoutUser.current.remove(['React'])).rejects.toThrow('User not found');

    const { result: withUser } = renderHook(() =>
      useSkillActions({ userId: 'u1', skills, enabled: true })
    );
    await expect(withUser.current.add('missing', 'Advanced')).rejects.toThrow('Skill not found');
  });

  it('updates a skill and toasts success', async () => {
    useQuery.mockReturnValue({ data: { skills: { items: catalogItems } } });
    updateSkill.mockResolvedValue({});
    const { result } = renderHook(() => useSkillActions({ userId: 'u1', skills, enabled: true }));

    await act(async () => {
      await result.current.update('React', 'Proficient');
    });

    expect(updateSkill).toHaveBeenCalledWith({
      variables: {
        skill: {
          userId: 'u1',
          name: 'React',
          categoryId: 'fe',
          mastery: 'Proficient',
        },
      },
    });
    expect(toast.success).toHaveBeenCalledWith('notifications.skillUpdated:{"name":"React"}');
  });

  it('uses null categoryId when updating an unknown skill name', async () => {
    useQuery.mockReturnValue({ data: { skills: { items: catalogItems } } });
    updateSkill.mockResolvedValue({});
    const { result } = renderHook(() => useSkillActions({ userId: 'u1', skills, enabled: true }));

    await act(async () => {
      await result.current.update('Unknown', 'Novice');
    });

    expect(updateSkill).toHaveBeenCalledWith({
      variables: {
        skill: {
          userId: 'u1',
          name: 'Unknown',
          categoryId: null,
          mastery: 'Novice',
        },
      },
    });
  });

  it('removes skills and toasts success', async () => {
    useQuery.mockReturnValue({ data: { skills: { items: catalogItems } } });
    deleteSkill.mockResolvedValue({});
    const { result } = renderHook(() => useSkillActions({ userId: 'u1', skills, enabled: true }));

    await act(async () => {
      await result.current.remove(['React', 'Node']);
    });

    expect(deleteSkill).toHaveBeenCalledWith({
      variables: { skill: { userId: 'u1', name: ['React', 'Node'] } },
    });
    expect(toast.success).toHaveBeenCalledWith(
      'notifications.skillRemoved:{"names":"React, Node"}'
    );
  });

  it('toasts Error.message and rethrows on mutation failures', async () => {
    useQuery.mockReturnValue({ data: { skills: { items: catalogItems } } });
    addSkill.mockRejectedValue(new Error('add failed'));
    updateSkill.mockRejectedValue(new Error('update failed'));
    deleteSkill.mockRejectedValue(new Error('delete failed'));

    const { result } = renderHook(() => useSkillActions({ userId: 'u1', skills, enabled: true }));

    await expect(result.current.add('s3', 'Advanced')).rejects.toThrow('add failed');
    expect(toast.error).toHaveBeenCalledWith('add failed');

    await expect(result.current.update('React', 'Expert')).rejects.toThrow('update failed');
    expect(toast.error).toHaveBeenCalledWith('update failed');

    await expect(result.current.remove(['React'])).rejects.toThrow('delete failed');
    expect(toast.error).toHaveBeenCalledWith('delete failed');
  });

  it('falls back to i18n keys when rejection is not an Error', async () => {
    useQuery.mockReturnValue({ data: { skills: { items: catalogItems } } });
    addSkill.mockRejectedValue('boom');
    updateSkill.mockRejectedValue('boom');
    deleteSkill.mockRejectedValue('boom');

    const { result } = renderHook(() => useSkillActions({ userId: 'u1', skills, enabled: true }));

    await expect(result.current.add('s3', 'Advanced')).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.skillAddFailed:{"name":"Go"}');

    await expect(result.current.update('React', 'Expert')).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.skillUpdateFailed:{"name":"React"}');

    await expect(result.current.remove(['React'])).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.skillRemoveFailed');
  });
});
