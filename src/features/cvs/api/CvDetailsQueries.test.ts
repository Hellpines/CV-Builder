import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { GET_CV_DETAILS } from './CvDetailsQueries';

describe('GET_CV_DETAILS', () => {
  it('loads cv by id with owner email', () => {
    const source = print(GET_CV_DETAILS);

    expect(source).toContain('query GetCvDetails');
    expect(source).toContain('cv(cvId: $cvId)');
    expect(source).toContain('education');
    expect(source).toContain('description');
    expect(source).toContain('email');
  });
});
