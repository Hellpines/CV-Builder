import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CvPreviewModel } from '../types/CvPreviewTypes';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { CvPreviewDocument } from './CvPreviewDocument';

const emptyModel: CvPreviewModel = {
  name: 'CV Name',
  fullName: 'Ann Bee',
  position: '',
  education: '',
  languages: [],
  domains: [],
  description: 'About me',
  skillGroups: [],
  projects: [],
  skillTables: [],
};

const fullModel: CvPreviewModel = {
  name: 'CV Name',
  fullName: 'Ann Bee',
  position: 'Developer',
  education: 'BS',
  languages: [{ name: 'English', proficiency: 'C1' } as never],
  domains: ['Fintech'],
  description: 'About me',
  skillGroups: [{ id: 'g1', title: 'Frontend', skills: ['React', 'TS'] }],
  projects: [
    {
      id: 'p1',
      name: 'Bank',
      description: 'App',
      roles: ['Dev'],
      period: '2020-2021',
      responsibilities: ['Build UI'],
      environment: ['React'],
    },
  ],
  skillTables: [
    {
      id: 't1',
      title: 'Languages',
      rows: [
        { name: 'TS', years: 3, lastUsed: 2024 },
        { name: 'Go', years: null, lastUsed: null },
      ],
    },
  ],
};

describe('CvPreviewDocument', () => {
  it('renders empty fallbacks', () => {
    render(h(CvPreviewDocument, { model: emptyModel }));
    expect(screen.getByText('Ann Bee')).toBeInTheDocument();
    expect(screen.queryByText('Developer')).not.toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.queryByText('preview.projects')).not.toBeInTheDocument();
  });

  it('renders filled preview sections', () => {
    render(h(CvPreviewDocument, { model: fullModel }));

    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('BS')).toBeInTheDocument();
    expect(screen.getByText(/English/)).toBeInTheDocument();
    expect(screen.getByText('Fintech')).toBeInTheDocument();
    expect(screen.getByText(/React, TS/)).toBeInTheDocument();
    expect(screen.getByText('preview.projects')).toBeInTheDocument();
    expect(screen.getByText('Bank')).toBeInTheDocument();
    expect(screen.getByText('Build UI')).toBeInTheDocument();
    expect(screen.getByText('preview.professionalSkills')).toBeInTheDocument();
    expect(screen.getByText('TS')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
