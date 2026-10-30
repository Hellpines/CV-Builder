import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/shared/types/user';

const {
  useMutation,
  resetPassword,
  login,
  toast,
  push,
  replace,
  searchParamsGet,
  setAuth,
  parseJwt,
  authState,
} = vi.hoisted(() => {
  const authState = {
    accessToken: null as string | null,
    refreshToken: null as string | null,
    user: null as User | null,
    setAuth: vi.fn(),
  };

  return {
    useMutation: vi.fn(),
    resetPassword: vi.fn(),
    login: vi.fn(),
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
    push: vi.fn(),
    replace: vi.fn(),
    searchParamsGet: vi.fn(),
    setAuth: authState.setAuth,
    parseJwt: vi.fn(),
    authState,
  };
});

vi.mock('@apollo/client/react', () => ({
  useMutation: (...args: unknown[]) => useMutation(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => ({ get: searchParamsGet }),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

vi.mock('../helpers/parseJwt', () => ({
  parseJwt: (...args: unknown[]) => parseJwt(...args),
}));

vi.mock('./useAuthStore', () => {
  const store = Object.assign(
    (selector: (state: typeof authState) => unknown) => selector(authState),
    {
      getState: () => authState,
      setState: (partial: Partial<typeof authState>) => {
        Object.assign(authState, partial);
      },
    }
  );
  return { useAuthStore: store };
});

import { LOGIN_MUTATION, RESET_PASSWORD_MUTATION } from '../api/AuthMutations';
import { useResetForm } from './useResetForm';

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

function changeEvent(value: string) {
  return { target: { value } } as React.ChangeEvent<HTMLInputElement>;
}

function preventDefaultEvent() {
  return { preventDefault: vi.fn() } as unknown as React.SyntheticEvent<HTMLFormElement>;
}

describe('useResetForm', () => {
  let resetOptions: {
    onCompleted?: () => void;
    onError?: (err: Error) => void;
  };
  let loginOptions: {
    onCompleted?: (data: unknown) => void;
    onError?: (err: Error) => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authState.accessToken = null;
    authState.refreshToken = null;
    authState.user = null;
    searchParamsGet.mockReturnValue('reset-token');
    parseJwt.mockReturnValue({ email: 'user@example.com' });
    resetPassword.mockResolvedValue({});
    login.mockResolvedValue({});
    resetOptions = {};
    loginOptions = {};

    useMutation.mockImplementation((doc: unknown, options: unknown) => {
      if (doc === RESET_PASSWORD_MUTATION) {
        resetOptions = (options as typeof resetOptions) ?? {};
        return [resetPassword, { loading: false }];
      }
      loginOptions = (options as typeof loginOptions) ?? {};
      return [login, { loading: false }];
    });
  });

  it('redirects to forgot-password when token is missing', () => {
    searchParamsGet.mockReturnValue(null);
    renderHook(() => useResetForm());
    expect(replace).toHaveBeenCalledWith('/forgot-password');
  });

  it('clears orphaned access token without user', () => {
    authState.accessToken = 'orphan';
    authState.refreshToken = 'refresh';
    authState.user = null;

    renderHook(() => useResetForm());

    expect(authState.accessToken).toBeNull();
    expect(authState.refreshToken).toBeNull();
  });

  it('wires reset and login mutations', () => {
    renderHook(() => useResetForm());

    expect(useMutation).toHaveBeenNthCalledWith(1, RESET_PASSWORD_MUTATION, expect.any(Object));
    expect(useMutation).toHaveBeenNthCalledWith(2, LOGIN_MUTATION, expect.any(Object));
  });

  it('validates password fields after submit', async () => {
    const { result } = renderHook(() => useResetForm());

    await act(async () => {
      await result.current.handleSubmit(preventDefaultEvent());
    });

    expect(result.current.passwordHelperText).toBe('Password is required');
    expect(result.current.confirmPasswordHelperText).toBe('Confirm Password is required');
    expect(resetPassword).not.toHaveBeenCalled();

    act(() => {
      result.current.handlePasswordChange(changeEvent('123'));
      result.current.handleConfirmPasswordChange(changeEvent('456'));
    });
    await act(async () => {
      await result.current.handleSubmit(preventDefaultEvent());
    });

    expect(result.current.passwordHelperText).toBe('Password must be at least 6 characters long');
    expect(result.current.confirmPasswordHelperText).toBe('Passwords do not match');
  });

  it('resets password then auto-logs in when JWT has email', async () => {
    const { result } = renderHook(() => useResetForm());
    const event = preventDefaultEvent();

    act(() => {
      result.current.handlePasswordChange(changeEvent('secret1'));
      result.current.handleConfirmPasswordChange(changeEvent('secret1'));
    });
    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(resetPassword).toHaveBeenCalledWith({
      variables: {
        auth: { newPassword: 'secret1', confirmPassword: 'secret1' },
      },
      context: {
        headers: { authorization: 'Bearer reset-token' },
      },
    });
    expect(parseJwt).toHaveBeenCalledWith('reset-token');
    expect(login).toHaveBeenCalledWith({
      variables: { auth: { email: 'user@example.com', password: 'secret1' } },
    });
  });

  it('falls back to login route when JWT has no email', async () => {
    parseJwt.mockReturnValue(null);
    const { result } = renderHook(() => useResetForm());

    act(() => {
      result.current.handlePasswordChange(changeEvent('secret1'));
      result.current.handleConfirmPasswordChange(changeEvent('secret1'));
    });
    await act(async () => {
      await result.current.handleSubmit(preventDefaultEvent());
    });

    expect(login).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('swallows reset flow errors without throwing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    resetPassword.mockRejectedValue(new Error('reset failed'));
    const { result } = renderHook(() => useResetForm());

    act(() => {
      result.current.handlePasswordChange(changeEvent('secret1'));
      result.current.handleConfirmPasswordChange(changeEvent('secret1'));
    });
    await act(async () => {
      await result.current.handleSubmit(preventDefaultEvent());
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(login).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('reset onCompleted and onError update UI and toast', () => {
    const { result } = renderHook(() => useResetForm());

    act(() => {
      resetOptions.onCompleted?.();
    });
    expect(toast.success).toHaveBeenCalledWith('notifications.passwordResetSuccess');

    act(() => {
      resetOptions.onError?.(new Error('Token expired'));
    });
    expect(result.current.linkError).toBe('notifications.expiredResetLink');
    expect(toast.error).toHaveBeenCalledWith('notifications.expiredResetLink');

    act(() => {
      result.current.handlePasswordChange(changeEvent('secret1'));
    });
    expect(result.current.linkError).toBeNull();

    act(() => {
      resetOptions.onError?.(new Error('server boom'));
    });
    expect(result.current.generalError).toBe('notifications.generalError');
    expect(toast.error).toHaveBeenCalledWith('notifications.generalError');

    act(() => {
      result.current.handleConfirmPasswordChange(changeEvent('secret1'));
    });
    expect(result.current.generalError).toBeNull();
  });

  it('login onCompleted sets auth and navigates to users', () => {
    renderHook(() => useResetForm());

    act(() => {
      loginOptions.onCompleted?.({
        login: {
          access_token: 'a',
          refresh_token: 'r',
          user,
        },
      });
    });

    expect(setAuth).toHaveBeenCalledWith('a', 'r', user);
    expect(toast.success).toHaveBeenCalledWith('notifications.passwordUpdatedSignedIn');
    expect(push).toHaveBeenCalledWith('/users');
  });

  it('login onError toasts and redirects to login', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderHook(() => useResetForm());

    act(() => {
      loginOptions.onError?.(new Error('login failed'));
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('notifications.passwordResetLoginFailed');
    expect(push).toHaveBeenCalledWith('/login');
    consoleSpy.mockRestore();
  });
});
