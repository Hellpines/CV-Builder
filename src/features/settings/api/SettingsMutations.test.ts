import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { CHANGE_PASSWORD_MUTATION } from './SettingsMutations';

describe('CHANGE_PASSWORD_MUTATION', () => {
  it('changes password and returns user id', () => {
    const source = print(CHANGE_PASSWORD_MUTATION);

    expect(source).toContain('mutation ChangePassword');
    expect(source).toContain('changePassword(args: $args)');
    expect(source).toContain('id');
  });
});
