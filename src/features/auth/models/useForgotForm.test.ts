import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useMutation, forgotPassword, toast } = vi.hoisted(() => ({
  useMutation: vi.fn(),
  forgotPassword: vi.fn(),
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
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

import { FORGOT_PASSWORD_MUTATION } from '../api/AuthMutations';
import { useForgotForm } from './useForgotForm';

function preventDefaultEvent() {
  return { preventDefault: vi.fn() } as unknown as React.SyntheticEvent<HTMLFormElement>;
}

describe('useForgotForm', () => {
  let mutationOptions: {
    onCompleted?: () => void;
    onError?: (err: Error) => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mutationOptions = {};
    useMutation.mockImplementation((_doc: unknown, options: typeof mutationOptions) => {
      mutationOptions = options ?? {};
      return [forgotPassword, { loading: false }];
    });
  });

  it('wires FORGOT_PASSWORD_MUTATION', () => {
    const { result } = renderHook(() => useForgotForm());

    expect(useMutation).toHaveBeenCalledWith(FORGOT_PASSWORD_MUTATION, expect.any(Object));
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.emailInvalid).toBe(false);
  });

  it('validates email after submit', () => {
    const { result } = renderHook(() => useForgotForm());

    act(() => {
      result.current.handleSubmit(preventDefaultEvent());
    });
    expect(result.current.emailHelperText).toBe('Email is required');
    expect(forgotPassword).not.toHaveBeenCalled();

    act(() => {
      result.current.setEmail('bad');
    });
    act(() => {
      result.current.handleSubmit(preventDefaultEvent());
    });
    expect(result.current.emailHelperText).toBe('Please enter a valid email address');
    expect(forgotPassword).not.toHaveBeenCalled();
  });

  it('submits forgotPassword with email', () => {
    const { result } = renderHook(() => useForgotForm());
    const event = preventDefaultEvent();

    act(() => {
      result.current.setEmail('user@example.com');
    });
    act(() => {
      result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(forgotPassword).toHaveBeenCalledWith({
      variables: { auth: { email: 'user@example.com' } },
    });
  });

  it('onCompleted marks success and toasts', () => {
    const { result } = renderHook(() => useForgotForm());

    act(() => {
      mutationOptions.onCompleted?.();
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.formError).toBeNull();
    expect(toast.success).toHaveBeenCalledWith('notifications.passwordResetSent');
  });

  it('onError maps missing-account failures and clears on change', () => {
    const { result } = renderHook(() => useForgotForm());

    act(() => {
      mutationOptions.onError?.(new Error('User not found'));
    });

    expect(result.current.emailHelperText).toBe('notifications.noAccountFound');
    expect(result.current.formError).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('notifications.noAccountFound');

    act(() => {
      result.current.setEmail('other@example.com');
    });
    expect(result.current.emailHelperText).toBeUndefined();
  });

  it('onError maps unknown failures to formError', () => {
    const { result } = renderHook(() => useForgotForm());

    act(() => {
      mutationOptions.onError?.(new Error('timeout'));
    });

    expect(result.current.formError).toBe('notifications.generalError');
    expect(toast.error).toHaveBeenCalledWith('notifications.generalError');

    act(() => {
      result.current.setEmail('user@example.com');
    });
    expect(result.current.formError).toBeNull();
  });
});
