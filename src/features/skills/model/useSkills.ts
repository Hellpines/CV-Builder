import { useMemo } from 'react';
import { skipToken, useQuery } from '@apollo/client/react';
import type { LevelGroup } from '@/components/ui/levels-panel';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { GET_PROFILE_SKILLS, GET_SKILL_CATEGORIES } from '../api/SkillQueries';
import { groupSkills } from '../helpers/groupSkills';
import { MASTERY_BY_VALUE, MASTERY_LEVELS } from './skillLevels';

export function useSkills(userId?: string) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const targetId = !userId || userId === 'me' ? currentUserId : userId;

  const { data, loading, error } = useQuery(
    GET_PROFILE_SKILLS,
    targetId ? { variables: { userId: targetId } } : skipToken
  );
  const { data: categoryData, loading: categoriesLoading } = useQuery(GET_SKILL_CATEGORIES);

  const skills = useMemo(() => data?.profile.skills ?? [], [data]);

  const groups = useMemo<LevelGroup[]>(
    () =>
      groupSkills(skills, categoryData?.skillCategories ?? []).map((group) => ({
        id: group.id,
        title: group.title,
        items: group.skills.map((skill) => {
          const level = MASTERY_BY_VALUE[skill.mastery] ?? MASTERY_LEVELS[0];
          return {
            key: skill.name,
            label: skill.name,
            level: skill.mastery,
            progress: level.progress,
            tone: level.tone,
          };
        }),
      })),
    [skills, categoryData]
  );

  return { targetId, skills, groups, loading: loading || categoriesLoading, error };
}
