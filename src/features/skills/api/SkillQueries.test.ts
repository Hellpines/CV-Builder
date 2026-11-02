import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { GET_PROFILE_SKILLS, GET_SKILL_CATEGORIES, GET_SKILLS_CATALOG } from './SkillQueries';

describe('SkillQueries', () => {
  it('loads profile skills by user id', () => {
    const source = print(GET_PROFILE_SKILLS);

    expect(source).toContain('query GetProfileSkills');
    expect(source).toContain('profile(userId: $userId)');
    expect(source).toContain('mastery');
    expect(source).toContain('categoryId');
  });

  it('loads skill categories with children', () => {
    const source = print(GET_SKILL_CATEGORIES);

    expect(source).toContain('query GetSkillCategories');
    expect(source).toContain('skillCategories');
    expect(source).toContain('children');
    expect(source).toContain('order');
  });

  it('loads skills catalog with category', () => {
    const source = print(GET_SKILLS_CATALOG);

    expect(source).toContain('query GetSkillsCatalog');
    expect(source).toContain('skills(params: $params)');
    expect(source).toContain('category');
  });
});
