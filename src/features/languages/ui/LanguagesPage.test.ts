import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useAuthStore, useLanguages, useLanguageActions } = vi.hoisted(() => ({
  useAuthStore: vi.fn(),
  useLanguages: vi.fn(),
  useLanguageActions: vi.fn(),
}));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: (selector: (s: { user?: { id?: string } }) => unknown) => selector(useAuthStore()),
}));
vi.mock('../models/useLanguages', () => ({ useLanguages }));
vi.mock('../models/useLanguagesActions', () => ({ useLanguageActions }));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { message?: string; count?: number }) => {
      if (opts?.message) return `${key}:${opts.message}`;
      if (opts?.count !== undefined) return `${key}:${opts.count}`;
      return key;
    },
  }),
}));
vi.mock('@/components/ui/app-loader', () => ({
  AppLoader: () => h('div', { 'data-testid': 'loader' }),
}));
vi.mock('@/components/ui/levels-panel', () => ({
  LevelsPanel: ({
    readOnly,
    labels,
  }: {
    readOnly: boolean;
    labels: { removeMessage: (count: number) => string };
  }) =>
    h('div', {
      'data-testid': 'levels',
      'data-readonly': String(readOnly),
      'data-msg-one': labels.removeMessage(1),
      'data-msg-other': labels.removeMessage(3),
    }),
}));

import { LanguagesPage } from './LanguagesPage';

describe('LanguagesPage', () => {
  beforeEach(() => {
    useAuthStore.mockReturnValue({ user: { id: 'me-1' } });
    useLanguageActions.mockReturnValue({
      options: [],
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    });
  });

  it('shows error', () => {
    useLanguages.mockReturnValue({
      targetId: 'me-1',
      languages: [],
      groups: [],
      loading: false,
      error: new Error('boom'),
    });
    render(h(LanguagesPage));
    expect(screen.getByText('errors.loadLanguages:boom')).toBeInTheDocument();
  });

  it('shows loader', () => {
    useLanguages.mockReturnValue({
      targetId: 'me-1',
      languages: [],
      groups: [],
      loading: true,
      error: undefined,
    });
    render(h(LanguagesPage, { userId: 'me' }));
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('is editable for self and read-only for others', () => {
    useLanguages.mockReturnValue({
      targetId: 'me-1',
      languages: [],
      groups: [],
      loading: false,
      error: undefined,
    });

    const { rerender } = render(h(LanguagesPage, { userId: 'me' }));
    const levels = screen.getByTestId('levels');
    expect(levels).toHaveAttribute('data-readonly', 'false');
    expect(levels).toHaveAttribute('data-msg-one', 'languages.removeMessage_one:1');
    expect(levels).toHaveAttribute('data-msg-other', 'languages.removeMessage_other:3');

    rerender(h(LanguagesPage, { userId: 'other' }));
    expect(screen.getByTestId('levels')).toHaveAttribute('data-readonly', 'true');
    expect(useLanguageActions).toHaveBeenLastCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });
});
