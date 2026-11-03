import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useMutation, changePassword, toast } = vi.hoisted(() => ({
  useMutation: vi.fn(),
  changePassword: vi.fn(),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: (...args: unknown[]) => useMutation(...args),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

import { CHANGE_PASSWORD_MUTATION } from '../api/SettingsMutations';
import { PASSWORD_MIN_LENGTH, usePasswordForm } from './usePasswordForm';

function preventDefaultEvent() {
  return { preventDefault: vi.fn() } as unknown as React.SyntheticEvent<HTMLFormElement>;
}

describe('usePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    changePassword.mockResolvedValue({});
    useMutation.mockReturnValue([changePassword, { loading: false }]);
  });

  it('wires CHANGE_PASSWORD_MUTATION and starts disabled', () => {
    const { result } = renderHook(() => usePasswordForm());

    expect(useMutation).toHaveBeenCalledWith(CHANGE_PASSWORD_MUTATION);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.values).toEqual({ current: '', next: '', confirm: '' });
    expect(result.current.errors).toEqual({
      current: undefined,
      next: undefined,
      confirm: undefined,
    });
  });

  it('shows validation after fields are touched', () => {
    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField('current', '');
      result.current.setField('next', '123');
      result.current.setField('confirm', '456');
    });

    expect(result.current.errors.current).toBe('settings.password.validation.required');
    expect(result.current.errors.next).toBe(
      `settings.password.validation.tooShort:{"min":${PASSWORD_MIN_LENGTH}}`
    );
    expect(result.current.errors.confirm).toBe('settings.password.validation.mismatch');
    expect(result.current.canSubmit).toBe(false);
  });

  it('allows submit when all fields are valid', () => {
    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField('current', 'oldpass');
      result.current.setField('next', 'newpass');
      result.current.setField('confirm', 'newpass');
    });

    expect(result.current.canSubmit).toBe(true);
  });

  it('does not mutate when canSubmit is false', async () => {
    const { result } = renderHook(() => usePasswordForm());

    await act(async () => {
      await result.current.handleSubmit(preventDefaultEvent());
    });

    expect(changePassword).not.toHaveBeenCalled();
  });

  it('changes password, resets values, and toasts success', async () => {
    const { result } = renderHook(() => usePasswordForm());
    const event = preventDefaultEvent();

    act(() => {
      result.current.setField('current', 'oldpass');
      result.current.setField('next', 'newpass');
      result.current.setField('confirm', 'newpass');
    });

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(changePassword).toHaveBeenCalledWith({
      variables: {
        args: {
          oldPassword: 'oldpass',
          newPassword: 'newpass',
          confirmPassword: 'newpass',
        },
      },
    });
    expect(result.current.values).toEqual({ current: '', next: '', confirm: '' });
    expect(toast.success).toHaveBeenCalledWith('settings.password.messages.success');
  });

  it('maps incorrect current-password errors to the current field', async () => {
    changePassword.mockRejectedValue(new Error('Incorrect current password'));
    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField('current', 'oldpass');
      result.current.setField('next', 'newpass');
      result.current.setField('confirm', 'newpass');
    });

    await act(async () => {
      await result.current.handleSubmit(preventDefaultEvent());
    });

    expect(result.current.errors.current).toBe('settings.password.validation.incorrect');
    expect(toast.error).not.toHaveBeenCalled();

    act(() => {
      result.current.setField('current', 'fixed');
    });
    expect(result.current.errors.current).toBeUndefined();
  });

  it('maps mismatch server errors to confirm field', async () => {
    changePassword.mockRejectedValue(new Error('Passwords do not match'));
    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField('current', 'oldpass');
      result.current.setField('next', 'newpass');
      result.current.setField('confirm', 'newpass');
    });

    await act(async () => {
      await result.current.handleSubmit(preventDefaultEvent());
    });

    expect(result.current.errors.confirm).toBe('settings.password.validation.mismatch');
  });

  it('toasts failed message for unknown errors', async () => {
    changePassword.mockRejectedValue(new Error('server boom'));
    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField('current', 'oldpass');
      result.current.setField('next', 'newpass');
      result.current.setField('confirm', 'newpass');
    });

    await act(async () => {
      await result.current.handleSubmit(preventDefaultEvent());
    });

    expect(toast.error).toHaveBeenCalledWith('settings.password.messages.failed');
  });

  it('treats non-Error rejections as failed', async () => {
    changePassword.mockRejectedValue('boom');
    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField('current', 'oldpass');
      result.current.setField('next', 'newpass');
      result.current.setField('confirm', 'newpass');
    });

    await act(async () => {
      await result.current.handleSubmit(preventDefaultEvent());
    });

    expect(toast.error).toHaveBeenCalledWith('settings.password.messages.failed');
  });

  it('disables submit while loading', () => {
    useMutation.mockReturnValue([changePassword, { loading: true }]);
    const { result } = renderHook(() => usePasswordForm());

    act(() => {
      result.current.setField('current', 'oldpass');
      result.current.setField('next', 'newpass');
      result.current.setField('confirm', 'newpass');
    });

    expect(result.current.canSubmit).toBe(false);
  });
});
