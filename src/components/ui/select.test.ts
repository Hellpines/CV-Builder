import { createElement as h, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@base-ui/react/select', () => {
  const Root = ({ children }: { children?: ReactNode }) =>
    h('div', { 'data-select': 'root' }, children);
  const Trigger = ({
    children,
    className,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) =>
    h('button', { type: 'button', className, ...props }, children);
  const Value = ({ children, className }: { children?: ReactNode; className?: string }) =>
    h('span', { 'data-slot': 'select-value', className }, children);
  const Icon = ({ render }: { render?: React.ReactElement }) => render ?? null;
  const Portal = ({ children }: { children?: ReactNode }) => h('div', null, children);
  const Positioner = ({ children, className }: { children?: ReactNode; className?: string }) =>
    h('div', { className }, children);
  const Popup = ({ children, className, ...props }: { children?: ReactNode; className?: string }) =>
    h('div', { className, ...props }, children);
  const List = ({ children }: { children?: ReactNode }) => h('div', null, children);
  const Group = ({ children, className }: { children?: ReactNode; className?: string }) =>
    h('div', { className }, children);
  const GroupLabel = ({ children, className }: { children?: ReactNode; className?: string }) =>
    h('div', { className }, children);
  const Item = ({
    children,
    className,
    value,
    ...props
  }: {
    children?: ReactNode;
    className?: string;
    value?: string;
  }) => h('div', { className, 'data-value': value, ...props }, children);
  const ItemText = ({ children, className }: { children?: ReactNode; className?: string }) =>
    h('span', { className }, children);
  const ItemIndicator = ({ children }: { children?: ReactNode }) => h('span', null, children);
  const Separator = ({ className }: { className?: string }) => h('hr', { className });
  const ScrollUpArrow = ({ children, className }: { children?: ReactNode; className?: string }) =>
    h('div', { className }, children);
  const ScrollDownArrow = ({ children, className }: { children?: ReactNode; className?: string }) =>
    h('div', { className }, children);

  return {
    Select: {
      Root,
      Trigger,
      Value,
      Icon,
      Portal,
      Positioner,
      Popup,
      List,
      Group,
      GroupLabel,
      Item,
      ItemText,
      ItemIndicator,
      Separator,
      ScrollUpArrow,
      ScrollDownArrow,
    },
  };
});

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

describe('Select', () => {
  it('renders invalid trigger with helper text and size', () => {
    render(
      h(
        Select,
        null,
        h(
          SelectTrigger,
          { 'aria-label': 'City', invalid: true, helperText: 'Required', size: 'sm' },
          h(SelectValue, null, 'Pick')
        ),
        h(
          SelectContent,
          null,
          h(
            SelectGroup,
            null,
            h(SelectLabel, null, 'Cities'),
            h(SelectItem, { value: 'minsk' }, 'Minsk')
          ),
          h(SelectSeparator),
          h(SelectItem, { value: 'warsaw' }, 'Warsaw')
        )
      )
    );

    expect(screen.getByRole('button', { name: 'City' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: 'City' })).toHaveAttribute('data-size', 'sm');
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Cities')).toBeInTheDocument();
    expect(screen.getByText('Minsk')).toBeInTheDocument();
    expect(screen.getByText('Warsaw')).toBeInTheDocument();
  });

  it('marks invalid from aria-invalid string', () => {
    render(
      h(
        Select,
        null,
        h(
          SelectTrigger,
          { 'aria-label': 'Field', 'aria-invalid': 'true' },
          h(SelectValue, null, 'A')
        ),
        h(SelectContent, null, h(SelectItem, { value: 'a' }, 'A'))
      )
    );

    expect(screen.getByRole('button', { name: 'Field' })).toHaveAttribute('aria-invalid', 'true');
  });
});
