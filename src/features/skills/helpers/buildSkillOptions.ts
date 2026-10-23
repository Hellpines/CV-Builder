import type { PickerOption } from '@/components/ui/level-modal';
import type { SkillMastery } from '@/shared/types/user';
import type { CatalogSkill } from '../types/SkillTypes';

export function buildSkillOptions(catalog: CatalogSkill[], owned: SkillMastery[]): PickerOption[] {
  const ownedNames = new Set(owned.map((skill) => skill.name));

  return catalog
    .map((skill) => ({ value: skill.id, label: skill.name, exists: ownedNames.has(skill.name) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
