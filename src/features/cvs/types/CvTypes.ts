export interface CvListItem {
  id: string;
  name: string;
  education: string | null;
  description: string;
  user: { id: string; email: string } | null;
}

export interface PaginatedCvs {
  items: CvListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export type CvSortDirection = 'asc' | 'desc';

export interface CvFormValues {
  name: string;
  education: string;
  description: string;
}
