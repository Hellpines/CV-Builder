'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { cn } from 'cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getPageItems } from '../helpers/getPageItems';

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  page,
  totalPages,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { t } = useTranslation();
  const total = Math.max(1, totalPages);

  const arrowClass =
    'text-primary-foreground flex p-1 cursor-pointer items-center justify-center transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex items-center justify-center gap-6">
      <nav aria-label={t('common.pagination')} className="flex items-center gap-2">
        <Button
          variant="icon"
          className={arrowClass}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('common.previousPage')}
        >
          <ChevronLeft size={24} />
        </Button>

        {getPageItems(page, total).map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border px-2 text-sm transition-colors',
                item === page
                  ? 'border-primary text-primary'
                  : 'border-muted text-foreground hover:border-border'
              )}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="text-primary-foreground px-1 text-sm">
              ...
            </span>
          )
        )}

        <Button
          variant="icon"
          className={arrowClass}
          disabled={page >= total}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('common.nextPage')}
        >
          <ChevronRight size={24} />
        </Button>
      </nav>

      <div className="w-20">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            if (value) onPageSizeChange(Number(value));
          }}
        >
          <SelectTrigger className="h-10 p-2 pl-3" aria-label={t('common.rowsPerPage')}>
            <SelectValue>{pageSize}</SelectValue>
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((size) => {
              const isSelected = size === pageSize;

              return (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className={
                    isSelected
                      ? 'bg-select-selected text-select-selected-text data-highlighted:bg-primary-foreground'
                      : undefined
                  }
                >
                  {size}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
