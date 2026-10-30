import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery, useMutation, skipToken, toast, addLanguage, updateLanguage, deleteLanguage } =
  vi.hoisted(() => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    skipToken: Symbol('skipToken'),
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
    addLanguage: vi.fn(),
    updateLanguage: vi.fn(),
    deleteLanguage: vi.fn(),
  }));

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

import { GET_LANGUAGES_CATALOG } from '../api/LanguageQueries';
import { useLanguageActions } from './useLanguagesActions';

const languages = [
  { name: 'English', proficiency: 'B2' as const },
  { name: 'Spanish', proficiency: 'A1' as const },
];

describe('useLanguageActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQuery.mockReturnValue({ data: undefined });
    const mutations = [[addLanguage], [updateLanguage], [deleteLanguage]];
    let index = 0;
    useMutation.mockImplementation(() => mutations[index++ % mutations.length]);
  });

  it('skips catalog query when disabled', () => {
    renderHook(() => useLanguageActions({ languages, enabled: false }));

    expect(useQuery).toHaveBeenCalledWith(GET_LANGUAGES_CATALOG, skipToken);
  });

  it('loads catalog with limit when enabled', () => {
    renderHook(() => useLanguageActions({ userId: 'u1', languages, enabled: true }));

    expect(useQuery).toHaveBeenCalledWith(GET_LANGUAGES_CATALOG, {
      variables: { params: { limit: 100 } },
    });
  });

  it('builds sorted options and marks owned languages', () => {
    useQuery.mockReturnValue({
      data: {
        languages: {
          items: [
            { name: 'Spanish', native_name: 'Español' },
            { name: 'English', native_name: 'English' },
            { name: 'French', native_name: null },
          ],
        },
      },
    });

    const { result } = renderHook(() =>
      useLanguageActions({ userId: 'u1', languages, enabled: true })
    );

    expect(result.current.options.map((option) => option.label)).toEqual([
      'English',
      'French',
      'Spanish (Español)',
    ]);
    expect(result.current.options).toEqual(
      expect.arrayContaining([
        { value: 'English', label: 'English', exists: true },
        { value: 'French', label: 'French', exists: false },
        { value: 'Spanish', label: 'Spanish (Español)', exists: true },
      ])
    );
  });

  it('adds a language and toasts success', async () => {
    addLanguage.mockResolvedValue({});
    const { result } = renderHook(() =>
      useLanguageActions({ userId: 'u1', languages, enabled: true })
    );

    await act(async () => {
      await result.current.add('French', 'B1');
    });

    expect(addLanguage).toHaveBeenCalledWith({
      variables: { language: { userId: 'u1', name: 'French', proficiency: 'B1' } },
    });
    expect(toast.success).toHaveBeenCalledWith('notifications.languageAdded:{"name":"French"}');
  });

  it('requires userId for add/update/remove', async () => {
    const { result } = renderHook(() => useLanguageActions({ languages, enabled: true }));

    await expect(result.current.add('French', 'B1')).rejects.toThrow('User not found');
    await expect(result.current.update('English', 'C1')).rejects.toThrow('User not found');
    await expect(result.current.remove(['English'])).rejects.toThrow('User not found');
  });

  it('updates a language and toasts success', async () => {
    updateLanguage.mockResolvedValue({});
    const { result } = renderHook(() =>
      useLanguageActions({ userId: 'u1', languages, enabled: true })
    );

    await act(async () => {
      await result.current.update('English', 'C1');
    });

    expect(updateLanguage).toHaveBeenCalledWith({
      variables: { language: { userId: 'u1', name: 'English', proficiency: 'C1' } },
    });
    expect(toast.success).toHaveBeenCalledWith('notifications.languageUpdated:{"name":"English"}');
  });

  it('removes languages and toasts success', async () => {
    deleteLanguage.mockResolvedValue({});
    const { result } = renderHook(() =>
      useLanguageActions({ userId: 'u1', languages, enabled: true })
    );

    await act(async () => {
      await result.current.remove(['English', 'Spanish']);
    });

    expect(deleteLanguage).toHaveBeenCalledWith({
      variables: { language: { userId: 'u1', name: ['English', 'Spanish'] } },
    });
    expect(toast.success).toHaveBeenCalledWith(
      'notifications.languageRemoved:{"names":"English, Spanish"}'
    );
  });

  it('toasts Error.message and rethrows on mutation failures', async () => {
    addLanguage.mockRejectedValue(new Error('add failed'));
    updateLanguage.mockRejectedValue(new Error('update failed'));
    deleteLanguage.mockRejectedValue(new Error('delete failed'));

    const { result } = renderHook(() =>
      useLanguageActions({ userId: 'u1', languages, enabled: true })
    );

    await expect(result.current.add('French', 'B1')).rejects.toThrow('add failed');
    expect(toast.error).toHaveBeenCalledWith('add failed');

    await expect(result.current.update('English', 'C1')).rejects.toThrow('update failed');
    expect(toast.error).toHaveBeenCalledWith('update failed');

    await expect(result.current.remove(['English'])).rejects.toThrow('delete failed');
    expect(toast.error).toHaveBeenCalledWith('delete failed');
  });

  it('falls back to i18n keys when rejection is not an Error', async () => {
    addLanguage.mockRejectedValue('boom');
    updateLanguage.mockRejectedValue('boom');
    deleteLanguage.mockRejectedValue('boom');

    const { result } = renderHook(() =>
      useLanguageActions({ userId: 'u1', languages, enabled: true })
    );

    await expect(result.current.add('French', 'B1')).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.languageAddFailed:{"name":"French"}');

    await expect(result.current.update('English', 'C1')).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith(
      'notifications.languageUpdateFailed:{"name":"English"}'
    );

    await expect(result.current.remove(['English'])).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.languageRemoveFailed');
  });
});
