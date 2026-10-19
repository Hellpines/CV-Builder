'use client';

import { Loader2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import UsersTable from './UsersTable';
import { useQuery } from '@apollo/client/react';
import { GET_USERS } from '../api/UserQueries';
import { User } from '@/shared/types/user';
import { PaginatedUsers } from '../types/UserTypes';

interface GetUsersQueryResponse {
  users: PaginatedUsers;
}

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error } = useQuery(GET_USERS, {
    variables: {
      params: {
        search: searchQuery || undefined,
        limit: 50,
      },
    },
  });

  const users = useMemo<User[]>(
    () => (data as GetUsersQueryResponse | undefined)?.users?.items ?? [],
    [data]
  );

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const firstName = user.profile?.first_name?.toLowerCase() || '';
      const lastName = user.profile?.last_name?.toLowerCase() || '';
      const email = user.email.toLowerCase();

      return firstName.includes(query) || lastName.includes(query) || email.includes(query);
    });
  }, [users, searchQuery]);

  return (
    <div className="flex min-h-full flex-col gap-2.5">
      <div className="flex flex-col gap-5 pt-4 pl-10">
        <div className="relative">
          <Search
            className="text-primary-foreground absolute top-1/2 left-4 -translate-y-1/2"
            size={18}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-muted text-primary-foreground placeholder:text-placeholder focus:border-border h-12 w-80 rounded-full border bg-transparent pr-4 pl-11 text-sm transition-colors outline-none"
          />
        </div>
      </div>

      {loading && (
        <Loader2
          width={72}
          height={72}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      )}
      {error && (
        <div className="text-primary pl-10 text-sm">Failed to load users: {error.message}</div>
      )}

      {!loading && !error && <UsersTable data={filteredUsers} />}
    </div>
  );
}
