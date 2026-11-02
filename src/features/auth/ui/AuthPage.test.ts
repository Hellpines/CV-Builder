import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

import { AuthPage } from './AuthPage';

describe('AuthPage', () => {
  it('renders sign tabs, content, and footer by default', () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });

    render(
      h(
        AuthPage,
        {
          title: 'Welcome',
          subtitle: 'Sign in to continue',
          onSubmit,
          submitButton: h('button', { type: 'submit' }, 'Send'),
          footer: h('span', null, 'Footer link'),
        },
        h('input', { placeholder: 'email' })
      )
    );

    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AUTH.SIGNIN' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'AUTH.SIGNUP' })).toHaveAttribute('href', '/register');
    expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    expect(screen.getByText('Footer link')).toBeInTheDocument();

    fireEvent.submit(screen.getByRole('button', { name: 'Send' }).closest('form')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('hides tabs for the forgot type', () => {
    render(
      h(
        AuthPage,
        {
          title: 'Reset',
          subtitle: 'Enter a new password',
          type: 'forgot',
          onSubmit: vi.fn(),
          submitButton: h('button', { type: 'submit' }, 'Save'),
        },
        h('span', null, 'Fields')
      )
    );

    expect(screen.getByRole('heading', { name: 'Reset' })).toBeInTheDocument();
    expect(screen.getByText('Fields')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'AUTH.SIGNIN' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'AUTH.SIGNUP' })).not.toBeInTheDocument();
  });
});
