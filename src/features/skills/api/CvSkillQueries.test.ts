import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { GET_CV_SKILLS } from './CvSkillQueries';

describe('GET_CV_SKILLS', () => {
  it('loads cv skills by cv id', () => {
    const source = print(GET_CV_SKILLS);

    expect(source).toContain('query GetCvSkills');
    expect(source).toContain('cv(cvId: $cvId)');
    expect(source).toContain('skills');
    expect(source).toContain('mastery');
    expect(source).toContain('categoryId');
  });
});
