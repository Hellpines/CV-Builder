'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { AppLoader } from '@/components/ui/app-loader';
import { LevelsPanel, type LevelsPanelLabels } from '@/components/ui/levels-panel';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { MASTERY_OPTIONS } from '../model/skillLevels';
import { useSkillActions } from '../model/useSkillActions';
import { useSkills } from '../model/useSkills';

export function SkillsPage({ userId }: { userId?: string }) {
  const { t } = useTranslation();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const readOnly = userId !== undefined && userId !== 'me' && userId !== currentUserId;

  const { targetId, skills, groups, loading, error } = useSkills(userId);
  const { options, add, update, remove } = useSkillActions({
    userId: targetId,
    skills,
    enabled: !readOnly,
  });

  const labels: LevelsPanelLabels = {
    add: t('skills.add'),
    remove: t('skills.remove'),
    addTitle: t('skills.addTitle'),
    editTitle: t('skills.editTitle'),
    removeTitle: t('skills.removeTitle'),
    removeMessage: (count) =>
      t(count === 1 ? 'skills.removeMessage_one' : 'skills.removeMessage_other', { count }),
    optionLabel: t('skills.optionLabel'),
    levelLabel: t('skills.levelLabel'),
    optionRequired: t('skills.optionRequired'),
    levelRequired: t('skills.levelRequired'),
    duplicate: t('skills.duplicate'),
    empty: t('skills.empty'),
  };

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
