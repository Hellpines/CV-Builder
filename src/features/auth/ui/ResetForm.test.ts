import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useResetForm } = vi.hoisted(() => ({
  useResetForm: vi.fn(),
}));

vi.mock('../models/useResetForm', () => ({ useResetForm }));

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

vi.mock('./PasswordInput', () => ({
  PasswordInput: ({
    helperText,
    invalid,
    placeholder,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    helperText?: string;
    invalid?: boolean;
  }) =>
    h(
      'div',
      null,
      h('input', {
        type: 'password',
        placeholder,
        'aria-invalid': invalid || undefined,
        ...props,
      }),
      helperText ? h('p', null, helperText) : null
    ),
}));

import { ResetForm } from './ResetForm';

function mockForm(overrides: Record<string, unknown> = {}) {
  return {
    password: '',
    handlePasswordChange: vi.fn(),
    confirmPassword: '',
    handleConfirmPasswordChange: vi.fn(),
    handleSubmit: vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
    loading: false,
    passwordInvalid: false,
    confirmPasswordInvalid: false,
    passwordHelperText: undefined,
    confirmPasswordHelperText: undefined,
    linkError: null,
    generalError: null,
    ...overrides,
  };
}

describe('ResetForm', () => {
  beforeEach(() => useResetForm.mockReset());

  it('renders password fields and login link without tabs', () => {
    useResetForm.mockReturnValue(mockForm());
    render(h(ResetForm));

    expect(screen.getByRole('heading', { name: 'auth.resetPassword' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('common.password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('common.confirmPassword')).toBeInTheDocument();
    expect(screen.queryByTestId('auth-tabs')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AUTH.SIGNIN' })).toHaveAttribute('href', '/login');
  });

  it('shows link/general errors and helpers', () => {
    useResetForm.mockReturnValue(
      mockForm({
        linkError: 'bad link',
        generalError: 'failed',
        passwordHelperText: 'weak',
        confirmPasswordHelperText: 'mismatch',
      })
    );
    render(h(ResetForm));

    expect(screen.getByText('bad link')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
    expect(screen.getByText('weak')).toBeInTheDocument();
    expect(screen.getByText('mismatch')).toBeInTheDocument();
  });

  it('shows saving label while loading', () => {
    useResetForm.mockReturnValue(mockForm({ loading: true }));
    render(h(ResetForm));
    expect(screen.getByRole('button', { name: 'auth.saving' })).toBeDisabled();
  });

  it('wires password changes and submit', () => {
    const handlePasswordChange = vi.fn();
    const handleConfirmPasswordChange = vi.fn();
    const handleSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    useResetForm.mockReturnValue(
      mockForm({ handlePasswordChange, handleConfirmPasswordChange, handleSubmit })
    );
    render(h(ResetForm));

    fireEvent.change(screen.getByPlaceholderText('common.password'), {
      target: { value: 'p1' },
    });
    fireEvent.change(screen.getByPlaceholderText('common.confirmPassword'), {
      target: { value: 'p1' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'AUTH.CONFIRM' }).closest('form')!);

    expect(handlePasswordChange).toHaveBeenCalled();
    expect(handleConfirmPasswordChange).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalled();
  });
});
