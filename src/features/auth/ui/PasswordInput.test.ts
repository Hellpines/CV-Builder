import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('masks the value and shows an invalid state', () => {
    const onChange = vi.fn();

    render(
      h(PasswordInput, {
        value: 'secret',
        onChange,
        placeholder: 'common.password',
        className: 'extra',
        invalid: true,
        helperText: 'too short',
      })
    );

    const input = screen.getByPlaceholderText('common.password');
    const toggle = screen.getByRole('button');

    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveValue('secret');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('too short')).toBeInTheDocument();
    expect(toggle).toHaveClass('text-primary');

    fireEvent.change(input, { target: { value: 'next' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('toggles password visibility', () => {
    render(h(PasswordInput, { value: '', onChange: vi.fn(), placeholder: 'common.password' }));

    const input = screen.getByPlaceholderText('common.password');
    const toggle = screen.getByRole('button');

    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toHaveClass('text-primary-foreground');

    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'password');
  });
});
