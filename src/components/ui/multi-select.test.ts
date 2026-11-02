import { createElement as h, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@base-ui/react/select', () => {
  let rootDisabled = false;

  function Root({
    children,
    value,
    onValueChange,
    open,
    onOpenChange,
    disabled,
  }: {
    children?: ReactNode;
    value?: string[];
    onValueChange?: (value: string[]) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
  }) {
    rootDisabled = Boolean(disabled);
    return h(
      'div',
      {
        'data-open': open ? 'true' : 'false',
        'data-disabled': disabled ? 'true' : undefined,
      },
      h(
        'button',
        {
          type: 'button',
          'data-testid': 'open-select',
          onClick: () => {
            onOpenChange?.(true);
            onValueChange?.([...(value ?? []), 'c']);
          },
        },
        'open'
      ),
      children
    );
  }

  const Trigger = ({
    children,
    className,
    onKeyDown,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) =>
    h(
      'button',
      {
        type: 'button',
        role: 'combobox',
        className,
        onKeyDown,
        disabled: rootDisabled,
        ...props,
      },
      children
    );

  const Item = ({
    children,
    value,
    className,
  }: {
    children?: ReactNode;
    value?: string;
    className?: string;
  }) => h('div', { className, 'data-value': value }, children);

  const ItemText = ({ children }: { children?: ReactNode }) => h('span', null, children);
  const ItemIndicator = ({ children }: { children?: ReactNode }) => h('span', null, children);

  return {
    Select: {
      Root,
      Trigger,
      Item,
      ItemText,
      ItemIndicator,
    },
  };
});

vi.mock('@/components/ui/select', () => ({
  SelectContent: ({ children }: { children?: ReactNode }) => h('div', null, children),
}));

import { MultiSelect } from './multi-select';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

describe('MultiSelect', () => {
  it('renders placeholder and helper text', () => {
    render(
      h(MultiSelect, {
        options,
        value: [],
        onValueChange: vi.fn(),
        placeholder: 'Pick many',
        helperText: 'Need one',
        invalid: true,
      })
    );

    expect(screen.getAllByText('Pick many').length).toBeGreaterThan(0);
    expect(screen.getByText('Need one')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows chips and removes one without opening', () => {
    const onValueChange = vi.fn();
    render(
      h(MultiSelect, {
        options,
        value: ['a', 'b'],
        onValueChange,
        label: 'Tags',
        display: 'chips',
      })
    );

    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0);
    expect(screen.getByText('Tags').className).toContain('opacity-100');

    fireEvent.click(screen.getByLabelText('Remove Alpha'));
    expect(onValueChange).toHaveBeenCalledWith(['b']);
  });

  it('renders text display and removes last via Backspace', () => {
    const onValueChange = vi.fn();
    render(
      h(MultiSelect, {
        options,
        value: ['a', 'b'],
        onValueChange,
        placeholder: 'Pick',
        display: 'text',
      })
    );

    expect(screen.getByText('Alpha, Beta')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Backspace' });
    expect(onValueChange).toHaveBeenCalledWith(['a']);
  });

  it('propagates option selection through root', () => {
    const onValueChange = vi.fn();
    render(
      h(MultiSelect, {
        options,
        value: [],
        onValueChange,
        placeholder: 'Pick',
      })
    );

    fireEvent.click(screen.getByTestId('open-select'));
    expect(onValueChange).toHaveBeenCalledWith(['c']);
  });

  it('disables chip remove and keeps disabled styles', () => {
    render(
      h(MultiSelect, {
        options,
        value: ['a'],
        onValueChange: vi.fn(),
        disabled: true,
        label: 'Tags',
      })
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByLabelText('Remove Alpha').className).toContain('pointer-events-none');
  });
});
