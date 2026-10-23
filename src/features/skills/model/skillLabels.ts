import type { LevelsPanelLabels } from '@/components/ui/levels-panel';

export const SKILL_LABELS: LevelsPanelLabels = {
  add: 'Add skill',
  remove: 'Remove skills',
  addTitle: 'Add skill',
  editTitle: 'Update skill',
  removeTitle: 'Remove skill',
  removeMessage: (count) =>
    `Are you sure you want to remove ${count} ${count === 1 ? 'skill' : 'skills'}?`,
  optionLabel: 'Skill',
  levelLabel: 'Skill mastery',
  optionRequired: 'Skill is required',
  levelRequired: 'Skill mastery is required',
  duplicate: 'Skill already exists',
  empty: 'No skills yet',
};
