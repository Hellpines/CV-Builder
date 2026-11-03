import { describe, expect, it, vi } from 'vitest';

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

import type { Mastery, SkillMastery } from '@/shared/types/user';
import type { SkillCategory } from '../types/SkillTypes';
import { toLevelGroups } from './toLevelGroups';

const categories: SkillCategory[] = [{ id: 'fe', name: 'Frontend', order: 1 }];

describe('toLevelGroups', () => {
  it('maps grouped skills to level panel items', () => {
    const skills: SkillMastery[] = [
      { name: 'React', categoryId: 'fe', mastery: 'Expert' },
      { name: 'CSS', categoryId: 'fe', mastery: 'Advanced' },
    ];

    expect(toLevelGroups(skills, categories)).toEqual([
      {
        id: 'fe',
        title: 'Frontend',
        items: [
          {
            key: 'React',
            label: 'React',
            level: 'Expert',
            progress: 1,
            tone: 'red',
          },
          {
            key: 'CSS',
            label: 'CSS',
            level: 'Advanced',
            progress: 0.4,
            tone: 'blue',
          },
        ],
      },
    ]);
  });

  it('falls back to Novice styling for unknown mastery', () => {
    const skills: SkillMastery[] = [
      { name: 'Weird', categoryId: 'fe', mastery: 'Nope' as Mastery },
    ];

    expect(toLevelGroups(skills, categories)[0].items[0]).toMatchObject({
      level: 'Nope',
      progress: 0.2,
      tone: 'gray',
    });
  });
});
