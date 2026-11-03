import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { usePasswordForm } = vi.hoisted(() => ({
  usePasswordForm: vi.fn(),
}));

vi.mock('../models/usePasswordForm', () => ({ usePasswordForm }));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/features/auth/ui/PasswordInput', () => ({
  PasswordInput: ({
    helperText,
    invalid,
    placeholder,
    value,
    onChange,
  }: {
    helperText?: string;
    invalid?: boolean;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) =>
    h(
      'div',
      null,
      h('input', {
        placeholder,
        value,
        onChange,
        'aria-invalid': invalid || undefined,
      }),
      helperText ? h('p', null, helperText) : null
    ),
}));

import { PasswordSection } from './PasswordSection';

function mockForm(overrides: Record<string, unknown> = {}) {
  return {
    values: { current: '', next: '', confirm: '' },
    errors: { current: '', next: '', confirm: '' },
    setField: vi.fn(),
    handleSubmit: vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
    canSubmit: false,
    ...overrides,
  };
}

describe('PasswordSection', () => {
  beforeEach(() => usePasswordForm.mockReset());

  it('renders fields and disables submit when cannot submit', () => {
    usePasswordForm.mockReturnValue(
      mockForm({
        values: { current: 'a', next: 'b', confirm: 'c' },
        errors: { current: 'err1', next: 'err2', confirm: 'err3' },
      })
    );
    render(h(PasswordSection));

    expect(screen.getByText('settings.password.title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('settings.password.current')).toHaveValue('a');
    expect(screen.getByText('err1')).toBeInTheDocument();
    expect(screen.getByText('err2')).toBeInTheDocument();
    expect(screen.getByText('err3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'settings.password.submit' })).toBeDisabled();
  });

  it('wires field changes and submit when canSubmit', () => {
    const setField = vi.fn();
    const handleSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    usePasswordForm.mockReturnValue(mockForm({ canSubmit: true, setField, handleSubmit }));
    render(h(PasswordSection));

    fireEvent.change(screen.getByPlaceholderText('settings.password.current'), {
      target: { value: 'old' },
    });
    fireEvent.change(screen.getByPlaceholderText('settings.password.new'), {
      target: { value: 'new' },
    });
    fireEvent.change(screen.getByPlaceholderText('settings.password.confirm'), {
      target: { value: 'new' },
    });
    fireEvent.submit(
      screen.getByRole('button', { name: 'settings.password.submit' }).closest('form')!
    );

    expect(setField).toHaveBeenCalledWith('current', 'old');
    expect(setField).toHaveBeenCalledWith('next', 'new');
    expect(setField).toHaveBeenCalledWith('confirm', 'new');
    expect(handleSubmit).toHaveBeenCalled();
  });
});
