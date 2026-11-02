import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { CREATE_CV_MUTATION, DELETE_CV_MUTATION, UPDATE_CV_MUTATION } from './CvMutations';

describe('CvMutations', () => {
  it('defines createCv with list fields', () => {
    const source = print(CREATE_CV_MUTATION);

    expect(source).toContain('mutation CreateCv');
    expect(source).toContain('createCv(cv: $cv)');
    expect(source).toContain('education');
    expect(source).toContain('description');
    expect(source).toContain('user');
  });

  it('defines updateCv with the same shape', () => {
    const source = print(UPDATE_CV_MUTATION);

    expect(source).toContain('mutation UpdateCv');
    expect(source).toContain('updateCv(cv: $cv)');
    expect(source).toContain('name');
    expect(source).toContain('email');
  });

  it('defines deleteCv returning affected count', () => {
    const source = print(DELETE_CV_MUTATION);

    expect(source).toContain('mutation DeleteCv');
    expect(source).toContain('deleteCv(cv: $cv)');
    expect(source).toContain('affected');
  });
});
