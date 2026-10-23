import type { LevelGroup } from '@/components/ui/levels-panel';
import type { SkillMastery } from '@/shared/types/user';
import { MASTERY_BY_VALUE, MASTERY_LEVELS } from '../model/skillLevels';
import type { SkillCategory } from '../types/SkillTypes';
import { groupSkills } from './groupSkills';

export function toLevelGroups(skills: SkillMastery[], categories: SkillCategory[]): LevelGroup[] {
  return groupSkills(skills, categories).map((group) => ({
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
  }));
}
