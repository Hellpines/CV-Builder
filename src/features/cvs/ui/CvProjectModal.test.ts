import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProjectInfo } from '../types/CvProjectTypes';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/modal', () => ({
  Modal: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
  }) => (open ? h('div', null, h('h2', null, title), children) : null),
}));

vi.mock('@/components/ui/select-field', () => ({
  SelectField: ({
    label,
    onChange,
    disabled,
    errorText,
  }: {
    label: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    errorText?: string;
  }) =>
    h(
      'div',
      null,
      h(
        'button',
        {
          type: 'button',
          disabled,
          onClick: () => onChange('p1'),
        },
        `select-${label}`
      ),
      errorText ? h('p', null, errorText) : null
    ),
}));

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({
    label,
    value,
    onChange,
    helperText,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    helperText?: string;
  }) =>
    h(
      'div',
      null,
      h('input', {
        'aria-label': label,
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
      }),
      helperText ? h('p', null, helperText) : null
    ),
}));

vi.mock('@/components/ui/multi-select', () => ({
  MultiSelect: ({
    label,
    value,
    onValueChange,
    disabled,
    helperText,
  }: {
    label: string;
    value: string[];
    onValueChange: (next: string[]) => void;
    disabled?: boolean;
    helperText?: string;
  }) =>
    h(
      'div',
      null,
      h(
        'button',
        {
          type: 'button',
          disabled,
          onClick: () => onValueChange(['Dev']),
        },
        `multi-${label}`
      ),
      h('span', null, value.join(',')),
      helperText ? h('p', null, helperText) : null
    ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => h('input', props),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => h('textarea', props),
}));

import { CvProjectModal } from './CvProjectModal';

const project: ProjectInfo = {
  id: 'p1',
  name: 'Bank',
  domain: 'Fintech',
  description: 'App',
  environment: ['React'],
  start_date: '2020-01-01',
  end_date: '2021-12-31',
};

describe('CvProjectModal', () => {
  it('does not render when closed', () => {
    render(
      h(CvProjectModal, {
        open: false,
        onOpenChange: vi.fn(),
        mode: 'add',
        projects: [project],
        roles: ['Dev'],
        loading: false,
        onSubmit: vi.fn(),
      })
    );
    expect(screen.queryByText('cv.projectCreate')).not.toBeInTheDocument();
  });

  it('validates and submits add payload', () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();

    render(
      h(CvProjectModal, {
        open: true,
        onOpenChange,
        mode: 'add',
        projects: [project],
        roles: ['Dev'],
        loading: false,
        error: 'oops',
        onSubmit,
      })
    );

    expect(screen.getByRole('heading', { name: 'cv.projectCreate' })).toBeInTheDocument();
    expect(screen.getByText('oops')).toBeInTheDocument();

    fireEvent.submit(screen.getByRole('button', { name: 'cv.projectCreate' }).closest('form')!);
    expect(screen.getByText('validation.projectRequired')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('select-common.name'));
    fireEvent.click(screen.getByText('multi-common.roles'));
    const responsibilityInputs = screen.getAllByPlaceholderText('common.responsibilities');
    const editableResponsibility = responsibilityInputs.find(
      (el) => !(el as HTMLInputElement).disabled
    )!;
    fireEvent.change(editableResponsibility, {
      target: { value: 'UI API' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'cv.projectCreate' }).closest('form')!);

    expect(onSubmit).toHaveBeenCalledWith({
      projectId: 'p1',
      start_date: '2020-01-01',
      end_date: '2021-12-31',
      roles: ['Dev'],
      responsibilities: ['UI', 'API'],
    });

    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables project select in edit mode and requires dirty state', () => {
    const onSubmit = vi.fn();
    render(
      h(CvProjectModal, {
        open: true,
        onOpenChange: vi.fn(),
        mode: 'edit',
        projects: [project],
        roles: ['Dev'],
        initial: {
          projectId: 'p1',
          startDate: '2020-01-01',
          endDate: '2021-12-31',
          roles: ['Dev'],
          responsibilities: 'UI',
        },
        loading: false,
        onSubmit,
      })
    );

    expect(screen.getByRole('heading', { name: 'cv.projectUpdate' })).toBeInTheDocument();
    expect(screen.getByText('select-common.name')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'common.update' })).toBeDisabled();

    const responsibilityInputs = screen.getAllByPlaceholderText('common.responsibilities');
    const editableResponsibility = responsibilityInputs.find(
      (el) => !(el as HTMLInputElement).disabled
    )!;
    fireEvent.change(editableResponsibility, {
      target: { value: 'UI API' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'common.update' }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('shows saving label while loading', () => {
    render(
      h(CvProjectModal, {
        open: true,
        onOpenChange: vi.fn(),
        mode: 'add',
        projects: [project],
        roles: ['Dev'],
        initial: {
          projectId: 'p1',
          startDate: '2020-01-01',
          endDate: '2021-12-31',
          roles: ['Dev'],
          responsibilities: '',
        },
        loading: true,
        onSubmit: vi.fn(),
      })
    );
    expect(screen.getByRole('button', { name: 'common.saving' })).toBeDisabled();
  });
});
