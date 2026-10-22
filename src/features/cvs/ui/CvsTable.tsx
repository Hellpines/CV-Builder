'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, EllipsisVertical } from 'lucide-react';
import { cn } from 'cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CvListItem, CvSortDirection } from '../types/CvTypes';

function SkeletonRows() {
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
            <td className="px-4 py-5">
              <div className="bg-muted/40 h-4 w-3/4 animate-pulse rounded" />
            </td>
            <td />
          </tr>
          <tr>
            <td colSpan={4} className="px-4 pb-6">
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className={cn('w-full overflow-x-auto transition-opacity', busy && 'opacity-60')}>
      <table className="w-full border-collapse text-left">
        <thead className="border-muted border-b">
          <tr className="text-primary-bold text-sm">
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
                Name
                {sortDirection === 'asc' ? (
                  <ArrowUp size={16} className="text-primary-foreground" />
                ) : (
                  <ArrowDown size={16} className="text-primary-foreground" />
                )}
              </button>
            </th>
            <th scope="col" className="w-[25%] px-4 py-5 font-medium">
              Education
            </th>
            <th scope="col" className="px-4 py-5 font-medium">
              Employee
            </th>
            <th scope="col" className="w-14 px-4 py-5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        {loading ? (
          <SkeletonRows />
        ) : items.length ? (
          items.map((cv) => (
            <tbody key={cv.id} className="border-muted border-b">
              <tr className="text-primary-bold text-sm">
                <td className="px-4 py-7">{cv.name}</td>
                <td className="px-4 py-7">{cv.education ?? ''}</td>
                <td className="px-4 py-7">{cv.user?.email ?? fallbackEmail ?? ''}</td>
                <td className="px-4 py-1 text-right">
                  <DropdownMenu
                    open={openMenuId === cv.id}
                    onOpenChange={(open) => setOpenMenuId(open ? cv.id : null)}
                  >
                    <DropdownMenuTrigger
                      aria-label={`Actions for ${cv.name}`}
                      className="text-primary-foreground hover:border-border focus-visible:outline-primary inline-flex h-10 w-10 items-center justify-center rounded-full border-0 transition-colors hover:border"
                    >
                      <EllipsisVertical size={20} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="end"
                      sideOffset={4}
                      className="min-w-36"
                    >
                      <DropdownMenuItem onClick={() => onView(cv)}>View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(cv)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(cv)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="text-primary-bold/50 px-4 pb-5 text-sm leading-relaxed">
                  {cv.description}
                </td>
              </tr>
            </tbody>
          ))
        ) : (
          <tbody>
            <tr>
              <td colSpan={4} className="text-primary-foreground px-4 py-16 text-center text-sm">
                {emptyText}
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}
