import { useState } from 'react';
import { skipToken, useQuery } from '@apollo/client/react';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { GET_USER_CVS } from '../api/CvQueries';
import type { CvSortDirection } from '../types/CvTypes';

const SORT_FIELD = 'name';

export function useCvs() {
  const currentUser = useAuthStore((state) => state.user);
  const userId = currentUser?.id;

  const [search, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimitValue] = useState(10);
  const [sortDirection, setSortDirection] = useState<CvSortDirection>('asc');

  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { data, previousData, loading, error, refetch } = useQuery(
    GET_USER_CVS,
    userId
      ? {
          variables: {
            userId,
            params: {
              search: debouncedSearch || undefined,
              page,
              limit,
              sort_by: SORT_FIELD,
              sort_order: sortDirection,
            },
          },
          fetchPolicy: 'cache-and-network',
        }
      : skipToken
  );

  const result = (data ?? previousData)?.cvsByUserId;

  const setSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const setLimit = (value: number) => {
    setLimitValue(value);
    setPage(1);
  };

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  return {
    email: currentUser?.email,
    items: result?.items ?? [],
    total: result?.total ?? 0,
    totalPages: result?.total_pages ?? 1,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    isSearching: Boolean(debouncedSearch),
    sortDirection,
    toggleSort,
    loading,
    initialLoading: loading && !result,
    error,
    refetch: () => refetch().catch(() => undefined),
  };
}
