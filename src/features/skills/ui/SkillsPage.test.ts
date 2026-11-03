import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useAuthStore, useSkills, useSkillActions } = vi.hoisted(() => ({
  useAuthStore: vi.fn(),
  useSkills: vi.fn(),
  useSkillActions: vi.fn(),
}));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: (selector: (s: { user?: { id?: string } }) => unknown) => selector(useAuthStore()),
}));
vi.mock('../models/useSkills', () => ({ useSkills }));
vi.mock('../models/useSkillActions', () => ({ useSkillActions }));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) =>
      opts?.count !== undefined ? `${key}:${opts.count}` : key,
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
      'data-msg': labels.removeMessage(1),
    }),
}));

import { SkillsPage } from './SkillsPage';

describe('SkillsPage', () => {
  beforeEach(() => {
    useAuthStore.mockReturnValue({ user: { id: 'me-1' } });
    useSkills.mockReturnValue({
      targetId: 'me-1',
      skills: [],
      groups: [],
      loading: false,
      error: undefined,
    });
    useSkillActions.mockReturnValue({
      options: [],
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    });
  });

  it('shows error', () => {
    useSkills.mockReturnValue({
      targetId: 'me-1',
      skills: [],
      groups: [],
      loading: false,
      error: new Error('boom'),
    });
    render(h(SkillsPage));
    expect(screen.getByText(/Error loading skills/)).toBeInTheDocument();
  });

  it('shows loader and editable panel for own profile', () => {
    useSkills.mockReturnValue({
      targetId: 'me-1',
      skills: [],
      groups: [],
      loading: true,
      error: undefined,
    });
    render(h(SkillsPage, { userId: 'me' }));
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByTestId('levels')).toHaveAttribute('data-readonly', 'false');
    expect(useSkillActions).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  it('is read-only for another user', () => {
    render(h(SkillsPage, { userId: 'other' }));
    expect(screen.getByTestId('levels')).toHaveAttribute('data-readonly', 'true');
    expect(useSkillActions).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });
});
