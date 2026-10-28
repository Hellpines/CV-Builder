'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { AppLoader } from '@/components/ui/app-loader';
import UsersTable from './UsersTable';
import { useQuery } from '@apollo/client/react';
import { GET_USERS } from '../api/UserQueries';
import { PaginatedUsers, SortDirection, SortKey } from '../types/UserTypes';
import { Pagination } from './Pagination';
import { SearchInput } from '@/components/ui/search-input';

const SORT_FIELDS: Record<SortKey, string> = {
  firstName: 'first_name',
  lastName: 'last_name',
  email: 'email',
  department: 'department',
  position: 'position',
};

interface GetUsersQueryResponse {
  users: PaginatedUsers;
}

export function UsersPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { data, previousData, loading, error } = useQuery(GET_USERS, {
    variables: {
      params: {
        search: searchQuery.trim() || undefined,
        page,
        limit,
        sort_by: sortKey ? SORT_FIELDS[sortKey] : undefined,
        sort_order: sortKey ? sortDirection : undefined,
      },
    },
  });

  const result = ((data ?? previousData) as GetUsersQueryResponse | undefined)?.users;
  const users = useMemo(() => result?.items ?? [], [result]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setPage(1);
  };

  return (
    <div className="flex min-h-full flex-col gap-2.5">
      <SearchInput value={searchQuery} onChange={handleSearch} className="pl-5" />

      {loading && !result && <AppLoader size={72} />}
      {error && (
        <div className="text-primary pl-10 text-sm">
          {t('errors.loadUsers')}: {error.message}
        </div>
      )}

      {!error && result && (
        <>
          <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <UsersTable
              data={users}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </div>

          <Pagination
            page={page}
            totalPages={result.total_pages}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={handleLimitChange}
          />
        </>
      )}
    </div>
  );
}
