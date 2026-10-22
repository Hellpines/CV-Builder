import type { LevelTone } from '@/components/ui/level-bar';
import type { Proficiency } from '@/shared/types/user';

interface ProficiencyLevel {
  value: Proficiency;
  label: string;
  progress: number;
  tone: LevelTone;
}

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  { value: 'A1', label: 'A1 – Beginner', progress: 0, tone: 'gray' },
  { value: 'A2', label: 'A2 – Elementary', progress: 0.2, tone: 'gray' },
  { value: 'B1', label: 'B1 – Intermediate', progress: 0.4, tone: 'blue' },
  { value: 'B2', label: 'B2 – Upper intermediate', progress: 0.6, tone: 'green' },
  { value: 'C1', label: 'C1 – Advanced', progress: 0.8, tone: 'yellow' },
  { value: 'C2', label: 'C2 – Proficient', progress: 0.8, tone: 'yellow' },
  { value: 'Native', label: 'Native', progress: 1, tone: 'red' },
];

export const PROFICIENCY_OPTIONS = PROFICIENCY_LEVELS.map(({ value, label, tone }) => ({
  value,
  label,
  tone,
}));

export const PROFICIENCY_BY_VALUE = Object.fromEntries(
  PROFICIENCY_LEVELS.map((level) => [level.value, level])
) as Record<Proficiency, ProficiencyLevel>;
