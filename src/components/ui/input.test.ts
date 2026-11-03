import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('renders floating label and helper text', () => {
    render(h(Input, { placeholder: 'Email', helperText: 'Required', value: '' }));

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('data-slot', 'input');
  });

  it('floats label when focused or valued', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { rerender } = render(h(Input, { placeholder: 'Name', value: '', onFocus, onBlur }));

    const label = screen.getByText('Name');
    expect(label.className).toContain('top-1/2');

    fireEvent.focus(screen.getByRole('textbox'));
    expect(onFocus).toHaveBeenCalled();
    expect(label.className).toContain('-top-4');

    fireEvent.blur(screen.getByRole('textbox'));
    expect(onBlur).toHaveBeenCalled();
    expect(label.className).toContain('top-1/2');

    rerender(h(Input, { placeholder: 'Name', value: 'Ann' }));
    expect(screen.getByText('Name').className).toContain('-top-4');
  });

  it('marks invalid from prop or aria-invalid', () => {
    const { rerender } = render(h(Input, { placeholder: 'X', invalid: true, value: '' }));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('X').className).toContain('text-primary');

    rerender(h(Input, { placeholder: 'X', value: '', 'aria-invalid': true }));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies disabled styles', () => {
    render(h(Input, { placeholder: 'X', value: '', disabled: true }));
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByText('X').className).toContain('text-input-disabled-text');
  });
});
