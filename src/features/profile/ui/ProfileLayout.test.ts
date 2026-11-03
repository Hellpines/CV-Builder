import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'u1' }),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ items }: { items: { href: string; label: string }[] }) =>
    h(
      'nav',
      null,
      items.map((item) => h('a', { key: item.href, href: item.href }, item.label))
    ),
}));

import { ProfileLayout } from './ProfileLayout';

describe('ProfileLayout', () => {
  it('renders profile tabs for user id and children', () => {
    render(h(ProfileLayout, null, h('p', null, 'child')));

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'nav.profile' })).toHaveAttribute('href', '/users/u1');
    expect(screen.getByRole('link', { name: 'nav.skills' })).toHaveAttribute(
      'href',
      '/users/u1/skills'
    );
    expect(screen.getByRole('link', { name: 'nav.languages' })).toHaveAttribute(
      'href',
      '/users/u1/languages'
    );
  });
});
