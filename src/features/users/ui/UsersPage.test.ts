import { createElement as h } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { useQuery } = vi.hoisted(() => ({
  useQuery: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => useQuery(...args),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/app-loader', () => ({
  AppLoader: () => h('div', { 'data-testid': 'loader' }),
}));

vi.mock('@/components/ui/search-input', () => ({
  SearchInput: ({ value, onChange }: { value: string; onChange: (value: string) => void }) =>
    h('input', {
      'data-testid': 'search',
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    }),
}));

vi.mock('./UsersTable', () => ({
  default: ({
    data,
    onSort,
    sortKey,
    sortDirection,
  }: {
    data: { id: string }[];
    onSort: (key: string) => void;
    sortKey: string | null;
    sortDirection: string;
  }) =>
    h(
      'div',
      { 'data-testid': 'users-table', 'data-sort': `${sortKey}:${sortDirection}` },
      h('button', { type: 'button', onClick: () => onSort('email') }, 'sort-email'),
      h('span', null, String(data.length))
    ),
}));

vi.mock('./Pagination', () => ({
  Pagination: ({
    page,
    onPageChange,
    onPageSizeChange,
  }: {
    page: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  }) =>
    h(
      'div',
      { 'data-testid': 'pagination', 'data-page': String(page) },
      h('button', { type: 'button', onClick: () => onPageChange(2) }, 'page-2'),
      h('button', { type: 'button', onClick: () => onPageSizeChange(20) }, 'size-20')
    ),
}));

import { UsersPage } from './UsersPage';
import { GET_USERS } from '../api/UserQueries';

describe('UsersPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useQuery.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loader while first loading', () => {
    useQuery.mockReturnValue({
      data: undefined,
      previousData: undefined,
      loading: true,
      error: undefined,
    });
    render(h(UsersPage));
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('shows error message', () => {
    useQuery.mockReturnValue({
      data: undefined,
      previousData: undefined,
      loading: false,
      error: new Error('boom'),
    });
    render(h(UsersPage));
    expect(screen.getByText(/errors.loadUsers/)).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it('renders table and pagination, wires search/sort/page', () => {
    useQuery.mockReturnValue({
      data: {
        users: {
          items: [{ id: '1' }, { id: '2' }],
          total_pages: 3,
        },
      },
      previousData: undefined,
      loading: false,
      error: undefined,
    });

    render(h(UsersPage));

    expect(screen.getByTestId('users-table')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(useQuery).toHaveBeenCalledWith(
      GET_USERS,
      expect.objectContaining({
        variables: expect.objectContaining({
          params: expect.objectContaining({ page: 1, limit: 10 }),
        }),
      })
    );

    fireEvent.change(screen.getByTestId('search'), { target: { value: 'ann' } });
    expect(useQuery).toHaveBeenLastCalledWith(
      GET_USERS,
      expect.objectContaining({
        variables: expect.objectContaining({
          params: expect.objectContaining({ page: 1 }),
        }),
      })
    );
    expect(useQuery.mock.lastCall?.[1]?.variables?.params?.search).toBeUndefined();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(useQuery).toHaveBeenLastCalledWith(
      GET_USERS,
      expect.objectContaining({
        variables: expect.objectContaining({
          params: expect.objectContaining({ search: 'ann', page: 1 }),
        }),
      })
    );

    fireEvent.click(screen.getByText('sort-email'));
    expect(useQuery).toHaveBeenLastCalledWith(
      GET_USERS,
      expect.objectContaining({
        variables: expect.objectContaining({
          params: expect.objectContaining({
            sort_by: 'email',
            sort_order: 'asc',
            page: 1,
          }),
        }),
      })
    );

    fireEvent.click(screen.getByText('sort-email'));
    expect(useQuery).toHaveBeenLastCalledWith(
      GET_USERS,
      expect.objectContaining({
        variables: expect.objectContaining({
          params: expect.objectContaining({ sort_order: 'desc' }),
        }),
      })
    );

    fireEvent.click(screen.getByText('page-2'));
    expect(screen.getByTestId('pagination')).toHaveAttribute('data-page', '2');

    fireEvent.click(screen.getByText('size-20'));
    expect(useQuery).toHaveBeenLastCalledWith(
      GET_USERS,
      expect.objectContaining({
        variables: expect.objectContaining({
          params: expect.objectContaining({ limit: 20, page: 1 }),
        }),
      })
    );
  });

  it('keeps previous data visible while refetching', () => {
    useQuery.mockReturnValue({
      data: undefined,
      previousData: {
        users: { items: [{ id: '1' }], total_pages: 1 },
      },
      loading: true,
      error: undefined,
    });

    render(h(UsersPage));
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    expect(screen.getByTestId('users-table')).toBeInTheDocument();
  });

  it('hides pagination when there are no users', () => {
    useQuery.mockReturnValue({
      data: {
        users: {
          items: [],
          total_pages: 0,
          total: 0,
        },
      },
      previousData: undefined,
      loading: false,
      error: undefined,
    });

    render(h(UsersPage));
    expect(screen.getByTestId('users-table')).toBeInTheDocument();
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });
});
