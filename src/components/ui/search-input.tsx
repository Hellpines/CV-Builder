'use client';

import { Search } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { cn } from 'cn';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('common.search');

  return (
    <div className={cn('relative', className)}>
      <Search
        className="text-primary-foreground absolute top-1/2 left-9 -translate-y-1/2"
        size={18}
      />
      <input
        type="text"
        aria-label={resolvedPlaceholder}
        placeholder={resolvedPlaceholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-muted text-primary-foreground placeholder:text-placeholder focus:border-border h-12 w-80 max-w-full rounded-full border bg-transparent pr-4 pl-11 text-sm transition-colors outline-none"
      />
    </div>
  );
}
