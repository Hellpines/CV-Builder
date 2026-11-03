import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/shared/types/user';

const { useMutation, signup, toast, push, setAuth, startVerification } = vi.hoisted(() => ({
  useMutation: vi.fn(),
  signup: vi.fn(),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  push: vi.fn(),
  setAuth: vi.fn(),
  startVerification: vi.fn(),
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
  useAuthStore: (
    selector: (state: {
      setAuth: typeof setAuth;
      startVerification: typeof startVerification;
    }) => unknown
  ) => selector({ setAuth, startVerification }),
}));

import { SIGNUP_MUTATION } from '../api/AuthMutations';
import { useRegisterForm } from './useRegisterForm';

const user = {
  id: 'u1',
  created_at: '2024-01-01',
  email: 'user@example.com',
  is_verified: false,
  profile: {} as User['profile'],
  role: 'Employee',
  department: null,
  position: null,
  cvs: null,
} satisfies User;

function preventDefaultEvent() {
  return { preventDefault: vi.fn() } as unknown as React.SyntheticEvent<HTMLFormElement>;
}

describe('useRegisterForm', () => {
  let mutationOptions: {
    onCompleted?: (data: unknown) => void;
    onError?: (err: Error) => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mutationOptions = {};
    useMutation.mockImplementation((_doc: unknown, options: typeof mutationOptions) => {
      mutationOptions = options ?? {};
      return [signup, { loading: false }];
    });
  });

  it('wires SIGNUP_MUTATION and starts invalid', () => {
    const { result } = renderHook(() => useRegisterForm());

    expect(useMutation).toHaveBeenCalledWith(SIGNUP_MUTATION, expect.any(Object));
    expect(result.current.isFormValid).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('validates email, password, and confirm fields', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setEmail('bad');
      result.current.setPassword('123');
      result.current.setConfirmPassword('456');
    });

    expect(result.current.emailHelperText).toBe('Please enter a valid email address');
    expect(result.current.passwordHelperText).toBe('Password must be at least 6 characters long');
    expect(result.current.confirmPasswordHelperText).toBe('Passwords do not match');
    expect(result.current.emailInvalid).toBe(true);
    expect(result.current.passwordInvalid).toBe(true);
    expect(result.current.confirmPasswordInvalid).toBe(true);

    act(() => {
      result.current.setEmail('');
      result.current.setPassword('');
      result.current.setConfirmPassword('');
    });

    expect(result.current.emailHelperText).toBe('Email is required');
    expect(result.current.passwordHelperText).toBe('Password is required');
    expect(result.current.confirmPasswordHelperText).toBe('Confirm Password is required');
  });

  it('submits signup when form is valid', () => {
    const { result } = renderHook(() => useRegisterForm());
    const event = preventDefaultEvent();

    act(() => {
      result.current.setEmail('user@example.com');
      result.current.setPassword('secret1');
      result.current.setConfirmPassword('secret1');
    });
    expect(result.current.isFormValid).toBe(true);

    act(() => {
      result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(signup).toHaveBeenCalledWith({
      variables: {
        auth: {
          email: 'user@example.com',
          password: 'secret1',
          confirmPassword: 'secret1',
        },
      },
    });
  });

  it('does not submit when confirmation mismatches', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setEmail('user@example.com');
      result.current.setPassword('secret1');
      result.current.setConfirmPassword('other1');
    });
    act(() => {
      result.current.handleSubmit(preventDefaultEvent());
    });

    expect(signup).not.toHaveBeenCalled();
  });

  it('onCompleted starts verification, sets auth, and navigates', () => {
    renderHook(() => useRegisterForm());

    act(() => {
      mutationOptions.onCompleted?.({
        signup: {
          access_token: 'a',
          refresh_token: 'r',
          user,
        },
      });
    });

    expect(startVerification).toHaveBeenCalled();
    expect(setAuth).toHaveBeenCalledWith('a', 'r', user);
    expect(toast.success).toHaveBeenCalledWith('notifications.accountCreatedVerify');
    expect(push).toHaveBeenCalledWith('/verify-email');
  });

  it('onError maps account-exists failures and clears on email change', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      mutationOptions.onError?.(new Error('User already exists'));
    });

    expect(result.current.emailHelperText).toBe('notifications.accountExists');
    expect(result.current.generalError).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('notifications.accountExists');

    act(() => {
      result.current.setEmail('other@example.com');
    });
    expect(result.current.emailHelperText).toBeUndefined();
  });

  it('onError maps unknown failures to generalError', () => {
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      mutationOptions.onError?.(new Error('timeout'));
    });

    expect(result.current.generalError).toBe('notifications.generalError');
    expect(toast.error).toHaveBeenCalledWith('notifications.generalError');

    act(() => {
      result.current.setPassword('secret1');
    });
    expect(result.current.generalError).toBeNull();
  });
});
