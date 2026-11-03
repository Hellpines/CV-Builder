import { i18n } from '@/shared/i18n/i18n';
import type { LevelTone } from '@/components/ui/level-bar';
import type { Proficiency } from '@/shared/types/user';

interface ProficiencyLevel {
  value: Proficiency;
  label: string;
  progress: number;
  tone: LevelTone;
}

const levelLabel = (key: string, value: string) => `${value} – ${i18n.t(key)}`;

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  { value: 'A1', label: levelLabel('levels.beginner', 'A1'), progress: 0, tone: 'gray' },
  { value: 'A2', label: levelLabel('levels.elementary', 'A2'), progress: 0.2, tone: 'gray' },
  { value: 'B1', label: levelLabel('levels.intermediate', 'B1'), progress: 0.4, tone: 'blue' },
  {
    value: 'B2',
    label: levelLabel('levels.upperIntermediate', 'B2'),
    progress: 0.6,
    tone: 'green',
  },
  { value: 'C1', label: levelLabel('levels.advanced', 'C1'), progress: 0.8, tone: 'yellow' },
  { value: 'C2', label: levelLabel('levels.proficient', 'C2'), progress: 0.8, tone: 'yellow' },
  { value: 'Native', label: i18n.t('levels.native'), progress: 1, tone: 'red' },
];

export const PROFICIENCY_OPTIONS = PROFICIENCY_LEVELS.map(({ value, label, tone }) => ({
  value,
  label,
  tone,
}));

export const PROFICIENCY_BY_VALUE: Record<Proficiency, ProficiencyLevel> = {
  A1: PROFICIENCY_LEVELS[0],
  A2: PROFICIENCY_LEVELS[1],
  B1: PROFICIENCY_LEVELS[2],
  B2: PROFICIENCY_LEVELS[3],
  C1: PROFICIENCY_LEVELS[4],
  C2: PROFICIENCY_LEVELS[5],
  Native: PROFICIENCY_LEVELS[6],
};
