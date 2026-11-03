import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  ADD_CV_SKILL_MUTATION,
  DELETE_CV_SKILL_MUTATION,
  UPDATE_CV_SKILL_MUTATION,
} from './CvSkillMutations';

describe('CvSkillMutations', () => {
  it('adds, updates and deletes cv skills', () => {
    const add = print(ADD_CV_SKILL_MUTATION);
    const update = print(UPDATE_CV_SKILL_MUTATION);
    const remove = print(DELETE_CV_SKILL_MUTATION);

    expect(add).toContain('mutation AddCvSkill');
    expect(add).toContain('addCvSkill(skill: $skill)');
    expect(add).toContain('mastery');

    expect(update).toContain('mutation UpdateCvSkill');
    expect(update).toContain('updateCvSkill(skill: $skill)');
    expect(update).toContain('categoryId');

    expect(remove).toContain('mutation DeleteCvSkill');
    expect(remove).toContain('deleteCvSkill(skill: $skill)');
  });
});
