import type { User } from '@/shared/types/user';

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UsersQueryParams {
  search?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}
