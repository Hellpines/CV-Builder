import { fullYearsBetween, parseDate } from '@/shared/lib/date';
import type { CvProjectItem } from '../types/CvProjectTypes';

export interface SkillUsage {
  years: number | null;
  lastUsed: number | null;
}

const normalize = (value: string) => value.trim().toLowerCase();

export function calculateSkillUsage(
  skillName: string,
  projects: CvProjectItem[],
  now: Date = new Date()
): SkillUsage {
  const key = normalize(skillName);
  const usedIn = projects.filter((project) =>
    (project.environment ?? []).some((tech) => normalize(tech) === key)
  );

  if (!usedIn.length) return { years: null, lastUsed: null };

  let earliest: Date | null = null;
  for (const project of usedIn) {
    const start = parseDate(project.start_date);
    if (start && (!earliest || start.getTime() < earliest.getTime())) earliest = start;
  }
  const years = earliest ? fullYearsBetween(earliest, now) : null;

  const currentYear = now.getFullYear();
  let lastUsed: number | null = null;

  if (usedIn.some((project) => !project.end_date)) {
    lastUsed = currentYear;
  } else {
    for (const project of usedIn) {
      const end = parseDate(project.end_date);
      if (end) lastUsed = Math.max(lastUsed ?? 0, Math.min(end.getFullYear(), currentYear));
    }
  }

  return { years, lastUsed };
}
