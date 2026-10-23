import { useMemo, useState } from 'react';
import { skipToken, useQuery } from '@apollo/client/react';
import { parseDate } from '@/shared/lib/date';
import { GET_CV_PROJECTS } from '../api/CvProjectQueries';
import type { CvProjectSortKey, CvSortDirection } from '../types/CvProjectTypes';

const compare = (a: number, b: number) => (a === b ? 0 : a < b ? -1 : 1);

export function useCvProjects(cvId?: string) {
  const { data, loading, error, refetch } = useQuery(
    GET_CV_PROJECTS,
    cvId ? { variables: { cvId }, fetchPolicy: 'cache-and-network' } : skipToken
  );

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<CvProjectSortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<CvSortDirection>('asc');

  const allItems = useMemo(() => data?.cv.projects ?? [], [data]);
  const query = search.trim().toLowerCase();

  const items = useMemo(() => {
    const filtered = query
      ? allItems.filter(
          (item) =>
            item.name.toLowerCase().includes(query) || item.domain.toLowerCase().includes(query)
        )
      : allItems;

    if (!sortKey) return filtered;

    const direction = sortDirection === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * direction;
      if (sortKey === 'startDate') {
        return (
          compare(
            parseDate(a.start_date)?.getTime() ?? 0,
            parseDate(b.start_date)?.getTime() ?? 0
          ) * direction
        );
      }
      return (
        compare(
          parseDate(a.end_date)?.getTime() ?? Infinity,
          parseDate(b.end_date)?.getTime() ?? Infinity
        ) * direction
      );
    });
  }, [allItems, query, sortKey, sortDirection]);

  const toggleSort = (key: CvProjectSortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return {
    allItems,
    items,
    search,
    setSearch,
    isSearching: Boolean(query),
    sortKey,
    sortDirection,
    toggleSort,
    initialLoading: loading && !data,
    loading,
    error,
    refetch: () => refetch().catch(() => undefined),
  };
}
