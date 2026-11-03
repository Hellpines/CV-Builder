import { useMemo } from 'react';
import { skipToken, useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { PickerOption } from '@/components/ui/level-modal';
import { toast } from '@/shared/lib/toast';
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
  const { t } = useTranslation();
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
    try {
      await addLanguage({
        variables: { language: { userId, name, proficiency: proficiency as Proficiency } },
      });
      toast.success(t('notifications.languageAdded', { name }));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('notifications.languageAddFailed', { name })
      );
      throw err;
    }
  };

  const update = async (name: string, proficiency: string) => {
    if (!userId) throw new Error('User not found');
    try {
      await updateLanguage({
        variables: { language: { userId, name, proficiency: proficiency as Proficiency } },
      });
      toast.success(t('notifications.languageUpdated', { name }));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('notifications.languageUpdateFailed', { name })
      );
      throw err;
    }
  };

  const remove = async (names: string[]) => {
    if (!userId) throw new Error('User not found');
    try {
      await deleteLanguage({ variables: { language: { userId, name: names } } });
      toast.success(t('notifications.languageRemoved', { names: names.join(', ') }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.languageRemoveFailed'));
      throw err;
    }
  };

  return { options, add, update, remove };
}
