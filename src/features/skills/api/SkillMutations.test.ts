import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  ADD_PROFILE_SKILL_MUTATION,
  DELETE_PROFILE_SKILL_MUTATION,
  UPDATE_PROFILE_SKILL_MUTATION,
} from './SkillMutations';

describe('SkillMutations', () => {
  it('adds, updates and deletes profile skills', () => {
    const add = print(ADD_PROFILE_SKILL_MUTATION);
    const update = print(UPDATE_PROFILE_SKILL_MUTATION);
    const remove = print(DELETE_PROFILE_SKILL_MUTATION);

    expect(add).toContain('mutation AddProfileSkill');
    expect(add).toContain('addProfileSkill(skill: $skill)');
    expect(add).toContain('mastery');

    expect(update).toContain('mutation UpdateProfileSkill');
    expect(update).toContain('updateProfileSkill(skill: $skill)');
    expect(update).toContain('categoryId');

    expect(remove).toContain('mutation DeleteProfileSkill');
    expect(remove).toContain('deleteProfileSkill(skill: $skill)');
  });
});
