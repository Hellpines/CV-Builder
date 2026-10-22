import { useMemo } from 'react';
import { skipToken, useQuery } from '@apollo/client/react';
import type { LevelGroup } from '@/components/ui/levels-panel';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { GET_PROFILE_LANGUAGES } from '../api/LanguageQueries';
import { PROFICIENCY_BY_VALUE, PROFICIENCY_LEVELS } from './languagesLevels';

export function useLanguages(userId?: string) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const targetId = !userId || userId === 'me' ? currentUserId : userId;

  const { data, loading, error } = useQuery(
    GET_PROFILE_LANGUAGES,
    targetId ? { variables: { userId: targetId } } : skipToken
  );

  const languages = useMemo(() => data?.profile.languages ?? [], [data]);

  const groups = useMemo<LevelGroup[]>(() => {
    if (!languages.length) return [];

    return [
      {
        id: 'current',
        title: 'Current languages',
        items: languages.map((language) => {
          const level = PROFICIENCY_BY_VALUE[language.proficiency] ?? PROFICIENCY_LEVELS[0];
          return {
            key: language.name,
            label: language.name,
            level: language.proficiency,
            progress: level.progress,
            tone: level.tone,
          };
        }),
      },
    ];
  }, [languages]);

  return { targetId, languages, groups, loading, error };
}
