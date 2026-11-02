import { createElement as h } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { push, useCvs, useCvActions, useIsCompact } = vi.hoisted(() => ({
  push: vi.fn(),
  useCvs: vi.fn(),
  useCvActions: vi.fn(),
  useIsCompact: vi.fn(() => false),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));
vi.mock('@/shared/hooks/useIsCompact', () => ({
  useIsCompact: () => useIsCompact(),
}));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { name?: string }) => (opts?.name ? `${key}:${opts.name}` : key),
  }),
}));
vi.mock('../models/useCvs', () => ({ useCvs }));
vi.mock('../models/useCvActions', () => ({ useCvActions }));
vi.mock('@/components/ui/search-input', () => ({
  SearchInput: ({ value, onChange }: { value: string; onChange: (v: string) => void }) =>
    h('input', {
      'data-testid': 'search',
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    }),
}));
vi.mock('./CvsTable', () => ({
  CvsTable: ({
    onView,
    onEdit,
    onDelete,
    emptyText,
  }: {
    onView: (cv: { id: string; name: string }) => void;
    onEdit: (cv: { id: string; name: string }) => void;
    onDelete: (cv: { id: string; name: string }) => void;
    emptyText: string;
  }) => {
    const cv = { id: 'c1', name: 'Frontend', education: 'BS', description: 'D' };
    return h(
      'div',
      { 'data-testid': 'table' },
      h('span', null, emptyText),
      h('button', { type: 'button', onClick: () => onView(cv) }, 'view'),
      h('button', { type: 'button', onClick: () => onEdit(cv) }, 'edit'),
      h('button', { type: 'button', onClick: () => onDelete(cv) }, 'delete')
    );
  },
}));
vi.mock('./CvFormModal', () => ({
  CvFormModal: ({
    open,
    mode,
    onSubmit,
    onOpenChange,
    error,
  }: {
    open: boolean;
    mode: string;
    onSubmit: (v: { name: string; education: string; description: string }) => void;
    onOpenChange: (open: boolean) => void;
    error?: string;
  }) =>
    open
      ? h(
          'div',
          { 'data-testid': 'form-modal', 'data-mode': mode },
          error ? h('p', null, error) : null,
          h(
            'button',
            {
              type: 'button',
              onClick: () => onSubmit({ name: 'N', education: 'E', description: 'D' }),
            },
            'submit-form'
          ),
          h('button', { type: 'button', onClick: () => onOpenChange(false) }, 'close-form')
        )
      : null,
}));
vi.mock('@/components/ui/confirm-modal', () => ({
  ConfirmModal: ({
    open,
    onConfirm,
    message,
  }: {
    open: boolean;
    onConfirm: () => void;
    message: string;
  }) =>
    open
      ? h(
          'div',
          { 'data-testid': 'confirm' },
          h('p', null, message),
          h('button', { type: 'button', onClick: onConfirm }, 'confirm-delete')
        )
      : null,
}));
vi.mock('@/features/users/ui/Pagination', () => ({
  Pagination: () => h('div', { 'data-testid': 'pagination' }),
}));

import { CvsPage } from './CvsPage';

function mockCvs(overrides: Record<string, unknown> = {}) {
  return {
    search: '',
    setSearch: vi.fn(),
    items: [{ id: 'c1', name: 'Frontend' }],
    email: 'a@b.com',
    initialLoading: false,
    loading: false,
    isSearching: false,
    sortDirection: 'asc',
    toggleSort: vi.fn(),
    total: 5,
    page: 1,
    totalPages: 1,
    limit: 10,
    setPage: vi.fn(),
    setLimit: vi.fn(),
    error: undefined,
    refetch: vi.fn(),
    ...overrides,
  };
}

describe('CvsPage', () => {
  beforeEach(() => {
    push.mockReset();
    useIsCompact.mockReturnValue(false);
    useCvActions.mockReturnValue({
      create: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    });
    useCvs.mockReturnValue(mockCvs());
  });

  it('shows load error with retry', () => {
    const refetch = vi.fn();
    useCvs.mockReturnValue(mockCvs({ error: new Error('x'), refetch }));
    render(h(CvsPage));
    expect(screen.getByText('errors.loadCvs')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('opens create modal and creates cv', async () => {
    const create = vi.fn().mockResolvedValue(undefined);
    useCvActions.mockReturnValue({ create, update: vi.fn(), remove: vi.fn() });
    render(h(CvsPage));

    fireEvent.click(screen.getByLabelText('cv.create'));
    expect(screen.getByTestId('form-modal')).toHaveAttribute('data-mode', 'create');
    fireEvent.click(screen.getByText('submit-form'));
    await waitFor(() => expect(create).toHaveBeenCalled());
  });

  it('views, edits, deletes and shows pagination when total > 10', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const remove = vi.fn().mockResolvedValue(undefined);
    useCvActions.mockReturnValue({ create: vi.fn(), update, remove });
    useCvs.mockReturnValue(mockCvs({ total: 11, isSearching: true }));

    render(h(CvsPage));
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByText('errors.noCvsFound')).toBeInTheDocument();

    fireEvent.click(screen.getByText('view'));
    expect(push).toHaveBeenCalledWith('/cvs/c1');

    fireEvent.click(screen.getByText('edit'));
    expect(screen.getByTestId('form-modal')).toHaveAttribute('data-mode', 'edit');
    fireEvent.click(screen.getByText('submit-form'));
    await waitFor(() => expect(update).toHaveBeenCalledWith('c1', expect.any(Object)));

    fireEvent.click(screen.getByText('delete'));
    expect(screen.getByText('errors.deleteCvMessage:Frontend')).toBeInTheDocument();
    fireEvent.click(screen.getByText('confirm-delete'));
    await waitFor(() => expect(remove).toHaveBeenCalledWith('c1'));
  });

  it('surfaces action errors', async () => {
    useCvActions.mockReturnValue({
      create: vi.fn().mockRejectedValue(new Error('nope')),
      update: vi.fn(),
      remove: vi.fn(),
    });
    render(h(CvsPage));
    fireEvent.click(screen.getByLabelText('cv.create'));
    fireEvent.click(screen.getByText('submit-form'));
    await waitFor(() => expect(screen.getByText('nope')).toBeInTheDocument());
  });
});
