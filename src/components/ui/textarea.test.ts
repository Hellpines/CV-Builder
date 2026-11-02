import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders floating label and helper text', () => {
    render(h(Textarea, { placeholder: 'Bio', helperText: 'Too short', value: '' }));

    expect(screen.getByText('Bio')).toBeInTheDocument();
    expect(screen.getByText('Too short')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('data-slot', 'textarea');
  });

  it('floats label on focus and value', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { rerender } = render(h(Textarea, { placeholder: 'Notes', value: '', onFocus, onBlur }));

    const label = screen.getByText('Notes');
    expect(label.className).toContain('top-5');

    fireEvent.focus(screen.getByRole('textbox'));
    expect(onFocus).toHaveBeenCalled();
    expect(label.className).toContain('-top-4');

    fireEvent.blur(screen.getByRole('textbox'));
    expect(onBlur).toHaveBeenCalled();

    rerender(h(Textarea, { placeholder: 'Notes', value: 'Hello' }));
    expect(screen.getByText('Notes').className).toContain('-top-4');
  });

  it('handles invalid and disabled states', () => {
    const { rerender } = render(h(Textarea, { placeholder: 'X', invalid: true, value: '' }));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');

    rerender(h(Textarea, { placeholder: 'X', value: '', disabled: true }));
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByText('X').className).toContain('text-input-disabled-text');

    rerender(h(Textarea, { placeholder: 'X', value: '', 'aria-invalid': true }));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});
