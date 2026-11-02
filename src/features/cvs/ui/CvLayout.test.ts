import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { notFound, useCv } = vi.hoisted(() => ({
  notFound: vi.fn(),
  useCv: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: () => notFound(),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../models/useCv', () => ({
  useCv: () => useCv(),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ items }: { items: { href: string; label: string }[] }) =>
    h(
      'nav',
      null,
      items.map((item) => h('a', { key: item.href, href: item.href }, item.label))
    ),
}));

import { CvLayout } from './CvLayout';

describe('CvLayout', () => {
  beforeEach(() => {
    notFound.mockReset();
    useCv.mockReset();
  });

  it('renders tabs and children for the owner', () => {
    useCv.mockReturnValue({ cvId: 'cv-1', cv: { id: 'cv-1' }, isOwner: true });
    render(h(CvLayout, null, h('p', null, 'details body')));

    expect(notFound).not.toHaveBeenCalled();
    expect(screen.getByText('details body')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'nav.details' })).toHaveAttribute('href', '/cvs/cv-1');
    expect(screen.getByRole('link', { name: 'nav.skills' })).toHaveAttribute(
      'href',
      '/cvs/cv-1/skills'
    );
    expect(screen.getByRole('link', { name: 'nav.projects' })).toHaveAttribute(
      'href',
      '/cvs/cv-1/projects'
    );
    expect(screen.getByRole('link', { name: 'nav.preview' })).toHaveAttribute(
      'href',
      '/cvs/cv-1/preview'
    );
  });

  it('renders tabs when the cv is still loading', () => {
    useCv.mockReturnValue({ cvId: 'cv-2', cv: undefined, isOwner: false });
    render(h(CvLayout, null, h('span', null, 'pending')));

    expect(notFound).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'nav.details' })).toHaveAttribute('href', '/cvs/cv-2');
  });

  it('calls notFound when the cv belongs to someone else', () => {
    useCv.mockReturnValue({ cvId: 'cv-3', cv: { id: 'cv-3' }, isOwner: false });
    render(h(CvLayout, null, h('span', null, 'hidden')));
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
