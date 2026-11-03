import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { GET_USERS } from './UserQueries';

describe('GET_USERS', () => {
  it('queries paginated users with profile and org fields', () => {
    const source = print(GET_USERS);

    expect(source).toContain('query GetUsers');
    expect(source).toContain('users(params: $params)');
    expect(source).toContain('first_name');
    expect(source).toContain('avatar');
    expect(source).toContain('department');
    expect(source).toContain('position');
    expect(source).toContain('total_pages');
  });
});
