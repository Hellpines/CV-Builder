import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

import { PROFICIENCY_BY_VALUE, PROFICIENCY_LEVELS, PROFICIENCY_OPTIONS } from './languagesLevels';

describe('PROFICIENCY_LEVELS', () => {
  it('covers all CEFR values plus Native', () => {
    expect(PROFICIENCY_LEVELS.map((level) => level.value)).toEqual([
      'A1',
      'A2',
      'B1',
      'B2',
      'C1',
      'C2',
      'Native',
    ]);
  });

  it('builds labeled entries with progress and tone', () => {
    expect(PROFICIENCY_LEVELS[0]).toMatchObject({
      value: 'A1',
      label: 'A1 – levels.beginner',
      progress: 0,
      tone: 'gray',
    });
    expect(PROFICIENCY_LEVELS[6]).toMatchObject({
      value: 'Native',
      label: 'levels.native',
      progress: 1,
      tone: 'red',
    });
  });
});

describe('PROFICIENCY_OPTIONS', () => {
  it('maps levels to picker options without progress', () => {
    expect(PROFICIENCY_OPTIONS).toHaveLength(PROFICIENCY_LEVELS.length);
    expect(PROFICIENCY_OPTIONS[3]).toEqual({
      value: 'B2',
      label: PROFICIENCY_LEVELS[3].label,
      tone: 'green',
    });
    expect(PROFICIENCY_OPTIONS[3]).not.toHaveProperty('progress');
  });
});

describe('PROFICIENCY_BY_VALUE', () => {
  it('indexes every level by proficiency value', () => {
    for (const level of PROFICIENCY_LEVELS) {
      expect(PROFICIENCY_BY_VALUE[level.value]).toBe(level);
    }
  });
});
