'use client';

import { Button } from '@/components/ui/button';
import { AppLoader } from '@/components/ui/app-loader';
import { LevelsPanel } from '@/components/ui/levels-panel';
import { MASTERY_OPTIONS } from '../model/skillLevels';
import { useCvSkills } from '../model/useCvSkills';
import { useCvSkillActions } from '../model/useCvSkillActions';
import { SKILL_LABELS } from '../model/skillLabels';

export function CvSkillsPage({ cvId }: { cvId: string }) {
  const { skills, groups, loading, error, refetch } = useCvSkills(cvId);
  const { options, add, update, remove } = useCvSkillActions({ cvId, skills });

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <p className="text-primary text-sm">Failed to load CV skills</p>
        <Button variant="secondary" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return <AppLoader size={48} />;
  }

  return (
    <div className="mx-auto w-full max-w-212.5 pt-8 pb-20">
      <LevelsPanel
        groups={groups}
        readOnly={false}
        options={options}
        levels={MASTERY_OPTIONS}
        labels={SKILL_LABELS}
        onAdd={add}
        onUpdate={update}
        onRemove={remove}
      />
    </div>
  );
}
