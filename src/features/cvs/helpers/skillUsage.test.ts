import { describe, expect, it } from 'vitest';
import type { CvProjectItem } from '../types/CvProjectTypes';
import { calculateSkillUsage } from './skillUsage';

function project(
  overrides: Partial<CvProjectItem> & Pick<CvProjectItem, 'id' | 'name'>
): CvProjectItem {
  return {
    domain: 'web',
    description: '',
    start_date: '2020-01-01',
    end_date: '2022-06-01',
    environment: [],
    roles: [],
    responsibilities: [],
    project: {
      id: overrides.id,
      name: overrides.name,
      domain: 'web',
      description: '',
      environment: [],
      start_date: '2020-01-01',
      end_date: '2022-06-01',
    },
    ...overrides,
  };
}

describe('calculateSkillUsage', () => {
  const now = new Date(2024, 5, 15);

  it('returns nulls when skill was never used', () => {
    expect(
      calculateSkillUsage('React', [project({ id: '1', name: 'A', environment: ['Vue'] })], now)
    ).toEqual({
      years: null,
      lastUsed: null,
    });
  });

  it('matches environment case-insensitively and computes years', () => {
    const projects = [
      project({
        id: '1',
        name: 'A',
        environment: ['  React  '],
        start_date: '2020-06-15',
        end_date: '2021-01-01',
      }),
      project({
        id: '2',
        name: 'B',
        environment: ['react'],
        start_date: '2019-01-01',
        end_date: '2020-01-01',
      }),
    ];

    expect(calculateSkillUsage('REACT', projects, now)).toEqual({
      years: 5,
      lastUsed: 2021,
    });
  });

  it('uses current year when any matching project is ongoing', () => {
    const projects = [
      project({
        id: '1',
        name: 'A',
        environment: ['Node'],
        start_date: '2021-01-01',
        end_date: null,
      }),
    ];

    expect(calculateSkillUsage('Node', projects, now)).toEqual({
      years: 3,
      lastUsed: 2024,
    });
  });

  it('caps lastUsed at the current year', () => {
    const projects = [
      project({
        id: '1',
        name: 'A',
        environment: ['Go'],
        start_date: '2020-01-01',
        end_date: '2030-01-01',
      }),
    ];

    expect(calculateSkillUsage('Go', projects, now).lastUsed).toBe(2024);
  });

  it('returns null years when matching projects have no start date', () => {
    const projects = [
      project({
        id: '1',
        name: 'A',
        environment: ['SQL'],
        start_date: '',
        end_date: '2022-01-01',
      }),
    ];

    expect(calculateSkillUsage('SQL', projects, now)).toEqual({
      years: null,
      lastUsed: 2022,
    });
  });

  it('treats missing environment as empty', () => {
    const projects = [
      project({
        id: '1',
        name: 'A',
        environment: undefined as unknown as string[],
      }),
    ];

    expect(calculateSkillUsage('React', projects, now)).toEqual({
      years: null,
      lastUsed: null,
    });
  });

  it('ignores unparsable end dates when computing lastUsed', () => {
    const projects = [
      project({
        id: '1',
        name: 'A',
        environment: ['Kotlin'],
        start_date: '2020-01-01',
        end_date: 'not-a-date',
      }),
      project({
        id: '2',
        name: 'B',
        environment: ['Kotlin'],
        start_date: '2021-01-01',
        end_date: '2022-05-01',
      }),
    ];

    expect(calculateSkillUsage('Kotlin', projects, now)).toEqual({
      years: 4,
      lastUsed: 2022,
    });
  });
});
