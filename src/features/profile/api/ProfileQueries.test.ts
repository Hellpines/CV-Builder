import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { GET_DEPARTMENTS, GET_POSITIONS, GET_USER_PROFILE } from './ProfileQueries';

describe('GET_USER_PROFILE', () => {
  it('loads user with department, position and profile', () => {
    const source = print(GET_USER_PROFILE);

    expect(source).toContain('query GetUserProfile');
    expect(source).toContain('user(userId: $userId)');
    expect(source).toContain('is_verified');
    expect(source).toContain('department');
    expect(source).toContain('position');
    expect(source).toContain('full_name');
  });
});

describe('GET_DEPARTMENTS / GET_POSITIONS', () => {
  it('loads searchable catalog items', () => {
    const departments = print(GET_DEPARTMENTS);
    const positions = print(GET_POSITIONS);

    expect(departments).toContain('query GetDepartments');
    expect(departments).toContain('departments(params: $params)');
    expect(departments).toContain('items');

    expect(positions).toContain('query GetPositions');
    expect(positions).toContain('positions(params: $params)');
    expect(positions).toContain('name');
  });
});
