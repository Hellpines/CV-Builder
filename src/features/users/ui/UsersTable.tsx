'use client';

import { ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { User } from '../types/UserTypes';
import { Button } from '@/components/ui/button';

type SortKey = 'firstName' | 'lastName' | 'email' | 'department' | 'position';

const headData = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department' },
  { key: 'position', label: 'Position' },
];

export default function UsersTable({ data }: { data: User[] }) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const valueA =
        sortKey === 'firstName'
          ? a.profile?.first_name || ''
          : sortKey === 'lastName'
            ? a.profile?.last_name || ''
            : sortKey === 'email'
              ? a.email
              : sortKey === 'department'
                ? a.department?.name || ''
                : a.position?.name || '';

      const valueB =
        sortKey === 'firstName'
          ? b.profile?.first_name || ''
          : sortKey === 'lastName'
            ? b.profile?.last_name || ''
            : sortKey === 'email'
              ? b.email
              : sortKey === 'department'
                ? b.department?.name || ''
                : b.position?.name || '';

      return valueA.localeCompare(valueB) * (sortDirection === 'asc' ? 1 : -1);
    });

    return sorted;
  }, [data, sortDirection, sortKey]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  return (
    <div className="w-full overflow-x-auto pl-6">
      <table className="w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="bg-transparent text-sm">
            <th className="border-muted border-b px-4 py-3 text-sm font-medium" />

            {headData.map(({ key, label }) => {
              const isActive = sortKey === key;

              return (
                <th key={key} className="border-muted border-b px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort(key as SortKey)}
                    className="text-primary-bold flex cursor-pointer items-center gap-1 text-left text-sm font-medium"
                  >
                    {label}
                    {isActive ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp width={16} height={16} className="text-primary-foreground" />
                      ) : (
                        <ArrowDown width={16} height={16} className="text-primary-foreground" />
                      )
                    ) : (
                      <ArrowDown width={16} height={16} className="text-muted-foreground/30" />
                    )}
                  </button>
                </th>
              );
            })}

            <th className="border-muted border-b px-4 py-3 font-medium" />
          </tr>
        </thead>

        <tbody>
          {sortedData.length ? (
            sortedData.map((user) => {
              const firstName = user.profile?.first_name || '';
              const lastName = user.profile?.last_name || '';
              const avatar = user.profile?.avatar;
              const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';

              return (
                <tr
                  key={user.id}
                  onClick={() => router.push(`/users/${user.id}`)}
                  className="text-primary-bold hover:bg-primary-hover cursor-pointer border border-b-2 transition-colors"
                >
                  <td className="border-muted border-b py-4 align-middle text-sm">
                    <div className="flex items-center justify-center">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt={`${firstName} ${lastName}`}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="bg-muted text-l text-secondary flex h-10 w-10 items-center justify-center rounded-full font-medium">
                          {initials}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="border-muted border-b p-4">{firstName}</td>
                  <td className="border-muted border-b p-4">{lastName}</td>
                  <td className="border-muted border-b p-4">{user.email}</td>
                  <td className="border-muted border-b p-4">{user.department?.name || ''}</td>
                  <td className="border-muted border-b p-4">{user.position?.name || ''}</td>

                  <td className="border-muted border-b px-4 py-4 align-middle">
                    <div className="flex justify-end">
                      <Button
                        variant="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/users/${user.id}`);
                        }}
                        className="flex h-10 w-10 items-center justify-center p-2"
                        aria-label="View employee details"
                      >
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={7}
                className="text-primary-foreground absolute top-1/2 left-1/2 -translate-y-1/2 text-sm"
              >
                No users found ...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
