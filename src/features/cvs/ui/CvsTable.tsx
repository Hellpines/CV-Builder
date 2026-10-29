'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { ArrowDown, ArrowUp, EllipsisVertical } from 'lucide-react';
import { cn } from 'cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsCompact } from '@/shared/hooks/useIsCompact';
import type { CvListItem, CvSortDirection } from '../types/CvTypes';

function SkeletonRows({ colSpan, showEmployee }: { colSpan: number; showEmployee: boolean }) {
  return (
    <>
      {[0, 1, 2].map((index) => (
        <tbody key={index} className="border-muted border-b" aria-hidden="true">
          <tr>
            <td className="px-4 py-5">
              <div className="bg-muted/40 h-4 w-3/4 animate-pulse rounded" />
            </td>
            <td className="px-4 py-5">
              <div className="bg-muted/40 h-4 w-2/3 animate-pulse rounded" />
            </td>
            {showEmployee && (
              <td className="px-4 py-5">
                <div className="bg-muted/40 h-4 w-3/4 animate-pulse rounded" />
              </td>
            )}
            <td />
          </tr>
          <tr>
            <td colSpan={colSpan} className="px-4 pb-6">
              <div className="bg-muted/30 h-4 w-full animate-pulse rounded" />
            </td>
          </tr>
        </tbody>
      ))}
    </>
  );
}

interface CvsTableProps {
  items: CvListItem[];
  fallbackEmail?: string;
  loading: boolean;
  busy: boolean;
  emptyText: string;
  sortDirection: CvSortDirection;
  onSort: () => void;
  onView: (cv: CvListItem) => void;
  onEdit: (cv: CvListItem) => void;
  onDelete: (cv: CvListItem) => void;
}

export function CvsTable({
  items,
  fallbackEmail,
  loading,
  busy,
  emptyText,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}: CvsTableProps) {
  const { t } = useTranslation();
  const isCompact = useIsCompact();
  const showEmployee = !isCompact;
  const colSpan = showEmployee ? 4 : 3;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className={cn('w-full overflow-x-auto transition-opacity', busy && 'opacity-60')}>
      <table className="w-full border-collapse text-left">
        <thead className="border-muted border-b">
          <tr className="text-foreground text-sm">
            <th
              scope="col"
              aria-sort={sortDirection === 'asc' ? 'ascending' : 'descending'}
              className="w-[35%] px-4 py-5 font-medium"
            >
              <button
                type="button"
                onClick={onSort}
                className="focus-visible:outline-primary flex cursor-pointer items-center gap-1 text-left font-medium outline-offset-4"
              >
                {t('common.name')}
                {sortDirection === 'asc' ? (
                  <ArrowUp size={16} className="text-primary-foreground" />
                ) : (
                  <ArrowDown size={16} className="text-primary-foreground" />
                )}
              </button>
            </th>
            <th scope="col" className="w-[25%] px-4 py-5 font-medium">
              {t('common.education')}
            </th>
            {showEmployee && (
              <th scope="col" className="px-4 py-5 font-medium">
                {t('user.employee')}
              </th>
            )}
            <th scope="col" className="w-14 px-4 py-5">
              <span className="sr-only">{t('common.actions')}</span>
            </th>
          </tr>
        </thead>

        {loading ? (
          <SkeletonRows colSpan={colSpan} showEmployee={showEmployee} />
        ) : items.length ? (
          items.map((cv) => (
            <tbody key={cv.id} className="border-muted border-b">
              <tr className="text-foreground text-sm">
                <td className="px-4 py-7">{cv.name}</td>
                <td className="px-4 py-7">{cv.education ?? ''}</td>
                {showEmployee && (
                  <td className="px-4 py-7">{cv.user?.email ?? fallbackEmail ?? ''}</td>
                )}
                <td className="px-4 py-1 text-right">
                  <DropdownMenu
                    open={openMenuId === cv.id}
                    onOpenChange={(open) => setOpenMenuId(open ? cv.id : null)}
                  >
                    <DropdownMenuTrigger
                      aria-label={`${t('common.actions')} for ${cv.name}`}
                      className="text-primary-foreground hover:border-icon-button-hover-border hover:text-icon-button-hover-text active:bg-icon-button-active active:text-icon-button-active-text focus-visible:outline-primary inline-flex h-10 w-10 items-center justify-center rounded-full border-0 transition-colors hover:border"
                    >
                      <EllipsisVertical size={20} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="end"
                      sideOffset={4}
                      className="min-w-36"
                    >
                      <DropdownMenuItem onClick={() => onView(cv)}>
                        {t('common.view')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(cv)}>
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(cv)}>
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={colSpan}
                  className="text-foreground/50 px-4 pb-5 text-sm leading-relaxed"
                >
                  {cv.description}
                </td>
              </tr>
            </tbody>
          ))
        ) : (
          <tbody>
            <tr>
              <td
                colSpan={colSpan}
                className="text-primary-foreground px-4 py-16 text-center text-sm"
              >
                {emptyText}
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}
