import type { LevelTone } from '@/components/ui/level-bar';
import type { Mastery } from '@/shared/types/user';

interface MasteryLevel {
  value: Mastery;
  label: string;
  progress: number;
  tone: LevelTone;
}

export const MASTERY_LEVELS: MasteryLevel[] = [
  { value: 'Novice', label: 'Novice', progress: 0.2, tone: 'gray' },
  { value: 'Advanced', label: 'Advanced', progress: 0.4, tone: 'blue' },
  { value: 'Competent', label: 'Competent', progress: 0.6, tone: 'green' },
  { value: 'Proficient', label: 'Proficient', progress: 0.8, tone: 'yellow' },
  { value: 'Expert', label: 'Expert', progress: 1, tone: 'red' },
];

export const MASTERY_OPTIONS = MASTERY_LEVELS.map(({ value, label, tone }) => ({
  value,
  label,
  tone,
}));

export const MASTERY_BY_VALUE = Object.fromEntries(
  MASTERY_LEVELS.map((level) => [level.value, level])
) as Record<Mastery, MasteryLevel>;
