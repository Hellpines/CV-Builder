import { describe, expect, it } from 'vitest';
import type { SkillMastery } from '@/shared/types/user';
import type { CatalogSkill } from '../types/SkillTypes';
import { buildSkillOptions } from './buildSkillOptions';

const catalog: CatalogSkill[] = [
  { id: '2', name: 'TypeScript', category: { id: 'c1', name: 'Lang' } },
  { id: '1', name: 'React', category: { id: 'c1', name: 'Lang' } },
  { id: '3', name: 'GraphQL', category: { id: 'c2', name: 'API' } },
];

describe('buildSkillOptions', () => {
  it('maps catalog to picker options sorted by label', () => {
    expect(buildSkillOptions(catalog, [])).toEqual([
      { value: '3', label: 'GraphQL', exists: false },
      { value: '1', label: 'React', exists: false },
      { value: '2', label: 'TypeScript', exists: false },
    ]);
  });

  it('marks already owned skills', () => {
    const owned: SkillMastery[] = [{ name: 'React', categoryId: 'c1', mastery: 'Competent' }];

    expect(buildSkillOptions(catalog, owned)).toEqual([
      { value: '3', label: 'GraphQL', exists: false },
      { value: '1', label: 'React', exists: true },
      { value: '2', label: 'TypeScript', exists: false },
    ]);
  });
});
