import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/shared/types/user';

const { useMutation, verifyMail, toast, push, replace, clearVerification, authState } = vi.hoisted(
  () => {
    const user: User = {
      id: 'u1',
      created_at: '2024-01-01',
      email: 'user@example.com',
      is_verified: false,
      profile: {} as User['profile'],
      role: 'Employee',
      department: null,
      position: null,
      cvs: null,
    };

    const authState = {
      accessToken: 'token' as string | null,
      user: user as User | null,
      verificationRequested: true,
      clearVerification: vi.fn(),
    };

    return {
      useMutation: vi.fn(),
      verifyMail: vi.fn(),
      toast: {
        success: vi.fn(),
        error: vi.fn(),
      },
      push: vi.fn(),
      replace: vi.fn(),
      clearVerification: authState.clearVerification,
      authState,
    };
  }
);

vi.mock('@apollo/client/react', () => ({
  useMutation: (...args: unknown[]) => useMutation(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

vi.mock('./useAuthStore', () => {
  const store = Object.assign(() => authState, {
    getState: () => authState,
    setState: (
      updater: Partial<typeof authState> | ((state: typeof authState) => Partial<typeof authState>)
    ) => {
      const partial = typeof updater === 'function' ? updater(authState) : updater;
      Object.assign(authState, partial);
    },
  });
  return { useAuthStore: store };
});

import { VERIFY_MAIL_MUTATION } from '../api/AuthMutations';
import { useVerifyForm } from './useVerifyForm';

function preventDefaultEvent() {
  return { preventDefault: vi.fn() } as unknown as React.SyntheticEvent;
}

describe('useVerifyForm', () => {
  let mutationOptions: {
    onCompleted?: () => void;
    onError?: (err: Error) => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authState.accessToken = 'token';
    authState.user = {
      id: 'u1',
      created_at: '2024-01-01',
      email: 'user@example.com',
      is_verified: false,
      profile: {} as User['profile'],
      role: 'Employee',
      department: null,
      position: null,
      cvs: null,
    };
    authState.verificationRequested = true;
    mutationOptions = {};
    useMutation.mockImplementation((_doc: unknown, options: typeof mutationOptions) => {
      mutationOptions = options ?? {};
      return [verifyMail, { loading: false }];
    });
  });

  it('redirects to login when unauthenticated', () => {
    authState.accessToken = null;
    authState.user = null;
    renderHook(() => useVerifyForm());
    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('redirects verified users to /users', () => {
    authState.user = { ...authState.user!, is_verified: true };
    renderHook(() => useVerifyForm());
    expect(replace).toHaveBeenCalledWith('/users');
  });

  it('wires VERIFY_MAIL_MUTATION', () => {
    renderHook(() => useVerifyForm());
    expect(useMutation).toHaveBeenCalledWith(VERIFY_MAIL_MUTATION, expect.any(Object));
  });

  it('fills digits and focuses next input', () => {
    const { result } = renderHook(() => useVerifyForm());
    const focus = vi.fn();
    result.current.inputRefs.current[1] = { focus } as unknown as HTMLInputElement;

    act(() => {
      result.current.handleChange('1', 0);
    });

    expect(result.current.code[0]).toBe('1');
    expect(focus).toHaveBeenCalled();
  });

  it('pastes a multi-digit code into subsequent slots', () => {
    const { result } = renderHook(() => useVerifyForm());
    const focus = vi.fn();
    result.current.inputRefs.current[5] = { focus } as unknown as HTMLInputElement;

    act(() => {
      result.current.handleChange('12a3456extra', 0);
    });

    expect(result.current.code).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(focus).toHaveBeenCalled();
  });

  it('handles backspace on filled and empty slots', () => {
    const { result } = renderHook(() => useVerifyForm());
    const focus = vi.fn();

    act(() => {
      result.current.handleChange('1', 0);
      result.current.handleChange('2', 1);
    });

    act(() => {
      result.current.handleKeyDown(
        { key: 'Backspace' } as React.KeyboardEvent<HTMLInputElement>,
        1
      );
    });
    expect(result.current.code[1]).toBe('');

    result.current.inputRefs.current[0] = { focus } as unknown as HTMLInputElement;
    act(() => {
      result.current.handleKeyDown(
        { key: 'Backspace' } as React.KeyboardEvent<HTMLInputElement>,
        1
      );
    });
    expect(result.current.code[0]).toBe('');
    expect(focus).toHaveBeenCalled();
  });

  it('requires a full 6-digit code before verifying', () => {
    const { result } = renderHook(() => useVerifyForm());

    act(() => {
      result.current.handleSubmit(preventDefaultEvent());
    });
    expect(result.current.helperText).toBe('Verification code is required');
    expect(result.current.hasError).toBe(true);
    expect(verifyMail).not.toHaveBeenCalled();

    act(() => {
      result.current.handleChange('1', 0);
    });
    act(() => {
      result.current.handleSubmit(preventDefaultEvent());
    });
    expect(result.current.helperText).toBe('Please enter a valid 6-digit code');
  });

  it('submits otp when code is complete', () => {
    const { result } = renderHook(() => useVerifyForm());

    act(() => {
      result.current.handleChange('123456', 0);
    });
    act(() => {
      result.current.handleSubmit(preventDefaultEvent());
    });

    expect(verifyMail).toHaveBeenCalledWith({
      variables: { mail: { otp: '123456' } },
    });
  });

  it('handleLater clears verification and navigates', () => {
    const { result } = renderHook(() => useVerifyForm());

    act(() => {
      result.current.handleLater();
    });

    expect(clearVerification).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/users');
  });

  it('onCompleted marks user verified and navigates', () => {
    renderHook(() => useVerifyForm());

    act(() => {
      mutationOptions.onCompleted?.();
    });

    expect(authState.user?.is_verified).toBe(true);
    expect(authState.verificationRequested).toBe(false);
    expect(toast.success).toHaveBeenCalledWith('notifications.emailVerified');
    expect(push).toHaveBeenCalledWith('/users');
  });

  it('onError maps expired, invalid, and general failures', () => {
    const { result } = renderHook(() => useVerifyForm());

    act(() => {
      mutationOptions.onError?.(new Error('Code expired'));
    });
    expect(result.current.helperText).toBe('notifications.verificationExpired');
    expect(toast.error).toHaveBeenCalledWith('notifications.verificationExpired');

    act(() => {
      result.current.handleChange('1', 0);
    });
    expect(result.current.helperText).toBeUndefined();

    act(() => {
      mutationOptions.onError?.(new Error('Invalid code'));
    });
    expect(result.current.helperText).toBe('notifications.invalidVerificationCode');

    act(() => {
      mutationOptions.onError?.(new Error('server boom'));
    });
    expect(result.current.helperText).toBe('notifications.generalError');
  });
});
