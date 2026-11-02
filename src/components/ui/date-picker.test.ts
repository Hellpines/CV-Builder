import { createElement as h, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en-US' },
  }),
}));

vi.mock('@base-ui/react/popover', () => {
  function Root({
    children,
    open,
    onOpenChange,
  }: {
    children?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) {
    return h(
      'div',
      { 'data-open': open ? 'true' : 'false' },
      typeof children === 'function' ? null : children,
      h(
        'button',
        {
          type: 'button',
          'data-testid': 'force-close',
          onClick: () => onOpenChange?.(false),
        },
        'force-close'
      )
    );
  }

  const Trigger = ({
    children,
    className,
    disabled,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) =>
    h('button', { type: 'button', className, disabled, ...props }, children);

  const Portal = ({ children }: { children?: ReactNode }) => h('div', null, children);
  const Positioner = ({ children }: { children?: ReactNode }) => h('div', null, children);
  const Popup = ({ children, className }: { children?: ReactNode; className?: string }) =>
    h('div', { className }, children);

  return { Popover: { Root, Trigger, Portal, Positioner, Popup } };
});

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect, value }: { onSelect: (date: Date) => void; value?: Date | null }) =>
    h(
      'button',
      {
        type: 'button',
        onClick: () => onSelect(new Date(2024, 5, 20)),
      },
      value ? 'calendar-ready' : 'calendar-empty'
    ),
}));

import { DatePicker } from './date-picker';

describe('DatePicker', () => {
  it('renders empty label and helper text', () => {
    render(
      h(DatePicker, {
        label: 'Start',
        value: '',
        onChange: vi.fn(),
        helperText: 'Required',
        invalid: true,
      })
    );

    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('formats selected date and clears when clearable', () => {
    const onChange = vi.fn();
    render(
      h(DatePicker, {
        label: 'Start',
        value: '2024-06-15',
        onChange,
        clearable: true,
      })
    );

    expect(screen.getByText('06/15/2024')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'common.clear Start' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('selects a day from calendar and calls onTouched', () => {
    const onChange = vi.fn();
    const onTouched = vi.fn();

    render(
      h(DatePicker, {
        label: 'Start',
        value: '2024-06-15',
        onChange,
        onTouched,
        minDate: '2024-06-01',
        maxDate: '2024-06-30',
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'calendar-ready' }));
    expect(onChange).toHaveBeenCalledWith('2024-06-20');
    expect(onTouched).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('force-close'));
    expect(onTouched).toHaveBeenCalledTimes(2);
  });

  it('hides clear when disabled', () => {
    render(
      h(DatePicker, {
        label: 'Start',
        value: '2024-06-15',
        onChange: vi.fn(),
        clearable: true,
        disabled: true,
      })
    );

    expect(screen.queryByRole('button', { name: 'common.clear Start' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
  });
});
