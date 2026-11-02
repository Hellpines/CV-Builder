import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { GET_LANGUAGES_CATALOG, GET_PROFILE_LANGUAGES } from './LanguageQueries';

describe('LanguageQueries', () => {
  it('loads profile languages by user id', () => {
    const source = print(GET_PROFILE_LANGUAGES);

    expect(source).toContain('query GetProfileLanguages');
    expect(source).toContain('profile(userId: $userId)');
    expect(source).toContain('proficiency');
  });

  it('loads languages catalog with iso and native name', () => {
    const source = print(GET_LANGUAGES_CATALOG);

    expect(source).toContain('query GetLanguagesCatalog');
    expect(source).toContain('languages(params: $params)');
    expect(source).toContain('iso2');
    expect(source).toContain('native_name');
  });
});
