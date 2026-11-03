import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useCvSkills, useCvSkillActions } = vi.hoisted(() => ({
  useCvSkills: vi.fn(),
  useCvSkillActions: vi.fn(),
}));

vi.mock('../models/useCvSkills', () => ({ useCvSkills }));
vi.mock('../models/useCvSkillActions', () => ({ useCvSkillActions }));
vi.mock('@/components/ui/app-loader', () => ({
  AppLoader: () => h('div', { 'data-testid': 'loader' }),
}));
vi.mock('@/components/ui/levels-panel', () => ({
  LevelsPanel: ({ readOnly }: { readOnly: boolean }) =>
    h('div', { 'data-testid': 'levels', 'data-readonly': String(readOnly) }),
}));

import { CvSkillsPage } from './CvSkillsPage';

describe('CvSkillsPage', () => {
  beforeEach(() => {
    useCvSkillActions.mockReturnValue({
      options: [],
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    });
  });

  it('shows error with retry', () => {
    const refetch = vi.fn();
    useCvSkills.mockReturnValue({
      skills: [],
      groups: [],
      loading: false,
      error: new Error('x'),
      refetch,
    });
    render(h(CvSkillsPage, { cvId: 'cv1' }));
    expect(screen.getByText('Failed to load CV skills')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows loader while loading', () => {
    useCvSkills.mockReturnValue({
      skills: [],
      groups: [],
      loading: true,
      error: undefined,
      refetch: vi.fn(),
    });
    render(h(CvSkillsPage, { cvId: 'cv1' }));
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders editable levels panel', () => {
    useCvSkills.mockReturnValue({
      skills: [],
      groups: [],
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });
    render(h(CvSkillsPage, { cvId: 'cv1' }));
    expect(screen.getByTestId('levels')).toHaveAttribute('data-readonly', 'false');
    expect(useCvSkillActions).toHaveBeenCalledWith(expect.objectContaining({ cvId: 'cv1' }));
  });
});
