import { describe, expect, it, vi } from 'vitest';

vi.mock('i18next', () => ({
  default: {
    t: (key: string) => key,
  },
}));

import type { SkillMastery } from '@/shared/types/user';
import type { PreviewCategory } from '../types/CvPreviewTypes';
import { groupPreviewSkills } from './groupPreviewSkills';

const categories: PreviewCategory[] = [
  {
    id: 'root-a',
    name: 'Frontend',
    order: 2,
    children: [{ id: 'leaf-a', name: 'UI', order: 1 }],
  },
  {
    id: 'leaf-b',
    name: 'API',
    order: 1,
    parent: { id: 'root-b', name: 'Backend', order: 1 },
  },
];

describe('groupPreviewSkills', () => {
  it('groups by root and by leaf category', () => {
    const skills: SkillMastery[] = [
      { name: 'React', categoryId: 'leaf-a', mastery: 'Expert' },
      { name: 'GraphQL', categoryId: 'leaf-b', mastery: 'Competent' },
    ];

    const { byRoot, byCategory } = groupPreviewSkills(skills, categories);

    expect(byRoot.map((bucket) => bucket.id)).toEqual(['root-b', 'root-a']);
    expect(byRoot[0].skills.map((skill) => skill.name)).toEqual(['GraphQL']);
    expect(byRoot[1].skills.map((skill) => skill.name)).toEqual(['React']);

    expect(byCategory.map((bucket) => bucket.id)).toEqual(['leaf-b', 'leaf-a']);
  });

  it('puts unknown categories into Other', () => {
    const skills: SkillMastery[] = [
      { name: 'Rust', categoryId: null, mastery: 'Novice' },
      { name: 'Zig', categoryId: 'missing', mastery: 'Advanced' },
    ];

    const { byRoot, byCategory } = groupPreviewSkills(skills, categories);

    expect(byRoot).toHaveLength(1);
    expect(byRoot[0]).toMatchObject({ id: 'other', name: 'common.other' });
    expect(byCategory[0].skills.map((skill) => skill.name)).toEqual(['Rust', 'Zig']);
  });

  it('resolves nested children under the same root', () => {
    const nested: PreviewCategory[] = [
      {
        id: 'root',
        name: 'All',
        order: 1,
        children: [
          {
            id: 'mid',
            name: 'Mid',
            order: 2,
            children: [{ id: 'deep', name: 'Deep', order: 3 }],
          },
        ],
      },
    ];
    const skills: SkillMastery[] = [{ name: 'X', categoryId: 'deep', mastery: 'Novice' }];

    const { byRoot, byCategory } = groupPreviewSkills(skills, nested);

    expect(byRoot[0].id).toBe('root');
    expect(byCategory[0].id).toBe('deep');
  });
});
