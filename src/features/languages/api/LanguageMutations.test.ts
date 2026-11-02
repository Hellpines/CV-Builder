import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  ADD_PROFILE_LANGUAGE_MUTATION,
  DELETE_PROFILE_LANGUAGE_MUTATION,
  UPDATE_PROFILE_LANGUAGE_MUTATION,
} from './LanguageMutations';

describe('LanguageMutations', () => {
  it('adds, updates and deletes profile languages', () => {
    const add = print(ADD_PROFILE_LANGUAGE_MUTATION);
    const update = print(UPDATE_PROFILE_LANGUAGE_MUTATION);
    const remove = print(DELETE_PROFILE_LANGUAGE_MUTATION);

    expect(add).toContain('mutation AddProfileLanguage');
    expect(add).toContain('addProfileLanguage(language: $language)');
    expect(add).toContain('proficiency');

    expect(update).toContain('mutation UpdateProfileLanguage');
    expect(update).toContain('updateProfileLanguage(language: $language)');
    expect(update).toContain('languages');

    expect(remove).toContain('mutation DeleteProfileLanguage');
    expect(remove).toContain('deleteProfileLanguage(language: $language)');
  });
});
