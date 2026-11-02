import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CvListItem } from '../types/CvTypes';

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

import { CvsTable } from './CvsTable';

const cv = {
  id: 'c1',
  name: 'Frontend',
  education: 'BS',
  description: 'React CV',
  user: { email: 'a@b.com' },
} as unknown as CvListItem;

describe('CvsTable', () => {
  beforeEach(() => useIsCompact.mockReturnValue(false));

  it('shows skeleton while loading', () => {
    const { container } = render(
      h(CvsTable, {
        items: [],
        loading: true,
        busy: false,
        emptyText: 'empty',
        sortDirection: 'asc',
        onSort: vi.fn(),
        onView: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      })
    );
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('shows empty text', () => {
    render(
      h(CvsTable, {
        items: [],
        loading: false,
        busy: false,
        emptyText: 'no cvs',
        sortDirection: 'desc',
        onSort: vi.fn(),
        onView: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      })
    );
    expect(screen.getByText('no cvs')).toBeInTheDocument();
  });

  it('renders rows, sorts, and wires actions', () => {
    const onSort = vi.fn();
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      h(CvsTable, {
        items: [cv],
        loading: false,
        busy: true,
        emptyText: 'empty',
        sortDirection: 'asc',
        onSort,
        onView,
        onEdit,
        onDelete,
      })
    );

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('BS')).toBeInTheDocument();
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
    expect(screen.getByText('React CV')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /common.name/ }));
    expect(onSort).toHaveBeenCalled();

    fireEvent.click(screen.getByText('common.view'));
    fireEvent.click(screen.getByText('common.edit'));
    fireEvent.click(screen.getByText('common.delete'));
    expect(onView).toHaveBeenCalledWith(cv);
    expect(onEdit).toHaveBeenCalledWith(cv);
    expect(onDelete).toHaveBeenCalledWith(cv);
  });

  it('hides employee column in compact mode and uses fallback email', () => {
    useIsCompact.mockReturnValue(true);
    render(
      h(CvsTable, {
        items: [{ ...cv, user: null } as unknown as CvListItem],
        fallbackEmail: 'fallback@mail.com',
        loading: false,
        busy: false,
        emptyText: 'empty',
        sortDirection: 'desc',
        onSort: vi.fn(),
        onView: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      })
    );

    expect(screen.queryByText('user.employee')).not.toBeInTheDocument();
    expect(screen.queryByText('fallback@mail.com')).not.toBeInTheDocument();
  });
});
