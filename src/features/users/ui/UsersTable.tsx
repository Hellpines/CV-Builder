'use client';

import { ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { User } from '@/shared/types/user';
import type { SortDirection, SortKey } from '../types/UserTypes';

interface UsersTableProps {
  data: User[];
  sortKey: SortKey | null;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}

export default function UsersTable({ data, sortKey, sortDirection, onSort }: UsersTableProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const headData: { key: SortKey; label: string }[] = [
    { key: 'firstName', label: t('common.firstName') },
    { key: 'lastName', label: t('common.lastName') },
    { key: 'email', label: t('common.email') },
    { key: 'department', label: t('common.department') },
    { key: 'position', label: t('common.position') },
  ];

  return (
    <div className="w-full overflow-x-auto">
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
                    onClick={() => onSort(key)}
                    className="text-foreground flex cursor-pointer items-center gap-1 text-left text-sm font-medium"
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
          {data.length ? (
            data.map((user) => {
              const firstName = user.profile?.first_name || '';
              const lastName = user.profile?.last_name || '';
              const avatar = user.profile?.avatar;
              const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U';

              return (
                <tr
                  key={user.id}
                  onClick={() => router.push(`/users/${user.id}`)}
                  className="text-foreground hover:bg-primary-hover cursor-pointer border border-b-2 transition-colors"
                >
                  <td className="border-muted border-b py-4 align-middle text-sm">
                    <div className="flex items-center justify-center">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt={`${firstName} ${lastName}`}
                          width={40}
                          height={40}
                          className="h-10 rounded-full object-cover"
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
                        aria-label={t('user.viewEmployee')}
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
                {t('errors.noUsersFound')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
