import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { GET_USER_CVS } from './CvQueries';

describe('GET_USER_CVS', () => {
  it('queries paginated cvs by user id', () => {
    const source = print(GET_USER_CVS);

    expect(source).toContain('query GetUserCvs');
    expect(source).toContain('cvsByUserId(userId: $userId, params: $params)');
    expect(source).toContain('items');
    expect(source).toContain('total_pages');
    expect(source).toContain('education');
  });
});
