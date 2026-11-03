import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useMutation, sendVerification, toast, router, startVerification } = vi.hoisted(() => ({
  useMutation: vi.fn(),
  sendVerification: vi.fn(),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  router: {
    push: vi.fn(),
  },
  startVerification: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: (...args: unknown[]) => useMutation(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({ startVerification }),
  },
}));

import { SEND_VERIFICATION_MUTATION } from '@/features/auth/api/AuthMutations';
import { useVerifyEmail } from './useVerifyEmail';

describe('useVerifyEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutation.mockReturnValue([sendVerification, { loading: false }]);
  });

  it('wires the send verification mutation', () => {
    renderHook(() => useVerifyEmail('user@example.com'));
    expect(useMutation).toHaveBeenCalledWith(SEND_VERIFICATION_MUTATION);
  });

  it('no-ops when email is missing', async () => {
    const { result } = renderHook(() => useVerifyEmail());

    await act(async () => {
      await result.current.handleVerifyEmail();
    });

    expect(sendVerification).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('sends verification, starts flow, navigates, and toasts success', async () => {
    sendVerification.mockResolvedValue({});
    const { result } = renderHook(() => useVerifyEmail('user@example.com'));

    await act(async () => {
      await result.current.handleVerifyEmail();
    });

    expect(sendVerification).toHaveBeenCalledWith({
      variables: { email: 'user@example.com' },
    });
    expect(startVerification).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/verify-email');
    expect(toast.success).toHaveBeenCalledWith('notifications.verificationEmailSent');
  });

  it('toasts Error.message on failure', async () => {
    sendVerification.mockRejectedValue(new Error('smtp down'));
    const { result } = renderHook(() => useVerifyEmail('user@example.com'));

    await act(async () => {
      await result.current.handleVerifyEmail();
    });

    expect(toast.error).toHaveBeenCalledWith('smtp down');
    expect(router.push).not.toHaveBeenCalled();
  });

  it('falls back to i18n key when rejection is not an Error', async () => {
    sendVerification.mockRejectedValue('boom');
    const { result } = renderHook(() => useVerifyEmail('user@example.com'));

    await act(async () => {
      await result.current.handleVerifyEmail();
    });

    expect(toast.error).toHaveBeenCalledWith('notifications.verificationEmailSendFailed');
  });

  it('exposes sendingCode from mutation loading', () => {
    useMutation.mockReturnValue([sendVerification, { loading: true }]);
    const { result } = renderHook(() => useVerifyEmail('user@example.com'));
    expect(result.current.sendingCode).toBe(true);
  });
});
