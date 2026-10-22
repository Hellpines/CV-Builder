import { useMemo } from 'react';
import { skipToken, useMutation, useQuery } from '@apollo/client/react';
import type { PickerOption } from '@/components/ui/level-modal';
import type { LanguageProficiency, Proficiency } from '@/shared/types/user';
import { GET_LANGUAGES_CATALOG } from '../api/LanguageQueries';
import {
  ADD_PROFILE_LANGUAGE_MUTATION,
  DELETE_PROFILE_LANGUAGE_MUTATION,
  UPDATE_PROFILE_LANGUAGE_MUTATION,
} from '../api/LanguageMutations';

const CATALOG_LIMIT = 100;

interface UseLanguageActionsParams {
  userId?: string;
  languages: LanguageProficiency[];
  enabled: boolean;
}

export function useLanguageActions({ userId, languages, enabled }: UseLanguageActionsParams) {
  const { data } = useQuery(
    GET_LANGUAGES_CATALOG,
    enabled ? { variables: { params: { limit: CATALOG_LIMIT } } } : skipToken
  );

  const [addLanguage] = useMutation(ADD_PROFILE_LANGUAGE_MUTATION);
  const [updateLanguage] = useMutation(UPDATE_PROFILE_LANGUAGE_MUTATION);
  const [deleteLanguage] = useMutation(DELETE_PROFILE_LANGUAGE_MUTATION);

  const catalog = useMemo(() => data?.languages.items ?? [], [data]);

  const options = useMemo<PickerOption[]>(() => {
    const owned = new Set(languages.map((language) => language.name));
    return catalog
      .map((language) => ({
        value: language.name,
        label:
          language.native_name && language.native_name !== language.name
            ? `${language.name} (${language.native_name})`
            : language.name,
        exists: owned.has(language.name),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [catalog, languages]);

  const add = async (name: string, proficiency: string) => {
    if (!userId) throw new Error('User not found');
    await addLanguage({
      variables: { language: { userId, name, proficiency: proficiency as Proficiency } },
    });
  };

  const update = async (name: string, proficiency: string) => {
    if (!userId) throw new Error('User not found');
    await updateLanguage({
      variables: { language: { userId, name, proficiency: proficiency as Proficiency } },
    });
  };

  const remove = async (names: string[]) => {
    if (!userId) throw new Error('User not found');
    await deleteLanguage({ variables: { language: { userId, name: names } } });
  };

  return { options, add, update, remove };
}
