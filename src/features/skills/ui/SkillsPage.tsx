'use client';

import { AppLoader } from '@/components/ui/app-loader';
import { LevelsPanel, type LevelsPanelLabels } from '@/components/ui/levels-panel';
import { MASTERY_OPTIONS } from '../model/skillLevels';
import { useSkillActions } from '../model/useSkillActions';
import { useSkills } from '../model/useSkills';

const labels: LevelsPanelLabels = {
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

export function SkillsPage({ userId }: { userId?: string }) {
  const readOnly = Boolean(userId);

  const { targetId, skills, groups, loading, error } = useSkills(userId);
  const { options, add, update, remove } = useSkillActions({
    userId: targetId,
    skills,
    enabled: !readOnly,
  });

  if (error) {
    return <div className="text-primary pt-6">Error loading skills: {error.message}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-213 py-8">
      {loading && <AppLoader size={72} />}

      <LevelsPanel
        groups={groups}
        readOnly={readOnly}
        options={options}
        levels={MASTERY_OPTIONS}
        labels={labels}
        onAdd={add}
        onUpdate={update}
        onRemove={remove}
      />
    </div>
  );
}
