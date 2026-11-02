import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useForgotForm } = vi.hoisted(() => ({
  useForgotForm: vi.fn(),
}));

vi.mock('../models/useForgotForm', () => ({ useForgotForm }));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    h('a', { href }, children),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: () => h('nav', { 'data-testid': 'auth-tabs' }),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    helperText,
    invalid,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    helperText?: string;
    invalid?: boolean;
  }) =>
    h(
      'div',
      null,
      h('input', { 'aria-invalid': invalid || undefined, ...props }),
      helperText ? h('p', null, helperText) : null
    ),
}));

import { ForgotForm } from './ForgotForm';

function mockForm(overrides: Record<string, unknown> = {}) {
  return {
    email: '',
    setEmail: vi.fn(),
    handleSubmit: vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
    loading: false,
    emailInvalid: false,
    emailHelperText: undefined,
    isSuccess: false,
    formError: null,
    ...overrides,
  };
}

describe('ForgotForm', () => {
  beforeEach(() => useForgotForm.mockReset());

  it('renders email form without tabs', () => {
    useForgotForm.mockReturnValue(mockForm({ email: 'a@b.com' }));
    render(h(ForgotForm));

    expect(screen.getByRole('heading', { name: 'auth.forgotPassword' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('common.email')).toHaveValue('a@b.com');
    expect(screen.queryByTestId('auth-tabs')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'COMMON.CANCEL' })).toHaveAttribute('href', '/login');
  });

  it('shows form error and loading state', () => {
    useForgotForm.mockReturnValue(mockForm({ formError: 'oops', loading: true }));
    render(h(ForgotForm));

    expect(screen.getByText('oops')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.sending' })).toBeDisabled();
  });

  it('shows success message and hides submit', () => {
    useForgotForm.mockReturnValue(mockForm({ isSuccess: true }));
    render(h(ForgotForm));

    expect(screen.getByText('auth.passwordRecoverySent')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('common.email')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'AUTH.RESETPASSWORD' })).not.toBeInTheDocument();
  });

  it('wires email change and submit', () => {
    const setEmail = vi.fn();
    const handleSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    useForgotForm.mockReturnValue(mockForm({ setEmail, handleSubmit }));
    render(h(ForgotForm));

    fireEvent.change(screen.getByPlaceholderText('common.email'), {
      target: { value: 'x@y.com' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'AUTH.RESETPASSWORD' }).closest('form')!);

    expect(setEmail).toHaveBeenCalledWith('x@y.com');
    expect(handleSubmit).toHaveBeenCalled();
  });
});
