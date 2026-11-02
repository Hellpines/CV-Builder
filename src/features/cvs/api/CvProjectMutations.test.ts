import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  ADD_CV_PROJECT_MUTATION,
  REMOVE_CV_PROJECT_MUTATION,
  UPDATE_CV_PROJECT_MUTATION,
} from './CvProjectMutations';

describe('CvProjectMutations', () => {
  it('adds, updates and removes projects returning CvProjectFields', () => {
    const add = print(ADD_CV_PROJECT_MUTATION);
    const update = print(UPDATE_CV_PROJECT_MUTATION);
    const remove = print(REMOVE_CV_PROJECT_MUTATION);

    expect(add).toContain('mutation AddCvProject');
    expect(add).toContain('addCvProject(project: $project)');
    expect(add).toContain('...CvProjectFields');

    expect(update).toContain('mutation UpdateCvProject');
    expect(update).toContain('updateCvProject(project: $project)');
    expect(update).toContain('...CvProjectFields');

    expect(remove).toContain('mutation RemoveCvProject');
    expect(remove).toContain('removeCvProject(project: $project)');
    expect(remove).toContain('...CvProjectFields');
  });
});
