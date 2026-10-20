'use client';

import { Loader2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import UsersTable from './UsersTable';
import { useQuery } from '@apollo/client/react';
import { GET_USERS } from '../api/UserQueries';
import { PaginatedUsers, SortDirection, SortKey } from '../types/UserTypes';
import { Pagination } from './Pagination';

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
      <div className="flex flex-col gap-5 pl-11">
        <div className="relative">
          <Search
            className="text-primary-foreground absolute top-1/2 left-4 -translate-y-1/2"
            size={18}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-muted text-primary-foreground placeholder:text-placeholder focus:border-border h-12 w-80 rounded-full border bg-transparent pr-4 pl-11 text-sm transition-colors outline-none"
          />
        </div>
      </div>

      {loading && !result && (
        <Loader2
          width={72}
          height={72}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      )}
      {error && (
        <div className="text-primary pl-10 text-sm">Failed to load users: {error.message}</div>
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
