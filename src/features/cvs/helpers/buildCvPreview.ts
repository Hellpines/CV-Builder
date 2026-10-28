import i18next from 'i18next';
import { formatMonthYear, parseDate } from '@/shared/lib/date';
import type {
  CvPreviewData,
  CvPreviewModel,
  PreviewCategory,
  PreviewProject,
} from '../types/CvPreviewTypes';
import type { CvProjectItem } from '../types/CvProjectTypes';
import { calculateSkillUsage } from './skillUsage';
import { groupPreviewSkills } from './groupPreviewSkills';

function formatPeriod(project: CvProjectItem): string {
  const start = formatMonthYear(parseDate(project.start_date));
  const end = project.end_date
    ? formatMonthYear(parseDate(project.end_date))
    : i18next.t('cv.tillNow');
  return `${start} – ${end}`;
}

export function buildCvPreview(
  cv: CvPreviewData,
  categories: PreviewCategory[],
  now: Date = new Date()
): CvPreviewModel {
  const profile = cv.user?.profile;
  const projects = cv.projects ?? [];

  const fullName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    cv.user?.email ||
    '';

  const domains: string[] = [];
  const seenDomains = new Set<string>();
  for (const project of projects) {
    const domain = project.domain?.trim();
    if (!domain || seenDomains.has(domain.toLowerCase())) continue;
    seenDomains.add(domain.toLowerCase());
    domains.push(domain);
  }

  const { byRoot, byCategory } = groupPreviewSkills(cv.skills, categories);

  const previewProjects: PreviewProject[] = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    roles: project.roles,
    period: formatPeriod(project),
    responsibilities: project.responsibilities,
    environment: project.environment,
  }));

  return {
    name: cv.name,
    fullName,
    position: cv.user?.position?.name ?? '',
    education: cv.education ?? '',
    languages: profile?.languages ?? [],
    domains,
    description: cv.description,
    skillGroups: byRoot.map((bucket) => ({
      id: bucket.id,
      title: bucket.name,
      skills: bucket.skills.map((skill) => skill.name),
    })),
    projects: previewProjects,
    skillTables: byCategory.map((bucket) => ({
      id: bucket.id,
      title: bucket.name,
      rows: bucket.skills.map((skill) => ({
        name: skill.name,
        ...calculateSkillUsage(skill.name, projects, now),
      })),
    })),
  };
}
