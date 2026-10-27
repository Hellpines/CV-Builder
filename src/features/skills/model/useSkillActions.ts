import { useMemo } from 'react';
import { skipToken, useMutation, useQuery } from '@apollo/client/react';
import type { PickerOption } from '@/components/ui/level-modal';
import { toast } from '@/shared/lib/toast';
import type { Mastery, SkillMastery } from '@/shared/types/user';
import { GET_SKILLS_CATALOG } from '../api/SkillQueries';
import {
  ADD_PROFILE_SKILL_MUTATION,
  DELETE_PROFILE_SKILL_MUTATION,
  UPDATE_PROFILE_SKILL_MUTATION,
} from '../api/SkillMutations';

const CATALOG_LIMIT = 100;

interface UseSkillActionsParams {
  userId?: string;
  skills: SkillMastery[];
  enabled: boolean;
}

export function useSkillActions({ userId, skills, enabled }: UseSkillActionsParams) {
  const { data } = useQuery(
    GET_SKILLS_CATALOG,
    enabled ? { variables: { params: { limit: CATALOG_LIMIT } } } : skipToken
  );

  const [addSkill] = useMutation(ADD_PROFILE_SKILL_MUTATION);
  const [updateSkill] = useMutation(UPDATE_PROFILE_SKILL_MUTATION);
  const [deleteSkill] = useMutation(DELETE_PROFILE_SKILL_MUTATION);

  const catalog = useMemo(() => data?.skills.items ?? [], [data]);

  const options = useMemo<PickerOption[]>(() => {
    const owned = new Set(skills.map((skill) => skill.name));
    return catalog
      .map((skill) => ({ value: skill.id, label: skill.name, exists: owned.has(skill.name) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [catalog, skills]);

  const add = async (skillId: string, mastery: string) => {
    const skill = catalog.find((item) => item.id === skillId);
    if (!userId || !skill) throw new Error('Skill not found');

    try {
      await addSkill({
        variables: {
          skill: {
            userId,
            name: skill.name,
            categoryId: skill.category.id,
            mastery: mastery as Mastery,
          },
        },
      });
      toast.success(`${skill.name} added successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to add ${skill.name}`);
      throw err;
    }
  };

  const update = async (name: string, mastery: string) => {
    if (!userId) throw new Error('User not found');
    const current = skills.find((skill) => skill.name === name);

    try {
      await updateSkill({
        variables: {
          skill: {
            userId,
            name,
            categoryId: current?.categoryId ?? null,
            mastery: mastery as Mastery,
          },
        },
      });
      toast.success(`${name} updated successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to update ${name}`);
      throw err;
    }
  };

  const remove = async (names: string[]) => {
    if (!userId) throw new Error('User not found');
    try {
      await deleteSkill({ variables: { skill: { userId, name: names } } });
      toast.success(`${names.join(', ')} removed successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove skill');
      throw err;
    }
  };

  return { options, add, update, remove };
}
