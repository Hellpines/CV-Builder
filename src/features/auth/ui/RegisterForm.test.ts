import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useRegisterForm } = vi.hoisted(() => ({
  useRegisterForm: vi.fn(),
}));

vi.mock('../models/useRegisterForm', () => ({ useRegisterForm }));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    h('a', { href }, children),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: () => h('nav'),
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

import { RegisterForm } from './RegisterForm';

function mockForm(overrides: Record<string, unknown> = {}) {
  return {
    email: '',
    setEmail: vi.fn(),
    password: '',
    setPassword: vi.fn(),
    confirmPassword: '',
    setConfirmPassword: vi.fn(),
    handleSubmit: vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
    loading: false,
    emailInvalid: false,
    passwordInvalid: false,
    confirmPasswordInvalid: false,
    emailHelperText: undefined,
    passwordHelperText: undefined,
    confirmPasswordHelperText: undefined,
    generalError: null,
    isFormValid: false,
    ...overrides,
  };
}

describe('RegisterForm', () => {
  beforeEach(() => useRegisterForm.mockReset());

  it('renders fields and login link', () => {
    useRegisterForm.mockReturnValue(mockForm({ email: 'a@b.com' }));
    render(h(RegisterForm));

    expect(screen.getByRole('heading', { name: 'auth.signUp' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('common.email')).toHaveValue('a@b.com');
    expect(screen.getByPlaceholderText('common.password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('common.confirmPassword')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AUTH.HAVEACCOUNT' })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('shows helpers, general error, and disables invalid submit', () => {
    useRegisterForm.mockReturnValue(
      mockForm({
        emailHelperText: 'bad email',
        passwordHelperText: 'bad pass',
        confirmPasswordHelperText: 'mismatch',
        generalError: 'failed',
        isFormValid: false,
      })
    );
    render(h(RegisterForm));

    expect(screen.getByText('bad email')).toBeInTheDocument();
    expect(screen.getByText('bad pass')).toBeInTheDocument();
    expect(screen.getByText('mismatch')).toBeInTheDocument();
    expect(screen.getByText('failed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AUTH.CREATEACCOUNT' })).toBeDisabled();
  });

  it('shows loading and wires changes when valid', () => {
    const setEmail = vi.fn();
    const setPassword = vi.fn();
    const setConfirmPassword = vi.fn();
    const handleSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());

    useRegisterForm.mockReturnValue(
      mockForm({
        isFormValid: true,
        loading: true,
        setEmail,
        setPassword,
        setConfirmPassword,
        handleSubmit,
      })
    );
    render(h(RegisterForm));

    expect(screen.getByRole('button', { name: 'auth.loading' })).toBeDisabled();

    useRegisterForm.mockReturnValue(
      mockForm({ isFormValid: true, setEmail, setPassword, setConfirmPassword, handleSubmit })
    );
    render(h(RegisterForm));

    fireEvent.change(screen.getAllByPlaceholderText('common.email')[0], {
      target: { value: 'x@y.com' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('common.password')[0], {
      target: { value: 'p1' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('common.confirmPassword')[0], {
      target: { value: 'p1' },
    });
    fireEvent.submit(
      screen.getAllByRole('button', { name: 'AUTH.CREATEACCOUNT' })[0].closest('form')!
    );

    expect(setEmail).toHaveBeenCalledWith('x@y.com');
    expect(setPassword).toHaveBeenCalledWith('p1');
    expect(setConfirmPassword).toHaveBeenCalledWith('p1');
    expect(handleSubmit).toHaveBeenCalled();
  });
});
