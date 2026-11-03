import type { LanguageProficiency, SkillMastery } from '@/shared/types/user';
import type { CvProjectItem } from './CvProjectTypes';

export interface PreviewCategory {
  id: string;
  name: string;
  order: number;
  parent?: PreviewCategory | null;
  children?: PreviewCategory[] | null;
}

export interface CvPreviewData {
  id: string;
  name: string;
  education: string | null;
  description: string;
  skills: SkillMastery[];
  projects: CvProjectItem[] | null;
  user: {
    id: string;
    email: string;
    position: { id: string; name: string } | null;
    profile: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      full_name: string | null;
      languages: LanguageProficiency[];
    };
  } | null;
}

export interface PreviewSkillGroup {
  id: string;
  title: string;
  skills: string[];
}

export interface PreviewSkillRow {
  name: string;
  years: number | null;
  lastUsed: number | null;
}

export interface PreviewSkillTable {
  id: string;
  title: string;
  rows: PreviewSkillRow[];
}

export interface PreviewProject {
  id: string;
  name: string;
  description: string;
  roles: string[];
  period: string;
  responsibilities: string[];
  environment: string[];
}

export interface CvPreviewModel {
  name: string;
  fullName: string;
  position: string;
  education: string;
  languages: LanguageProficiency[];
  domains: string[];
  description: string;
  skillGroups: PreviewSkillGroup[];
  projects: PreviewProject[];
  skillTables: PreviewSkillTable[];
}
