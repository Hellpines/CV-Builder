import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { replace, clearStore, logout, authState } = vi.hoisted(() => ({
  replace: vi.fn(),
  clearStore: vi.fn(async () => undefined),
  logout: vi.fn(),
  authState: {
    user: {
      id: 'u1',
      profile: {
        first_name: 'Ann',
        last_name: 'Bee',
        full_name: 'Ann Bee',
        avatar: '',
      },
    } as {
      id: string;
      profile: {
        first_name?: string;
        last_name?: string;
        full_name?: string;
        avatar?: string;
      } | null;
    } | null,
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => h('img', props),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    h('a', { href, ...props }, children),
}));

vi.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ clearStore }),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: (
    selector: (state: { user: typeof authState.user; logout: typeof logout }) => unknown
  ) => selector({ user: authState.user, logout }),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => h('div', null, children),
  DropdownMenuTrigger: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
    h('button', { type: 'button', ...props }, children),
  DropdownMenuContent: ({ children }: { children?: React.ReactNode }) => h('div', null, children),
  DropdownMenuSeparator: () => h('hr'),
  DropdownMenuItem: ({
    children,
    onClick,
    render,
    className,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    render?: React.ReactElement<{ href?: string }>;
    className?: string;
  }) => {
    if (render) {
      return h('a', { href: render.props.href, className, onClick }, children);
    }
    return h('button', { type: 'button', onClick, className }, children);
  },
}));

import { UserMenu } from './UserMenu';

describe('UserMenu', () => {
  beforeEach(() => {
    replace.mockReset();
    clearStore.mockClear();
    logout.mockReset();
    authState.user = {
      id: 'u1',
      profile: {
        first_name: 'Ann',
        last_name: 'Bee',
        full_name: 'Ann Bee',
        avatar: '',
      },
    };
  });

  it('shows initials and labels when open', () => {
    render(h(UserMenu, { isOpen: true }));

    expect(screen.getByText('AB')).toBeInTheDocument();
    expect(screen.getAllByText('Ann Bee').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /common.profile/ })).toHaveAttribute(
      'href',
      '/users/u1'
    );
    expect(screen.getByRole('link', { name: /common.settings/ })).toHaveAttribute(
      'href',
      '/settings'
    );
    expect(screen.getByText('common.logout')).toBeInTheDocument();
  });

  it('hides labels and uses avatar when closed', () => {
    authState.user = {
      id: 'u1',
      profile: {
        first_name: 'Ann',
        last_name: 'Bee',
        full_name: 'Ann Bee',
        avatar: 'https://cdn/a.png',
      },
    };

    render(h(UserMenu, { isOpen: false }));

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn/a.png');
    expect(screen.queryByText('common.profile')).not.toBeInTheDocument();
    expect(screen.queryByText('common.settings')).not.toBeInTheDocument();
    expect(screen.queryByText('common.logout')).not.toBeInTheDocument();
  });

  it('falls back to first name, then noName, and U initials', () => {
    authState.user = {
      id: 'u2',
      profile: { first_name: 'Ann', last_name: '', full_name: '', avatar: '' },
    };
    const { rerender } = render(h(UserMenu, { isOpen: true }));
    expect(screen.getByText('Ann')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();

    authState.user = { id: 'u3', profile: null };
    rerender(h(UserMenu, { isOpen: true }));
    expect(screen.getByText('user.noName')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('logs out, clears apollo store, and redirects to login', async () => {
    render(h(UserMenu, { isOpen: true }));

    fireEvent.click(screen.getByText('common.logout'));

    expect(logout).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(clearStore).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith('/login');
    });
  });
});
