import { createElement as h, type ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/modal', () => ({
  Modal: ({ open, title, children }: { open: boolean; title: string; children?: ReactNode }) =>
    open ? h('div', null, h('h2', null, title), children) : null,
}));

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
      null,
      h(
        'select',
        {
          'data-testid': 'picker-select',
          value: value ?? '',
          disabled,
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
            onValueChange?.(event.target.value || null);
          },
          onBlur: () => onOpenChange?.(false),
        },
        h('option', { value: '' }, ''),
        h('option', { value: 'react' }, 'react'),
        h('option', { value: 'vue' }, 'vue'),
        h('option', { value: 'junior' }, 'junior'),
        h('option', { value: 'senior' }, 'senior')
      ),
      children
    );
  }

  return {
    Select,
    SelectTrigger: ({
      children,
      helperText,
      invalid,
      'aria-label': ariaLabel,
    }: {
      children?: ReactNode;
      helperText?: string;
      invalid?: boolean;
      'aria-label'?: string;
    }) =>
      h(
        'div',
        { 'aria-label': ariaLabel, 'data-invalid': String(Boolean(invalid)) },
        children,
        helperText ? h('p', null, helperText) : null
      ),
    SelectValue: ({ children, className }: { children?: ReactNode; className?: string }) =>
      h('span', { className }, children),
    SelectContent: ({ children }: { children?: ReactNode }) => h('div', null, children),
    SelectItem: ({ children }: { children?: ReactNode }) => h('div', null, children),
  };
});

import { LevelModal } from './level-modal';

const options = [
  { value: 'react', label: 'React', tone: 'blue' as const },
  { value: 'vue', label: 'Vue', exists: true, tone: 'green' as const },
];
const levels = [
  { value: 'junior', label: 'Junior', tone: 'yellow' as const },
  { value: 'senior', label: 'Senior', tone: 'red' as const },
];

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: 'Add skill',
  optionLabel: 'Skill',
  levelLabel: 'Level',
  optionRequired: 'Skill required',
  levelRequired: 'Level required',
  duplicateMessage: 'Already added',
  options,
  levels,
  loading: false,
};

describe('LevelModal', () => {
  it('submits selected option and level', () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();

    render(h(LevelModal, { ...baseProps, onOpenChange, onSubmit }));

    const selects = screen.getAllByTestId('picker-select');
    fireEvent.change(selects[0], { target: { value: 'react' } });
    fireEvent.change(selects[1], { target: { value: 'senior' } });

    fireEvent.click(screen.getByRole('button', { name: 'common.add' }));
    expect(onSubmit).toHaveBeenCalledWith('react', 'senior');
  });

  it('shows duplicate error and blocks submit for existing option', () => {
    const onSubmit = vi.fn();
    render(h(LevelModal, { ...baseProps, onSubmit }));

    const selects = screen.getAllByTestId('picker-select');
    fireEvent.change(selects[0], { target: { value: 'vue' } });
    fireEvent.change(selects[1], { target: { value: 'junior' } });

    expect(screen.getByText('Already added')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.add' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'common.add' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('edits level with disabled option and cancels', () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();

    render(
      h(LevelModal, {
        ...baseProps,
        title: 'Edit skill',
        onOpenChange,
        onSubmit,
        initial: { option: 'react', level: 'junior' },
        options: [{ value: 'react', label: 'React', tone: 'blue' }],
        error: 'Server fail',
      })
    );

    expect(screen.getByText('Server fail')).toBeInTheDocument();
    expect(screen.getAllByTestId('picker-select')[0]).toBeDisabled();

    fireEvent.change(screen.getAllByTestId('picker-select')[1], {
      target: { value: 'senior' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'common.update' }));
    expect(onSubmit).toHaveBeenCalledWith('react', 'senior');

    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows required validation after closing empty selects', () => {
    render(h(LevelModal, { ...baseProps, onSubmit: vi.fn() }));

    fireEvent.blur(screen.getAllByTestId('picker-select')[0]);
    expect(screen.getByText('Skill required')).toBeInTheDocument();
  });

  it('shows saving label while loading', () => {
    render(
      h(LevelModal, {
        ...baseProps,
        loading: true,
        onSubmit: vi.fn(),
        initial: { option: 'react', level: 'junior' },
        options: [{ value: 'react', label: 'React' }],
      })
    );

    expect(screen.getByRole('button', { name: 'common.saving' })).toBeDisabled();
  });
});
