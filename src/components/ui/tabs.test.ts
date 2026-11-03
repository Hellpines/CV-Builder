import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(() => '/users'),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    h('a', { href, ...props }, children),
}));

import { Tabs } from './tabs';

describe('Tabs', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/users');
  });

  it('marks link tab active by pathname', () => {
    render(
      h(Tabs, {
        items: [
          { label: 'Users', href: '/users' },
          { label: 'Skills', href: '/skills' },
        ],
      })
    );

    expect(screen.getByRole('link', { name: 'Users' }).className).toContain('border-primary');
    expect(screen.getByRole('link', { name: 'Skills' }).className).not.toContain('border-primary');
  });

  it('supports value tabs and onChange', () => {
    const onChange = vi.fn();
    render(
      h(Tabs, {
        items: [
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
        ],
        activeValue: 'two',
        onChange,
        inactiveClassName: 'inactive',
      })
    );

    expect(screen.getByRole('button', { name: 'Two' }).className).toContain('border-primary');
    expect(screen.getByRole('button', { name: 'One' }).className).toContain('inactive');

    fireEvent.click(screen.getByRole('button', { name: 'One' }));
    expect(onChange).toHaveBeenCalledWith('one');
  });

  it('does not call onChange when value is missing', () => {
    const onChange = vi.fn();
    render(h(Tabs, { items: [{ label: 'Plain' }], onChange }));

    fireEvent.click(screen.getByRole('button', { name: 'Plain' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
