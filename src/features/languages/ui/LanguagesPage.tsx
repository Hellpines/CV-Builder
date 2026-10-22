'use client';

import { Loader2 } from 'lucide-react';
import { LevelsPanel, type LevelsPanelLabels } from '@/components/ui/levels-panel';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useLanguages } from '../models/useLanguages';
import { useLanguageActions } from '../models/useLanguagesActions';
import { PROFICIENCY_OPTIONS } from '../models/languagesLevels';

const labels: LevelsPanelLabels = {
  add: 'Add language',
  remove: 'Remove languages',
  addTitle: 'Add language',
  editTitle: 'Update language',
  removeTitle: 'Remove language',
  removeMessage: (count) =>
    `Are you sure you want to remove ${count} ${count === 1 ? 'language' : 'languages'}?`,
  optionLabel: 'Language',
  levelLabel: 'Language proficiency',
  optionRequired: 'Language is required',
  levelRequired: 'Language proficiency is required',
  duplicate: 'Language already exists',
  empty: 'No languages yet',
};

export function LanguagesPage({ userId }: { userId?: string }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const readOnly = userId !== undefined && userId !== 'me' && userId !== currentUserId;

  const { targetId, languages, groups, loading, error } = useLanguages(userId);
  const { options, add, update, remove } = useLanguageActions({
    userId: targetId,
    languages,
    enabled: !readOnly,
  });

  if (error) {
    return <div className="text-primary pt-6">Error loading languages: {error.message}</div>;
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
