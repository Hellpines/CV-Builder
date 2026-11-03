import { createElement as h } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { usePathname, useIsCompact } = vi.hoisted(() => ({
  usePathname: vi.fn(() => '/users'),
  useIsCompact: vi.fn(() => false),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => h('img', props),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => h('a', { href, onClick, ...props }, children),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/hooks/useIsCompact', () => ({
  useIsCompact: () => useIsCompact(),
}));

vi.mock('./UserMenu', () => ({
  UserMenu: ({ isOpen }: { isOpen: boolean }) =>
    h('div', { 'data-testid': 'user-menu', 'data-open': String(isOpen) }),
}));

import Sidebar from './Sidebar';

const mediaListeners: Array<() => void> = [];

function mockMatchMedia() {
  mediaListeners.length = 0;
  window.matchMedia = vi.fn().mockImplementation(
    (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (_event: string, callback: () => void) => {
          mediaListeners.push(callback);
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/users');
    useIsCompact.mockReturnValue(false);
    document.documentElement.className = '';
    mockMatchMedia();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.className = '';
  });

  it('renders nav links, active state, dark logo, and open user menu', () => {
    render(h(Sidebar));

    expect(screen.getByRole('img', { name: 'sidebar.cvBuilderLogo' })).toHaveAttribute(
      'src',
      '/logo-dark.svg'
    );
    expect(screen.getByText('CV Builder')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /nav.employees/ })).toHaveAttribute('href', '/users');
    expect(screen.getByRole('link', { name: /nav.skills/ })).toHaveAttribute('href', '/skills');
    expect(screen.getByRole('link', { name: /nav.languages/ })).toHaveAttribute(
      'href',
      '/languages'
    );
    expect(screen.getByRole('link', { name: /nav.cvs/ })).toHaveAttribute('href', '/cvs');
    expect(screen.getByRole('link', { name: /nav.employees/ }).className).toContain(
      'bg-primary-hover'
    );
    expect(screen.getByTestId('user-menu')).toHaveAttribute('data-open', 'true');
    expect(screen.getByLabelText('sidebar.toggleClose')).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('link', { name: /nav.skills/ }));
    expect(screen.getByTestId('user-menu')).toHaveAttribute('data-open', 'true');
  });

  it('uses light logo in dark mode and toggles collapse', () => {
    document.documentElement.classList.add('dark');
    render(h(Sidebar));

    expect(screen.getByRole('img', { name: 'sidebar.cvBuilderLogo' })).toHaveAttribute(
      'src',
      '/logo-light.svg'
    );

    fireEvent.click(screen.getByLabelText('sidebar.toggleClose'));
    expect(screen.getByLabelText('sidebar.toggleOpen')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('user-menu')).toHaveAttribute('data-open', 'false');
  });

  it('opens overlay in compact mode and closes via backdrop or nav click', () => {
    useIsCompact.mockReturnValue(true);
    usePathname.mockReturnValue('/skills/extra');
    render(h(Sidebar));

    expect(screen.queryByRole('button', { name: 'sidebar.toggleClose' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('sidebar.toggleOpen')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toHaveAttribute('data-open', 'false');

    fireEvent.click(screen.getByLabelText('sidebar.toggleOpen'));
    expect(screen.getAllByLabelText('sidebar.toggleClose')).toHaveLength(2);
    expect(screen.getByTestId('user-menu')).toHaveAttribute('data-open', 'true');

    const overlay = document.querySelector('button.fixed.inset-0') as HTMLButtonElement;
    fireEvent.click(overlay);
    expect(screen.getByTestId('user-menu')).toHaveAttribute('data-open', 'false');

    fireEvent.click(screen.getByLabelText('sidebar.toggleOpen'));
    fireEvent.click(screen.getByRole('link', { name: /nav.cvs/ }));
    expect(screen.getByTestId('user-menu')).toHaveAttribute('data-open', 'false');
  });

  it('reacts to dark class and prefers-color-scheme subscriptions', async () => {
    const { unmount } = render(h(Sidebar));
    expect(screen.getByRole('img', { name: 'sidebar.cvBuilderLogo' })).toHaveAttribute(
      'src',
      '/logo-dark.svg'
    );

    await act(async () => {
      document.documentElement.classList.add('dark');
    });
    expect(screen.getByRole('img', { name: 'sidebar.cvBuilderLogo' })).toHaveAttribute(
      'src',
      '/logo-light.svg'
    );

    await act(async () => {
      document.documentElement.classList.remove('dark');
      mediaListeners.forEach((listener) => listener());
    });
    expect(screen.getByRole('img', { name: 'sidebar.cvBuilderLogo' })).toHaveAttribute(
      'src',
      '/logo-dark.svg'
    );

    unmount();
  });
});
