import { createElement as h } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useCvProjects, useCvProjectActions, useIsCompact } = vi.hoisted(() => ({
  useCvProjects: vi.fn(),
  useCvProjectActions: vi.fn(),
  useIsCompact: vi.fn(() => false),
}));

vi.mock('@/shared/hooks/useIsCompact', () => ({
  useIsCompact: () => useIsCompact(),
}));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { name?: string }) => (opts?.name ? `${key}:${opts.name}` : key),
  }),
}));
vi.mock('../models/useCvProjects', () => ({ useCvProjects }));
vi.mock('../models/useCvProjectActions', () => ({ useCvProjectActions }));
vi.mock('@/components/ui/search-input', () => ({
  SearchInput: ({ value, onChange }: { value: string; onChange: (v: string) => void }) =>
    h('input', {
      'data-testid': 'search',
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    }),
}));
vi.mock('./CvProjectsTable', () => ({
  CvProjectsTable: ({
    emptyText,
    onEdit,
    onDelete,
  }: {
    emptyText: string;
    onEdit: (item: { id: string; name: string; project: { id: string } }) => void;
    onDelete: (item: { id: string; name: string; project: { id: string } }) => void;
  }) => {
    const item = {
      id: 'i1',
      name: 'Bank',
      project: { id: 'p1', name: 'Bank' },
      start_date: '2020-01-01',
      end_date: null,
      roles: ['Dev'],
      responsibilities: ['UI'],
    };
    return h(
      'div',
      { 'data-testid': 'table' },
      h('span', null, emptyText),
      h('button', { type: 'button', onClick: () => onEdit(item) }, 'edit'),
      h('button', { type: 'button', onClick: () => onDelete(item) }, 'delete')
    );
  },
}));
vi.mock('./CvProjectModal', () => ({
  CvProjectModal: ({
    open,
    mode,
    onSubmit,
    onOpenChange,
    error,
  }: {
    open: boolean;
    mode: string;
    onSubmit: (payload: {
      projectId: string;
      start_date: string;
      end_date: string | null;
      roles: string[];
      responsibilities: string[];
    }) => void;
    onOpenChange: (open: boolean) => void;
    error?: string;
  }) =>
    open
      ? h(
          'div',
          { 'data-testid': 'project-modal', 'data-mode': mode },
          error ? h('p', null, error) : null,
          h(
            'button',
            {
              type: 'button',
              onClick: () =>
                onSubmit({
                  projectId: 'p2',
                  start_date: '2020-01-01',
                  end_date: null,
                  roles: ['Dev'],
                  responsibilities: ['UI'],
                }),
            },
            'submit-project'
          ),
          h('button', { type: 'button', onClick: () => onOpenChange(false) }, 'close-project'),
          h('button', { type: 'button', onClick: () => onOpenChange(true) }, 'keep-project')
        )
      : null,
}));
vi.mock('@/components/ui/confirm-modal', () => ({
  ConfirmModal: ({
    open,
    onConfirm,
    onOpenChange,
    message,
  }: {
    open: boolean;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
    message: string;
  }) =>
    open
      ? h(
          'div',
          { 'data-testid': 'confirm' },
          h('p', null, message),
          h('button', { type: 'button', onClick: onConfirm }, 'confirm-delete'),
          h('button', { type: 'button', onClick: () => onOpenChange(false) }, 'close-confirm'),
          h('button', { type: 'button', onClick: () => onOpenChange(true) }, 'keep-confirm')
        )
      : null,
}));

import { CvProjectsPage } from './CvProjectsPage';

function mockList(overrides: Record<string, unknown> = {}) {
  return {
    search: '',
    setSearch: vi.fn(),
    items: [],
    allItems: [],
    initialLoading: false,
    isSearching: false,
    sortKey: null,
    sortDirection: 'asc',
    toggleSort: vi.fn(),
    error: undefined,
    refetch: vi.fn(),
    ...overrides,
  };
}

describe('CvProjectsPage', () => {
  beforeEach(() => {
    useIsCompact.mockReturnValue(false);
    useCvProjectActions.mockReturnValue({
      catalog: [{ id: 'p2', name: 'Shop' }],
      roles: ['Dev'],
      add: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    });
    useCvProjects.mockReturnValue(mockList());
  });

  it('shows error with retry', () => {
    const refetch = vi.fn();
    useCvProjects.mockReturnValue(mockList({ error: new Error('x'), refetch }));
    render(h(CvProjectsPage, { cvId: 'c1' }));
    expect(screen.getByText('errors.loadProjects')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('adds a project', async () => {
    const add = vi.fn().mockResolvedValue(undefined);
    useCvProjectActions.mockReturnValue({
      catalog: [{ id: 'p2', name: 'Shop' }],
      roles: ['Dev'],
      add,
      update: vi.fn(),
      remove: vi.fn(),
    });
    render(h(CvProjectsPage, { cvId: 'c1' }));

    fireEvent.click(screen.getByLabelText('cv.projectCreate'));
    expect(screen.getByTestId('project-modal')).toHaveAttribute('data-mode', 'add');
    fireEvent.click(screen.getByText('submit-project'));
    await waitFor(() => expect(add).toHaveBeenCalled());
  });

  it('edits and deletes a project', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const remove = vi.fn().mockResolvedValue(undefined);
    useCvProjectActions.mockReturnValue({
      catalog: [],
      roles: ['Dev'],
      add: vi.fn(),
      update,
      remove,
    });
    useCvProjects.mockReturnValue(mockList({ isSearching: true }));

    render(h(CvProjectsPage, { cvId: 'c1' }));
    expect(screen.getByText('cv.noProjectsFound')).toBeInTheDocument();

    fireEvent.click(screen.getByText('edit'));
    expect(screen.getByTestId('project-modal')).toHaveAttribute('data-mode', 'edit');
    fireEvent.click(screen.getByText('submit-project'));
    await waitFor(() => expect(update).toHaveBeenCalled());

    fireEvent.click(screen.getByText('delete'));
    expect(screen.getByText('cv.deleteProjectMessage:Bank')).toBeInTheDocument();
    fireEvent.click(screen.getByText('confirm-delete'));
    await waitFor(() => expect(remove).toHaveBeenCalledWith('p1'));
  });

  it('surfaces action errors', async () => {
    useCvProjectActions.mockReturnValue({
      catalog: [{ id: 'p2' }],
      roles: [],
      add: vi.fn().mockRejectedValue(new Error('blocked')),
      update: vi.fn(),
      remove: vi.fn(),
    });
    render(h(CvProjectsPage, { cvId: 'c1' }));
    fireEvent.click(screen.getByLabelText('cv.projectCreate'));
    fireEvent.click(screen.getByText('submit-project'));
    await waitFor(() => expect(screen.getByText('blocked')).toBeInTheDocument());
  });

  it('closes project and confirm modals via onOpenChange', () => {
    render(h(CvProjectsPage, { cvId: 'c1' }));

    fireEvent.click(screen.getByLabelText('cv.projectCreate'));
    expect(screen.getByTestId('project-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('keep-project'));
    expect(screen.getByTestId('project-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByText('close-project'));
    expect(screen.queryByTestId('project-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('delete'));
    expect(screen.getByTestId('confirm')).toBeInTheDocument();
    fireEvent.click(screen.getByText('keep-confirm'));
    expect(screen.getByTestId('confirm')).toBeInTheDocument();
    fireEvent.click(screen.getByText('close-confirm'));
    expect(screen.queryByTestId('confirm')).not.toBeInTheDocument();
  });
});
