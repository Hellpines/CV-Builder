import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  DELETE_AVATAR_MUTATION,
  UPDATE_PROFILE_MUTATION,
  UPDATE_USER_MUTATION,
  UPLOAD_AVATAR_MUTATION,
} from './ProfileMutations';

describe('ProfileMutations', () => {
  it('updates profile name fields', () => {
    const source = print(UPDATE_PROFILE_MUTATION);

    expect(source).toContain('mutation UpdateProfile');
    expect(source).toContain('updateProfile(profile: $profile)');
    expect(source).toContain('first_name');
    expect(source).toContain('last_name');
    expect(source).toContain('full_name');
  });

  it('updates user department and position', () => {
    const source = print(UPDATE_USER_MUTATION);

    expect(source).toContain('mutation UpdateUser');
    expect(source).toContain('updateUser(user: $user)');
    expect(source).toContain('department');
    expect(source).toContain('position');
  });

  it('uploads and deletes avatar', () => {
    expect(print(UPLOAD_AVATAR_MUTATION)).toContain('mutation UploadAvatar');
    expect(print(UPLOAD_AVATAR_MUTATION)).toContain('uploadAvatar(avatar: $avatar)');

    expect(print(DELETE_AVATAR_MUTATION)).toContain('mutation DeleteAvatar');
    expect(print(DELETE_AVATAR_MUTATION)).toContain('deleteAvatar(avatar: $avatar)');
  });
});
