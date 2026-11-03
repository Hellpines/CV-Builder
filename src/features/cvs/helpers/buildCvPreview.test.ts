import { describe, expect, it, vi } from 'vitest';

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

import type { CvPreviewData, PreviewCategory } from '../types/CvPreviewTypes';
import type { CvProjectItem } from '../types/CvProjectTypes';
import { buildCvPreview } from './buildCvPreview';

function project(
  overrides: Partial<CvProjectItem> & Pick<CvProjectItem, 'id' | 'name'>
): CvProjectItem {
  return {
    domain: 'FinTech',
    description: 'Built things',
    start_date: '2020-01-15',
    end_date: '2021-06-01',
    environment: ['React'],
    roles: ['Dev'],
    responsibilities: ['Ship'],
    project: {
      id: overrides.id,
      name: overrides.name,
      domain: 'FinTech',
      description: 'Built things',
      environment: ['React'],
      start_date: '2020-01-15',
      end_date: '2021-06-01',
    },
    ...overrides,
  };
}

const categories: PreviewCategory[] = [{ id: 'fe', name: 'Frontend', order: 1 }];

function baseCv(overrides: Partial<CvPreviewData> = {}): CvPreviewData {
  return {
    id: 'cv-1',
    name: 'Main CV',
    education: 'BS CS',
    description: 'Summary',
    skills: [{ name: 'React', categoryId: 'fe', mastery: 'Expert' }],
    projects: [
      project({ id: 'p1', name: 'Alpha', end_date: null }),
      project({
        id: 'p2',
        name: 'Beta',
        domain: 'fintech',
        environment: ['Node'],
        start_date: '2019-03-01',
        end_date: '2019-12-01',
      }),
    ],
    user: {
      id: 'u1',
      email: 'user@example.com',
      position: { id: 'pos', name: 'Engineer' },
      profile: {
        id: 'pr1',
        first_name: 'Ada',
        last_name: 'Lovelace',
        full_name: 'Ada Lovelace',
        languages: [{ name: 'English', proficiency: 'C1' }],
      },
    },
    ...overrides,
  };
}

describe('buildCvPreview', () => {
  const now = new Date(2024, 0, 1);

  it('builds preview model with domains, periods and skill tables', () => {
    const preview = buildCvPreview(baseCv(), categories, now);

    expect(preview).toMatchObject({
      name: 'Main CV',
      fullName: 'Ada Lovelace',
      position: 'Engineer',
      education: 'BS CS',
      description: 'Summary',
      domains: ['FinTech'],
      languages: [{ name: 'English', proficiency: 'C1' }],
    });

    expect(preview.projects[0].period).toBe('01.2020 – cv.tillNow');
    expect(preview.projects[1].period).toBe('03.2019 – 12.2019');

    expect(preview.skillGroups[0]).toMatchObject({
      id: 'fe',
      title: 'Frontend',
      skills: ['React'],
    });

    expect(preview.skillTables[0].rows[0]).toEqual({
      name: 'React',
      years: 3,
      lastUsed: 2024,
    });
  });

  it('falls back fullName to first/last, then email', () => {
    const withParts = buildCvPreview(
      baseCv({
        user: {
          id: 'u1',
          email: 'user@example.com',
          position: null,
          profile: {
            id: 'pr1',
            first_name: 'Grace',
            last_name: 'Hopper',
            full_name: null,
            languages: [],
          },
        },
      }),
      categories,
      now
    );
    expect(withParts.fullName).toBe('Grace Hopper');
    expect(withParts.position).toBe('');

    const withEmail = buildCvPreview(
      baseCv({
        user: {
          id: 'u1',
          email: 'only@example.com',
          position: null,
          profile: {
            id: 'pr1',
            first_name: null,
            last_name: null,
            full_name: null,
            languages: [],
          },
        },
      }),
      categories,
      now
    );
    expect(withEmail.fullName).toBe('only@example.com');
  });

  it('handles missing user, projects and skills', () => {
    const preview = buildCvPreview(
      baseCv({
        user: null,
        projects: null,
        skills: [],
        education: null,
      }),
      categories,
      now
    );

    expect(preview.fullName).toBe('');
    expect(preview.education).toBe('');
    expect(preview.projects).toEqual([]);
    expect(preview.skillGroups).toEqual([]);
    expect(preview.skillTables).toEqual([]);
    expect(preview.domains).toEqual([]);
  });

  it('defaults blank project roles and responsibilities', () => {
    const preview = buildCvPreview(
      baseCv({
        projects: [
          project({
            id: 'p3',
            name: 'Gamma',
            domain: '  ',
            roles: undefined as unknown as string[],
            responsibilities: undefined as unknown as string[],
            environment: undefined as unknown as string[],
          }),
        ],
      }),
      categories,
      now
    );

    expect(preview.domains).toEqual([]);
    expect(preview.projects[0]).toMatchObject({
      roles: [],
      responsibilities: [],
      environment: [],
    });
  });
});
