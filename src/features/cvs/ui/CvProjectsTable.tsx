'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, EllipsisVertical } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { cn } from 'cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsCompact } from '@/shared/hooks/useIsCompact';
import { formatDate, parseDate } from '@/shared/lib/date';
import type { CvProjectItem, CvProjectSortKey, CvSortDirection } from '../types/CvProjectTypes';

function SkeletonRows({ colSpan, showDomain }: { colSpan: number; showDomain: boolean }) {
  const skeletonCells = showDomain ? 4 : 3;

  return (
    <>
      {[0, 1, 2].map((index) => (
        <tbody key={index} className="border-muted border-b" aria-hidden="true">
          <tr>
            {Array.from({ length: skeletonCells }, (_, cell) => (
              <td key={cell} className="px-4 py-5">
                <div className="bg-muted/40 h-4 w-2/3 animate-pulse rounded" />
              </td>
            ))}
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

interface SortableHeadProps {
  label: string;
  sortKey: CvProjectSortKey;
  activeKey: CvProjectSortKey | null;
  direction: CvSortDirection;
  onSort: (key: CvProjectSortKey) => void;
  className?: string;
}

function SortableHead({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className,
}: SortableHeadProps) {
  const isActive = activeKey === sortKey;

  return (
    <th
      scope="col"
      aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn('px-4 py-3 font-medium', className)}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="focus-visible:outline-primary flex cursor-pointer items-center gap-1 text-left font-medium outline-offset-4"
      >
        {label}
        {isActive && direction === 'asc' ? (
          <ArrowUp size={16} className="text-primary-foreground" />
        ) : (
          <ArrowDown
            size={16}
            className={isActive ? 'text-primary-foreground' : 'text-muted-foreground/30'}
          />
        )}
      </button>
    </th>
  );
}

interface CvProjectsTableProps {
  items: CvProjectItem[];
  loading: boolean;
  emptyText: string;
  sortKey: CvProjectSortKey | null;
  sortDirection: CvSortDirection;
  onSort: (key: CvProjectSortKey) => void;
  onEdit: (item: CvProjectItem) => void;
  onDelete: (item: CvProjectItem) => void;
}

export function CvProjectsTable({
  items,
  loading,
  emptyText,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
}: CvProjectsTableProps) {
  const { t } = useTranslation();
  const isCompact = useIsCompact();
  const showDomain = !isCompact;
  const colSpan = showDomain ? 5 : 4;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const sortProps = { activeKey: sortKey, direction: sortDirection, onSort };

  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn('w-full border-collapse text-left', showDomain ? 'min-w-180' : 'min-w-0')}
      >
        <thead className="border-muted border-b">
          <tr className="text-foreground text-sm">
            <SortableHead
              label={t('common.name')}
              sortKey="name"
              className={showDomain ? 'w-[30%]' : 'w-[40%]'}
              {...sortProps}
            />
            {showDomain && (
              <th scope="col" className="w-[24%] px-4 py-3 font-medium">
                {t('cv.projectDomain')}
              </th>
            )}
            <SortableHead
              label={t('common.startDate')}
              sortKey="startDate"
              className={showDomain ? 'w-[18%]' : 'w-[28%]'}
              {...sortProps}
            />
            <SortableHead
              label={t('common.endDate')}
              sortKey="endDate"
              className={showDomain ? 'w-[18%]' : 'w-[28%]'}
              {...sortProps}
            />
            <th scope="col" className="w-14 px-4 py-3">
              <span className="sr-only">{t('common.actions')}</span>
            </th>
          </tr>
        </thead>

        {loading ? (
          <SkeletonRows colSpan={colSpan} showDomain={showDomain} />
        ) : items.length ? (
          items.map((item) => (
            <tbody key={item.id} className="border-muted border-b">
              <tr className="text-foreground text-sm">
                <td className="px-4 py-5">{item.name}</td>
                {showDomain && <td className="px-4 py-5">{item.domain}</td>}
                <td className="px-4 py-5">{formatDate(parseDate(item.start_date))}</td>
                <td className="px-4 py-5">
                  {item.end_date ? formatDate(parseDate(item.end_date)) : t('cv.tillNow')}
                </td>
                <td className="px-4 py-2 text-right">
                  <DropdownMenu
                    open={openMenuId === item.id}
                    onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}
                  >
                    <DropdownMenuTrigger
                      aria-label={`${t('common.actions')} ${item.name}`}
                      className="text-primary-foreground hover:bg-primary-hover focus-visible:outline-primary inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    >
                      <EllipsisVertical size={20} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="end"
                      sideOffset={4}
                      className="min-w-36"
                    >
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        {t('common.update')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(item)}>
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
              <tr>
                <td
                  colSpan={colSpan}
                  className="text-primary-foreground/70 px-4 pb-4 text-sm leading-relaxed"
                >
                  {item.description}
                </td>
              </tr>
              {item.responsibilities.length ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 pb-5">
                    <ul className="flex flex-wrap gap-2">
                      {item.responsibilities.map((responsibility, index) => (
                        <li
                          key={`${responsibility}-${index}`}
                          className="bg-primary-hover text-foreground rounded-full px-3 py-1 text-xs"
                        >
                          {responsibility}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ) : null}
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
