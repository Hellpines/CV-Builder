import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useMutation, toast, createCv, updateCv, deleteCv, authState } = vi.hoisted(() => ({
  useMutation: vi.fn(),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  createCv: vi.fn(),
  updateCv: vi.fn(),
  deleteCv: vi.fn(),
  authState: { user: { id: 'auth-user' } as { id: string } | null },
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: (...args: unknown[]) => useMutation(...args),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) => selector(authState),
}));

import { CREATE_CV_MUTATION, DELETE_CV_MUTATION, UPDATE_CV_MUTATION } from '../api/CvMutations';
import { useCvActions } from './useCvActions';

const values = { name: 'Main', education: 'BS', description: 'Summary' };

describe('useCvActions', () => {
  const onChanged = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { id: 'auth-user' };
    onChanged.mockResolvedValue(undefined);
    const mutations = [[createCv], [updateCv], [deleteCv]];
    let index = 0;
    useMutation.mockImplementation(() => mutations[index++ % mutations.length]);
  });

  it('wires create/update/delete mutations', () => {
    renderHook(() => useCvActions(onChanged));

    expect(useMutation).toHaveBeenCalledWith(CREATE_CV_MUTATION);
    expect(useMutation).toHaveBeenCalledWith(UPDATE_CV_MUTATION);
    expect(useMutation).toHaveBeenCalledWith(DELETE_CV_MUTATION);
  });

  it('creates a CV and toasts success', async () => {
    createCv.mockResolvedValue({});
    const { result } = renderHook(() => useCvActions(onChanged));

    await act(async () => {
      await result.current.create(values);
    });

    expect(createCv).toHaveBeenCalledWith({
      variables: { cv: { ...values, userId: 'auth-user' } },
    });
    expect(onChanged).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('notifications.cvCreated');
  });

  it('requires userId for create', async () => {
    authState.user = null;
    const { result } = renderHook(() => useCvActions(onChanged));

    await expect(result.current.create(values)).rejects.toThrow('User not found');
    expect(createCv).not.toHaveBeenCalled();
  });

  it('updates a CV and toasts success', async () => {
    updateCv.mockResolvedValue({});
    const { result } = renderHook(() => useCvActions(onChanged));

    await act(async () => {
      await result.current.update('cv-1', values);
    });

    expect(updateCv).toHaveBeenCalledWith({
      variables: { cv: { cvId: 'cv-1', ...values } },
    });
    expect(onChanged).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('notifications.cvUpdated');
  });

  it('removes a CV, evicts cache, and toasts success', async () => {
    deleteCv.mockImplementation(async ({ update }) => {
      const cache = {
        identify: vi.fn(() => 'Cv:cv-1'),
        evict: vi.fn(),
        gc: vi.fn(),
      };
      update(cache);
      expect(cache.identify).toHaveBeenCalledWith({ __typename: 'Cv', id: 'cv-1' });
      expect(cache.evict).toHaveBeenCalledWith({ id: 'Cv:cv-1' });
      expect(cache.gc).toHaveBeenCalled();
      return {};
    });

    const { result } = renderHook(() => useCvActions(onChanged));

    await act(async () => {
      await result.current.remove('cv-1');
    });

    expect(deleteCv).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { cv: { cvId: 'cv-1' } },
        update: expect.any(Function),
      })
    );
    expect(onChanged).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('notifications.cvDeleted');
  });

  it('toasts Error.message and rethrows on mutation failures', async () => {
    createCv.mockRejectedValue(new Error('create failed'));
    updateCv.mockRejectedValue(new Error('update failed'));
    deleteCv.mockRejectedValue(new Error('delete failed'));

    const { result } = renderHook(() => useCvActions(onChanged));

    await expect(result.current.create(values)).rejects.toThrow('create failed');
    expect(toast.error).toHaveBeenCalledWith('create failed');

    await expect(result.current.update('cv-1', values)).rejects.toThrow('update failed');
    expect(toast.error).toHaveBeenCalledWith('update failed');

    await expect(result.current.remove('cv-1')).rejects.toThrow('delete failed');
    expect(toast.error).toHaveBeenCalledWith('delete failed');
  });

  it('falls back to i18n keys when rejection is not an Error', async () => {
    createCv.mockRejectedValue('boom');
    updateCv.mockRejectedValue('boom');
    deleteCv.mockRejectedValue('boom');

    const { result } = renderHook(() => useCvActions(onChanged));

    await expect(result.current.create(values)).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.cvCreateFailed');

    await expect(result.current.update('cv-1', values)).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.cvUpdateFailed');

    await expect(result.current.remove('cv-1')).rejects.toBe('boom');
    expect(toast.error).toHaveBeenCalledWith('notifications.cvDeleteFailed');
  });
});
