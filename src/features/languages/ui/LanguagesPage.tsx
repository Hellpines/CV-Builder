'use client';

import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { LevelsPanel, type LevelsPanelLabels } from '@/components/ui/levels-panel';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useLanguages } from '../models/useLanguages';
import { useLanguageActions } from '../models/useLanguagesActions';
import { PROFICIENCY_OPTIONS } from '../models/languagesLevels';

export function LanguagesPage({ userId }: { userId?: string }) {
  const { t } = useTranslation();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const readOnly = userId !== undefined && userId !== 'me' && userId !== currentUserId;

  const { targetId, languages, groups, loading, error } = useLanguages(userId);
  const { options, add, update, remove } = useLanguageActions({
    userId: targetId,
    languages,
    enabled: !readOnly,
  });

  const labels: LevelsPanelLabels = {
    add: t('languages.add'),
    remove: t('languages.remove'),
    addTitle: t('languages.addTitle'),
    editTitle: t('languages.editTitle'),
    removeTitle: t('languages.removeTitle'),
    removeMessage: (count) =>
      t(count === 1 ? 'languages.removeMessage_one' : 'languages.removeMessage_other', {
        count,
      }),
    optionLabel: t('languages.optionLabel'),
    levelLabel: t('languages.levelLabel'),
    optionRequired: t('languages.optionRequired'),
    levelRequired: t('languages.levelRequired'),
    duplicate: t('languages.duplicate'),
    empty: t('languages.empty'),
  };

  if (error) {
    return (
      <div className="text-primary pt-6">
        {t('errors.loadLanguages', { message: error.message })}
      </div>
    );
  }

  if (loading) {
    return <Loader2 size={48} className="text-primary-foreground mx-auto mt-20 animate-spin" />;
  }

  return (
    <div className="mx-auto w-full max-w-212.5 pt-8 pb-20">
      <LevelsPanel
        groups={groups}
        readOnly={readOnly}
        options={options}
        levels={PROFICIENCY_OPTIONS}
        labels={labels}
        onAdd={add}
        onUpdate={update}
        onRemove={remove}
      />
    </div>
  );
}
