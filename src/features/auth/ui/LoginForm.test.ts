import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useLoginForm } = vi.hoisted(() => ({
  useLoginForm: vi.fn(),
}));

vi.mock('../models/useLoginForm', () => ({ useLoginForm }));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    h('a', { href }, children),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ items }: { items: { href: string; label: string }[] }) =>
    h(
      'nav',
      null,
      items.map((item) => h('a', { key: item.href, href: item.href }, item.label))
    ),
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
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    helperText?: string;
    invalid?: boolean;
  }) =>
    h(
      'div',
      null,
      h('input', { type: 'password', 'aria-invalid': invalid || undefined, ...props }),
      helperText ? h('p', null, helperText) : null
    ),
}));

import { LoginForm } from './LoginForm';

function mockLoginForm(overrides: Record<string, unknown> = {}) {
  return {
    email: '',
    setEmail: vi.fn(),
    password: '',
    setPassword: vi.fn(),
    handleSubmit: vi.fn((event: { preventDefault: () => void }) => event.preventDefault()),
    loading: false,
    emailInvalid: false,
    passwordInvalid: false,
    emailHelperText: undefined,
    passwordHelperText: undefined,
    generalError: null,
    isFormValid: false,
    ...overrides,
  };
}

describe('LoginForm', () => {
  beforeEach(() => {
    useLoginForm.mockReset();
  });

  it('renders welcome copy, fields, and forgot link', () => {
    useLoginForm.mockReturnValue(mockLoginForm({ email: 'a@b.com', password: 'secret' }));

    render(h(LoginForm));

    expect(screen.getByRole('heading', { name: 'auth.welcomeBack' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('common.email')).toHaveValue('a@b.com');
    expect(screen.getByPlaceholderText('common.password')).toHaveValue('secret');
    expect(screen.getByRole('link', { name: 'AUTH.FORGOTPASSWORD' })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
  });

  it('shows validation helpers and general error', () => {
    useLoginForm.mockReturnValue(
      mockLoginForm({
        emailInvalid: true,
        passwordInvalid: true,
        emailHelperText: 'Email is required',
        passwordHelperText: 'Password is required',
        generalError: 'Something went wrong',
        isFormValid: true,
      })
    );

    render(h(LoginForm));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('disables submit when the form is invalid', () => {
    useLoginForm.mockReturnValue(mockLoginForm({ isFormValid: false }));
    render(h(LoginForm));
    expect(screen.getByRole('button', { name: 'AUTH.SIGNIN' })).toBeDisabled();
  });

  it('shows loading label while loading', () => {
    useLoginForm.mockReturnValue(mockLoginForm({ isFormValid: true, loading: true }));
    render(h(LoginForm));
    expect(screen.getByRole('button', { name: 'auth.loading' })).toBeDisabled();
  });

  it('wires field changes and submit when valid', () => {
    const setEmail = vi.fn();
    const setPassword = vi.fn();
    const handleSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());

    useLoginForm.mockReturnValue(
      mockLoginForm({ isFormValid: true, setEmail, setPassword, handleSubmit })
    );

    render(h(LoginForm));

    fireEvent.change(screen.getByPlaceholderText('common.email'), {
      target: { value: 'user@mail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('common.password'), {
      target: { value: 'password1' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'AUTH.SIGNIN' }).closest('form')!);

    expect(setEmail).toHaveBeenCalledWith('user@mail.com');
    expect(setPassword).toHaveBeenCalledWith('password1');
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
