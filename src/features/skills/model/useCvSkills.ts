import { useMemo } from 'react';
import { skipToken, useQuery } from '@apollo/client/react';
import { GET_CV_SKILLS } from '../api/CvSkillQueries';
import { GET_SKILL_CATEGORIES } from '../api/SkillQueries';
import { toLevelGroups } from '../helpers/toLevelGroups';

export function useCvSkills(cvId?: string) {
  const { data, loading, error, refetch } = useQuery(
    GET_CV_SKILLS,
    cvId ? { variables: { cvId } } : skipToken
  );
  const { data: categoryData, loading: categoriesLoading } = useQuery(GET_SKILL_CATEGORIES);

  const skills = useMemo(() => data?.cv.skills ?? [], [data]);

  const groups = useMemo(
    () => toLevelGroups(skills, categoryData?.skillCategories ?? []),
    [skills, categoryData]
  );

  return {
    skills,
    groups,
    loading: loading || categoriesLoading,
    error,
    refetch: () => refetch().catch(() => undefined),
  };
}
