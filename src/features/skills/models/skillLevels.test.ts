import { describe, expect, it } from 'vitest';
import { MASTERY_BY_VALUE, MASTERY_LEVELS, MASTERY_OPTIONS } from './skillLevels';

describe('MASTERY_LEVELS', () => {
  it('covers all mastery values in order', () => {
    expect(MASTERY_LEVELS.map((level) => level.value)).toEqual([
      'Novice',
      'Advanced',
      'Competent',
      'Proficient',
      'Expert',
    ]);
  });

  it('builds labeled entries with progress and tone', () => {
    expect(MASTERY_LEVELS[0]).toEqual({
      value: 'Novice',
      label: 'Novice',
      progress: 0.2,
      tone: 'gray',
    });
    expect(MASTERY_LEVELS[4]).toEqual({
      value: 'Expert',
      label: 'Expert',
      progress: 1,
      tone: 'red',
    });
  });
});

describe('MASTERY_OPTIONS', () => {
  it('maps levels to picker options without progress', () => {
    expect(MASTERY_OPTIONS).toHaveLength(MASTERY_LEVELS.length);
    expect(MASTERY_OPTIONS[2]).toEqual({
      value: 'Competent',
      label: 'Competent',
      tone: 'green',
    });
    expect(MASTERY_OPTIONS[2]).not.toHaveProperty('progress');
  });
});

describe('MASTERY_BY_VALUE', () => {
  it('indexes every level by mastery value', () => {
    for (const level of MASTERY_LEVELS) {
      expect(MASTERY_BY_VALUE[level.value]).toBe(level);
    }
  });
});
