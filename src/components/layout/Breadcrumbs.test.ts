import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { usePathname, useProfileUser, useCv } = vi.hoisted(() => ({
  usePathname: vi.fn(() => '/users'),
  useProfileUser: vi.fn(),
  useCv: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    h('a', { href, ...props }, children),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/features/profile/models/useProfileUser', () => ({
  useProfileUser: () => useProfileUser(),
}));

vi.mock('@/features/cvs/models/useCv', () => ({
  useCv: () => useCv(),
}));

import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/users');
    useProfileUser.mockReturnValue({ userData: null });
    useCv.mockReturnValue({ cv: null });
  });

  it('returns null for unknown section', () => {
    usePathname.mockReturnValue('/login');
    const { container } = render(h(Breadcrumbs));
    expect(container).toBeEmptyDOMElement();
  });

  it('renders section label as text on list pages', () => {
    usePathname.mockReturnValue('/skills');
    render(h(Breadcrumbs));

    expect(screen.getByLabelText('nav.dashboard')).toBeInTheDocument();
    expect(screen.getByText('nav.skills')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('links section and shows profile fallback for user page', () => {
    usePathname.mockReturnValue('/users/u1');
    useProfileUser.mockReturnValue({ userData: { profile: null } });

    render(h(Breadcrumbs));

    expect(screen.getByRole('link', { name: 'nav.employees' })).toHaveAttribute('href', '/users');
    expect(screen.getByRole('link', { name: '…' })).toHaveAttribute('href', '/users');
    expect(screen.getByText('nav.profile')).toBeInTheDocument();
  });

  it('prefers full_name then first+last for user crumbs', () => {
    usePathname.mockReturnValue('/users/u1/skills');
    useProfileUser.mockReturnValue({
      userData: { profile: { full_name: 'Ann Bee', first_name: 'Ann', last_name: 'Bee' } },
    });

    const { rerender } = render(h(Breadcrumbs));
    expect(screen.getByRole('link', { name: /Ann Bee/ })).toBeInTheDocument();
    expect(screen.getByText('nav.skills')).toBeInTheDocument();

    useProfileUser.mockReturnValue({
      userData: { profile: { first_name: 'Ann', last_name: 'Bee' } },
    });
    rerender(h(Breadcrumbs));
    expect(screen.getByRole('link', { name: /Ann Bee/ })).toBeInTheDocument();
  });

  it('renders cv crumbs with name and tab', () => {
    usePathname.mockReturnValue('/cvs/cv-1/projects');
    useCv.mockReturnValue({ cv: { name: 'My CV' } });

    render(h(Breadcrumbs));

    expect(screen.getByRole('link', { name: 'nav.cvs' })).toHaveAttribute('href', '/cvs');
    expect(screen.getByRole('link', { name: 'My CV' })).toHaveAttribute('href', '/cvs/cv-1');
    expect(screen.getByText('nav.projects')).toBeInTheDocument();
  });

  it('falls back to details and ellipsis when cv has no name or tab', () => {
    usePathname.mockReturnValue('/cvs/cv-2');
    useCv.mockReturnValue({ cv: null });

    render(h(Breadcrumbs));

    expect(screen.getByRole('link', { name: '…' })).toHaveAttribute('href', '/cvs/cv-2');
    expect(screen.getByText('nav.details')).toBeInTheDocument();
  });
});
