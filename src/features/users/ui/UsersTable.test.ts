import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/shared/types/user';

const { push, useIsCompact } = vi.hoisted(() => ({
  push: vi.fn(),
  useIsCompact: vi.fn(() => false),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => h('img', props),
}));

vi.mock('@/shared/hooks/useIsCompact', () => ({
  useIsCompact: () => useIsCompact(),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import UsersTable from './UsersTable';

const user = {
  id: 'u1',
  created_at: '2024-01-01',
  email: 'a@b.com',
  is_verified: true,
  profile: {
    first_name: 'Ann',
    last_name: 'Bee',
    avatar: null,
  },
  role: 'Employee',
  department: { id: 'd1', name: 'Eng' },
  position: { id: 'p1', name: 'Dev' },
  cvs: null,
} as unknown as User;

const userWithAvatar = {
  ...user,
  id: 'u2',
  profile: { ...user.profile, avatar: 'https://cdn/a.png', first_name: '', last_name: '' },
  department: null,
  position: null,
} as unknown as User;

describe('UsersTable', () => {
  beforeEach(() => {
    push.mockReset();
    useIsCompact.mockReturnValue(false);
  });

  it('renders rows, sorts, and navigates on row click', () => {
    const onSort = vi.fn();
    render(
      h(UsersTable, {
        data: [user],
        sortKey: 'firstName',
        sortDirection: 'asc',
        onSort,
      })
    );

    expect(screen.getByText('Ann')).toBeInTheDocument();
    expect(screen.getByText('Bee')).toBeInTheDocument();
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
    expect(screen.getByText('Eng')).toBeInTheDocument();
    expect(screen.getByText('Dev')).toBeInTheDocument();
    expect(screen.getByText('AB')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'common.firstName' }));
    expect(onSort).toHaveBeenCalledWith('firstName');

    fireEvent.click(screen.getByText('Ann').closest('tr')!);
    expect(push).toHaveBeenCalledWith('/users/u1');

    fireEvent.click(screen.getByLabelText('user.viewEmployee'));
    expect(push).toHaveBeenCalledWith('/users/u1');
  });

  it('shows empty state and avatar image', () => {
    const { rerender } = render(
      h(UsersTable, {
        data: [],
        sortKey: null,
        sortDirection: 'asc',
        onSort: vi.fn(),
      })
    );
    expect(screen.getByText('errors.noUsersFound')).toBeInTheDocument();

    rerender(
      h(UsersTable, {
        data: [userWithAvatar],
        sortKey: 'email',
        sortDirection: 'desc',
        onSort: vi.fn(),
      })
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn/a.png');
  });

  it('hides email and position in compact mode', () => {
    useIsCompact.mockReturnValue(true);
    render(
      h(UsersTable, {
        data: [user],
        sortKey: null,
        sortDirection: 'asc',
        onSort: vi.fn(),
      })
    );

    expect(screen.queryByText('a@b.com')).not.toBeInTheDocument();
    expect(screen.queryByText('Dev')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'common.email' })).not.toBeInTheDocument();
  });
});
