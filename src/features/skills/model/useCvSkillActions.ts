import { useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { toast } from '@/shared/lib/toast';
import type { Mastery, SkillMastery } from '@/shared/types/user';
import {
  ADD_CV_SKILL_MUTATION,
  DELETE_CV_SKILL_MUTATION,
  UPDATE_CV_SKILL_MUTATION,
} from '../api/CvSkillMutations';
import { GET_SKILLS_CATALOG } from '../api/SkillQueries';
import { buildSkillOptions } from '../helpers/buildSkillOptions';

const CATALOG_LIMIT = 100;

interface UseCvSkillActionsParams {
  cvId?: string;
  skills: SkillMastery[];
}

export function useCvSkillActions({ cvId, skills }: UseCvSkillActionsParams) {
  const { t } = useTranslation();
  const { data } = useQuery(GET_SKILLS_CATALOG, {
    variables: { params: { limit: CATALOG_LIMIT } },
  });

  const [addSkill] = useMutation(ADD_CV_SKILL_MUTATION);
  const [updateSkill] = useMutation(UPDATE_CV_SKILL_MUTATION);
  const [deleteSkill] = useMutation(DELETE_CV_SKILL_MUTATION);

  const catalog = useMemo(() => data?.skills.items ?? [], [data]);
  const options = useMemo(() => buildSkillOptions(catalog, skills), [catalog, skills]);

  const add = async (skillId: string, mastery: string) => {
    const skill = catalog.find((item) => item.id === skillId);
    if (!cvId || !skill) throw new Error('Skill not found');

    try {
      await addSkill({
        variables: {
          skill: {
            cvId,
            name: skill.name,
            categoryId: skill.category.id,
            mastery: mastery as Mastery,
          },
        },
      });
      toast.success(t('notifications.skillAdded', { name: skill.name }));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('notifications.skillAddFailed', { name: skill.name })
      );
      throw err;
    }
  };

  const update = async (name: string, mastery: string) => {
    if (!cvId) throw new Error('CV not found');
    const current = skills.find((skill) => skill.name === name);

    try {
      await updateSkill({
        variables: {
          skill: {
            cvId,
            name,
            categoryId: current?.categoryId ?? null,
            mastery: mastery as Mastery,
          },
        },
      });
      toast.success(t('notifications.skillUpdated', { name }));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('notifications.skillUpdateFailed', { name })
      );
      throw err;
    }
  };

  const remove = async (names: string[]) => {
    if (!cvId) throw new Error('CV not found');
    try {
      await deleteSkill({ variables: { skill: { cvId, name: names } } });
      toast.success(t('notifications.skillRemoved', { names: names.join(', ') }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.skillRemoveFailed'));
      throw err;
    }
  };

  return { options, add, update, remove };
}
