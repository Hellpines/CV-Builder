import type { SkillMastery } from '@/shared/types/user';
import type { SkillCategory } from '../types/SkillTypes';

export interface SkillGroup {
  id: string;
  title: string;
  order: number;
  skills: SkillMastery[];
}

const OTHER = { id: 'other', title: 'Other', order: Number.MAX_SAFE_INTEGER };

function indexCategories(
  categories: SkillCategory[],
  index = new Map<string, SkillCategory>()
): Map<string, SkillCategory> {
  for (const category of categories) {
    index.set(category.id, category);
    if (category.children?.length) indexCategories(category.children, index);
  }
  return index;
}

export function groupSkills(skills: SkillMastery[], categories: SkillCategory[]): SkillGroup[] {
  const index = indexCategories(categories);
  const groups = new Map<string, SkillGroup>();

  for (const skill of skills) {
    const category = skill.categoryId ? index.get(skill.categoryId) : undefined;
    const meta = category
      ? { id: category.id, title: category.name, order: category.order }
      : OTHER;

    const group = groups.get(meta.id) ?? { ...meta, skills: [] };
    group.skills.push(skill);
    groups.set(meta.id, group);
  }

  return Array.from(groups.values()).sort((a, b) => a.order - b.order);
}
