import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    disabled,
    children,
  }: {
    value?: string | null;
    onValueChange?: (value: string | null) => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) =>
    h(
      'div',
      { 'data-disabled': String(Boolean(disabled)), 'data-value': value ?? '' },
      h(
        'button',
        {
          type: 'button',
          disabled,
          onClick: () => onValueChange?.('2'),
        },
        'change'
      ),
      children
    ),
  SelectTrigger: ({
    children,
    invalid,
    helperText,
  }: {
    children?: React.ReactNode;
    invalid?: boolean;
    helperText?: string;
  }) =>
    h(
      'div',
      { 'data-invalid': String(Boolean(invalid)) },
      children,
      helperText ? h('p', null, helperText) : null
    ),
  SelectValue: ({ children, className }: { children?: React.ReactNode; className?: string }) =>
    h('span', { className }, children),
  SelectContent: ({ children }: { children?: React.ReactNode }) => h('div', null, children),
  SelectItem: ({ value, children }: { value: string; children?: React.ReactNode }) =>
    h('div', { 'data-option': value }, children),
}));

import { FormSelect } from './FormSelect';

const options = [
  { id: '1', name: 'Eng' },
  { id: '2', name: 'HR' },
];

describe('FormSelect', () => {
  it('shows placeholder when empty and hides label', () => {
    render(
      h(FormSelect, {
        label: 'Department',
        placeholder: 'Select',
        options,
        value: null,
        onChange: vi.fn(),
      })
    );

    expect(screen.getByText('Select')).toBeInTheDocument();
    expect(screen.getByText('Department')).toHaveClass('opacity-0');
  });

  it('shows selected value, label, and calls onChange', () => {
    const onChange = vi.fn();
    render(
      h(FormSelect, {
        label: 'Department',
        placeholder: 'Select',
        options,
        value: '1',
        onChange,
      })
    );

    expect(screen.getAllByText('Eng').length).toBeGreaterThan(0);
    expect(screen.getByText('Department')).toHaveClass('opacity-100');
    fireEvent.click(screen.getByRole('button', { name: 'change' }));
    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('renders invalid helper and disabled state', () => {
    render(
      h(FormSelect, {
        label: 'Department',
        placeholder: 'Select',
        options,
        value: null,
        onChange: vi.fn(),
        disabled: true,
        invalid: true,
        errorText: 'Required',
      })
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'change' })).toBeDisabled();
  });
});
