import { createElement as h } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CvListItem } from '../types/CvTypes';

const { useCv, useCvActions } = vi.hoisted(() => ({
  useCv: vi.fn(),
  useCvActions: vi.fn(),
}));

vi.mock('../models/useCv', () => ({ useCv }));
vi.mock('../models/useCvActions', () => ({ useCvActions }));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
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

import { CvDetailsPage } from './CvDetailsPage';

const cv = {
  id: 'c1',
  name: 'Frontend',
  education: 'BS',
  description: 'Desc',
} as unknown as CvListItem;

describe('CvDetailsPage', () => {
  beforeEach(() => {
    useCvActions.mockReturnValue({
      update: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('shows error with retry', () => {
    const refetch = vi.fn();
    useCv.mockReturnValue({ cv: undefined, error: new Error('x'), refetch });
    render(h(CvDetailsPage));
    expect(screen.getByText('errors.loadCvDetails')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows skeleton while loading', () => {
    useCv.mockReturnValue({ cv: undefined, error: undefined, refetch: vi.fn() });
    const { container } = render(h(CvDetailsPage));
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('updates when dirty and valid', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    useCvActions.mockReturnValue({ update });
    useCv.mockReturnValue({ cv, error: undefined, refetch: vi.fn() });

    render(h(CvDetailsPage));

    expect(screen.getByRole('button', { name: 'common.update' })).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('common.name'), {
      target: { value: 'New name' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'common.update' }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith('c1', {
        name: 'New name',
        education: 'BS',
        description: 'Desc',
      })
    );
  });

  it('shows update error', async () => {
    useCvActions.mockReturnValue({
      update: vi.fn().mockRejectedValue(new Error('fail')),
    });
    useCv.mockReturnValue({ cv, error: undefined, refetch: vi.fn() });
    render(h(CvDetailsPage));

    fireEvent.change(screen.getByPlaceholderText('common.description'), {
      target: { value: 'Changed' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'common.update' }));
    await waitFor(() => expect(screen.getByText('fail')).toBeInTheDocument());
  });
});
