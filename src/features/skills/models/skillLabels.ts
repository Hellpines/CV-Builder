import type { LevelsPanelLabels } from '@/components/ui/levels-panel';

export const SKILL_LABELS: LevelsPanelLabels = {
  add: 'skills.add',
  remove: 'skills.remove',
  addTitle: 'skills.addTitle',
  editTitle: 'skills.editTitle',
  removeTitle: 'skills.removeTitle',
  removeMessage: (count) => `skills.removeMessage_${count === 1 ? 'one' : 'other'}`,
  optionLabel: 'skills.optionLabel',
  levelLabel: 'skills.levelLabel',
  optionRequired: 'skills.optionRequired',
  levelRequired: 'skills.levelRequired',
  duplicate: 'skills.duplicate',
  empty: 'skills.empty',
};
