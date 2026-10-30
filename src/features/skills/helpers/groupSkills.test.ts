import { describe, expect, it, vi } from 'vitest';

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

import type { SkillMastery } from '@/shared/types/user';
import type { SkillCategory } from '../types/SkillTypes';
import { groupSkills } from './groupSkills';

const categories: SkillCategory[] = [
  {
    id: 'root',
    name: 'Frontend',
    order: 2,
    children: [{ id: 'child', name: 'UI', order: 1 }],
  },
  { id: 'backend', name: 'Backend', order: 0 },
];

describe('groupSkills', () => {
  it('groups skills by category and sorts by order', () => {
    const skills: SkillMastery[] = [
      { name: 'React', categoryId: 'child', mastery: 'Expert' },
      { name: 'Node', categoryId: 'backend', mastery: 'Competent' },
      { name: 'CSS', categoryId: 'child', mastery: 'Advanced' },
    ];

    const groups = groupSkills(skills, categories);

    expect(groups.map((group) => group.id)).toEqual(['backend', 'child']);
    expect(groups[0]).toMatchObject({
      title: 'Backend',
      skills: [{ name: 'Node' }],
    });
    expect(groups[1].skills.map((skill) => skill.name)).toEqual(['React', 'CSS']);
  });

  it('puts unknown or missing categories into Other', () => {
    const skills: SkillMastery[] = [
      { name: 'Rust', categoryId: 'missing', mastery: 'Novice' },
      { name: 'Go', categoryId: null, mastery: 'Advanced' },
    ];

    const groups = groupSkills(skills, categories);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      id: 'other',
      title: 'common.other',
    });
    expect(groups[0].skills.map((skill) => skill.name)).toEqual(['Rust', 'Go']);
  });
});
