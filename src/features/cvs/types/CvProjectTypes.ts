import type { CvSortDirection } from './CvTypes';

export type { CvSortDirection };

export interface ProjectInfo {
  id: string;
  name: string;
  domain: string;
  description: string;
  environment: string[];
  start_date: string;
  end_date: string | null;
}

export interface CvProjectItem {
  id: string;
  name: string;
  domain: string;
  description: string;
  start_date: string;
  end_date: string | null;
  environment: string[];
  roles: string[];
  responsibilities: string[];
  project: ProjectInfo;
}

export type CvProjectSortKey = 'name' | 'startDate' | 'endDate';

export interface CvProjectFormValues {
  projectId: string;
  startDate: string;
  endDate: string;
  roles: string[];
  responsibilities: string;
}

export interface CvProjectPayload {
  projectId: string;
  start_date: string;
  end_date: string | null;
  roles: string[];
  responsibilities: string[];
}
