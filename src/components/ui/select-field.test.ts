import { createElement as h, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/ui/select', () => {
  function Select({
    children,
    value,
    onValueChange,
    onOpenChange,
    disabled,
  }: {
    children?: ReactNode;
    value?: string | null;
    onValueChange?: (value: string | null) => void;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
  }) {
    return h(
      'div',
      { 'data-disabled': disabled ? 'true' : undefined },
      h(
        'select',
        {
          'aria-label': 'native',
          value: value ?? '',
          disabled,
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
            onValueChange?.(event.target.value || null);
          },
          onBlur: () => onOpenChange?.(false),
        },
        h('option', { value: '' }, 'empty'),
        h('option', { value: 'js' }, 'js'),
        h('option', { value: 'ts' }, 'ts')
      ),
      children
    );
  }

  function passthrough({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) {
    return h('div', props, children);
  }

  return {
    Select,
    SelectTrigger: ({
      children,
      helperText,
      invalid,
      'aria-label': ariaLabel,
      className,
    }: {
      children?: ReactNode;
      helperText?: string;
      invalid?: boolean;
      'aria-label'?: string;
      className?: string;
    }) =>
      h(
        'div',
        { 'aria-label': ariaLabel, 'data-invalid': invalid ? 'true' : undefined, className },
        children,
        helperText ? h('p', null, helperText) : null
      ),
    SelectValue: ({ children, className }: { children?: ReactNode; className?: string }) =>
      h('span', { className }, children),
    SelectContent: passthrough,
    SelectItem: ({ children }: { children?: ReactNode }) => h('div', null, children),
  };
});

import { SelectField } from './select-field';

const options = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
];

describe('SelectField', () => {
  it('shows placeholder when empty and selected label when valued', () => {
    const { rerender } = render(
      h(SelectField, {
        label: 'Skill',
        placeholder: 'Choose',
        value: '',
        options,
        onChange: vi.fn(),
      })
    );

    expect(screen.getByText('Choose')).toBeInTheDocument();
    expect(screen.getByText('Skill').className).toContain('opacity-0');

    rerender(
      h(SelectField, {
        label: 'Skill',
        placeholder: 'Choose',
        value: 'ts',
        options,
        onChange: vi.fn(),
      })
    );

    expect(screen.getAllByText('TypeScript').length).toBeGreaterThan(0);
    expect(screen.getByText('Skill').className).toContain('opacity-100');
  });

  it('shows error helper and calls onChange/onTouched', () => {
    const onChange = vi.fn();
    const onTouched = vi.fn();

    render(
      h(SelectField, {
        label: 'Skill',
        placeholder: 'Choose',
        value: '',
        options,
        onChange,
        onTouched,
        invalid: true,
        errorText: 'Required',
      })
    );

    expect(screen.getByText('Required')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('native'), { target: { value: 'js' } });
    expect(onChange).toHaveBeenCalledWith('js');

    fireEvent.blur(screen.getByLabelText('native'));
    expect(onTouched).toHaveBeenCalled();
  });

  it('applies disabled value styling', () => {
    const { container } = render(
      h(SelectField, {
        label: 'Skill',
        placeholder: 'Choose',
        value: 'js',
        options,
        onChange: vi.fn(),
        disabled: true,
      })
    );

    expect(screen.getByLabelText('native')).toBeDisabled();
    expect(container.querySelector('.text-select-disabled-text')).toBeTruthy();
  });
});
