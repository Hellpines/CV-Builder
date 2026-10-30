import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/shared/types/user';

const { useMutation, login, toast, push, setAuth } = vi.hoisted(() => ({
  useMutation: vi.fn(),
  login: vi.fn(),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  push: vi.fn(),
  setAuth: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: (...args: unknown[]) => useMutation(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

vi.mock('./useAuthStore', () => ({
  useAuthStore: (selector: (state: { setAuth: typeof setAuth }) => unknown) =>
    selector({ setAuth }),
}));

import { LOGIN_MUTATION } from '../api/AuthMutations';
import { useLoginForm } from './useLoginForm';

const user = {
  id: 'u1',
  created_at: '2024-01-01',
  email: 'user@example.com',
  is_verified: true,
  profile: {} as User['profile'],
  role: 'Employee',
  department: null,
  position: null,
  cvs: null,
} satisfies User;

function preventDefaultEvent() {
  return { preventDefault: vi.fn() } as unknown as React.SyntheticEvent<HTMLFormElement>;
}

describe('useLoginForm', () => {
  let mutationOptions: {
    onCompleted?: (data: unknown) => void;
    onError?: (err: Error) => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mutationOptions = {};
    useMutation.mockImplementation((_doc: unknown, options: typeof mutationOptions) => {
      mutationOptions = options ?? {};
      return [login, { loading: false }];
    });
  });

  it('wires LOGIN_MUTATION and starts with empty invalid form', () => {
    const { result } = renderHook(() => useLoginForm());

    expect(useMutation).toHaveBeenCalledWith(LOGIN_MUTATION, expect.any(Object));
    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.isFormValid).toBe(false);
    expect(result.current.emailInvalid).toBe(false);
    expect(result.current.passwordInvalid).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('validates email and password after touch', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail('bad');
    });
    expect(result.current.emailInvalid).toBe(true);
    expect(result.current.emailHelperText).toBe('Please enter a valid email address');

    act(() => {
      result.current.setEmail('');
    });
    expect(result.current.emailHelperText).toBe('Email is required');

    act(() => {
      result.current.setPassword('123');
    });
    expect(result.current.passwordInvalid).toBe(true);
    expect(result.current.passwordHelperText).toBe('Password must be at least 6 characters long');

    act(() => {
      result.current.setPassword('');
    });
    expect(result.current.passwordHelperText).toBe('Password is required');
  });

  it('marks form valid and submits login variables', () => {
    const { result } = renderHook(() => useLoginForm());
    const event = preventDefaultEvent();

    act(() => {
      result.current.setEmail('user@example.com');
      result.current.setPassword('secret1');
    });
    expect(result.current.isFormValid).toBe(true);

    act(() => {
      result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(login).toHaveBeenCalledWith({
      variables: { auth: { email: 'user@example.com', password: 'secret1' } },
    });
  });

  it('does not call login when validation fails', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.handleSubmit(preventDefaultEvent());
    });

    expect(login).not.toHaveBeenCalled();
    expect(result.current.emailHelperText).toBe('Email is required');
    expect(result.current.passwordHelperText).toBe('Password is required');
  });

  it('onCompleted sets auth, toasts, and navigates', () => {
    renderHook(() => useLoginForm());

    act(() => {
      mutationOptions.onCompleted?.({
        login: {
          access_token: 'a',
          refresh_token: 'r',
          user,
        },
      });
    });

    expect(setAuth).toHaveBeenCalledWith('a', 'r', user);
    expect(toast.success).toHaveBeenCalledWith('notifications.loginSuccess');
    expect(push).toHaveBeenCalledWith('/users');
  });

  it('onError maps credential errors and clears them on change', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      mutationOptions.onError?.(new Error('Invalid credentials'));
    });

    expect(result.current.emailInvalid).toBe(true);
    expect(result.current.passwordInvalid).toBe(true);
    expect(result.current.emailHelperText).toBe('notifications.invalidCredentials');
    expect(toast.error).toHaveBeenCalledWith('notifications.invalidCredentials');

    act(() => {
      result.current.setEmail('user@example.com');
    });
    expect(result.current.emailHelperText).toBeUndefined();
  });

  it('onError maps unknown failures to generalError', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      mutationOptions.onError?.(new Error('network down'));
    });

    expect(result.current.generalError).toBe('notifications.generalError');
    expect(toast.error).toHaveBeenCalledWith('notifications.generalError');

    act(() => {
      result.current.setPassword('secret1');
    });
    expect(result.current.generalError).toBeNull();
  });
});
