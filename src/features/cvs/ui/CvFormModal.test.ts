import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

vi.mock('@/components/ui/input', () => ({
  Input: ({
    helperText,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & { helperText?: string }) =>
    h('div', null, h('input', props), helperText ? h('p', null, helperText) : null),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({
    helperText,
    ...props
  }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { helperText?: string }) =>
    h('div', null, h('textarea', props), helperText ? h('p', null, helperText) : null),
}));

import { CvFormModal } from './CvFormModal';

describe('CvFormModal', () => {
  it('does not render when closed', () => {
    render(
      h(CvFormModal, {
        open: false,
        onOpenChange: vi.fn(),
        mode: 'create',
        loading: false,
        onSubmit: vi.fn(),
      })
    );
    expect(screen.queryByText('cv.create')).not.toBeInTheDocument();
  });

  it('validates required fields and submits create values', () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();

    render(
      h(CvFormModal, {
        open: true,
        onOpenChange,
        mode: 'create',
        loading: false,
        error: 'save failed',
        onSubmit,
      })
    );

    expect(screen.getByRole('heading', { name: 'cv.create' })).toBeInTheDocument();
    expect(screen.getByText('save failed')).toBeInTheDocument();

    const submit = screen.getByRole('button', { name: 'cv.create' });
    fireEvent.submit(submit.closest('form')!);
    expect(screen.getByText('validation.nameRequired')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText('common.name'), {
      target: { value: ' CV ' },
    });
    fireEvent.change(screen.getByPlaceholderText('common.education'), {
      target: { value: ' BS ' },
    });
    fireEvent.change(screen.getByPlaceholderText('common.description'), {
      target: { value: ' Desc ' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'cv.create' }).closest('form')!);

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'CV',
      education: 'BS',
      description: 'Desc',
    });

    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows edit title and saving label', () => {
    render(
      h(CvFormModal, {
        open: true,
        onOpenChange: vi.fn(),
        mode: 'edit',
        initial: { name: 'A', education: 'B', description: 'C' },
        loading: true,
        onSubmit: vi.fn(),
      })
    );

    expect(screen.getByText('cv.update')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.saving' })).toBeDisabled();
  });
});
