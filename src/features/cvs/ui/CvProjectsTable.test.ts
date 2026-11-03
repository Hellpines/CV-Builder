import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CvProjectItem } from '../types/CvProjectTypes';

const { useIsCompact } = vi.hoisted(() => ({
  useIsCompact: vi.fn(() => false),
}));

vi.mock('@/shared/hooks/useIsCompact', () => ({
  useIsCompact: () => useIsCompact(),
}));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => h('div', null, children),
  DropdownMenuTrigger: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
    h('button', { type: 'button', ...props }, children),
  DropdownMenuContent: ({ children }: { children?: React.ReactNode }) => h('div', null, children),
  DropdownMenuItem: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) =>
    h('button', { type: 'button', onClick }, children),
}));

import { CvProjectsTable } from './CvProjectsTable';

const item = {
  id: 'i1',
  name: 'Bank',
  domain: 'Fintech',
  description: 'App',
  start_date: '2020-01-01',
  end_date: null,
  environment: ['React'],
  roles: ['Dev'],
  responsibilities: ['UI', 'API'],
  project: { id: 'p1' },
} as unknown as CvProjectItem;

describe('CvProjectsTable', () => {
  beforeEach(() => useIsCompact.mockReturnValue(false));

  it('shows skeleton and empty states', () => {
    const { rerender, container } = render(
      h(CvProjectsTable, {
        items: [],
        loading: true,
        emptyText: 'empty',
        sortKey: null,
        sortDirection: 'asc',
        onSort: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      })
    );
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);

    rerender(
      h(CvProjectsTable, {
        items: [],
        loading: false,
        emptyText: 'no projects',
        sortKey: null,
        sortDirection: 'asc',
        onSort: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      })
    );
    expect(screen.getByText('no projects')).toBeInTheDocument();
  });

  it('renders rows, till-now, responsibilities, sort and actions', () => {
    const onSort = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      h(CvProjectsTable, {
        items: [item],
        loading: false,
        emptyText: 'empty',
        sortKey: 'name',
        sortDirection: 'asc',
        onSort,
        onEdit,
        onDelete,
      })
    );

    expect(screen.getByText('Bank')).toBeInTheDocument();
    expect(screen.getByText('Fintech')).toBeInTheDocument();
    expect(screen.getByText('cv.tillNow')).toBeInTheDocument();
    expect(screen.getByText('UI')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /common.name/ }));
    expect(onSort).toHaveBeenCalledWith('name');

    fireEvent.click(screen.getByText('common.update'));
    fireEvent.click(screen.getByText('common.delete'));
    expect(onEdit).toHaveBeenCalledWith(item);
    expect(onDelete).toHaveBeenCalledWith(item);
  });

  it('hides domain in compact mode', () => {
    useIsCompact.mockReturnValue(true);
    render(
      h(CvProjectsTable, {
        items: [{ ...item, responsibilities: [], end_date: '2021-01-01' } as CvProjectItem],
        loading: false,
        emptyText: 'empty',
        sortKey: 'endDate',
        sortDirection: 'desc',
        onSort: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      })
    );

    expect(screen.queryByText('cv.projectDomain')).not.toBeInTheDocument();
    expect(screen.queryByText('Fintech')).not.toBeInTheDocument();
  });
});
