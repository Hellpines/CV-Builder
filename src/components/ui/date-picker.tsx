'use client';

import { useState } from 'react';
import { Popover } from '@base-ui/react/popover';
import { CalendarDays, X } from 'lucide-react';
import { cn } from 'cn';
import { Calendar } from '@/components/ui/calendar';
import { formatDate, parseDate, toISODate } from '@/shared/lib/date';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string | null;
  maxDate?: string | null;
  disabled?: boolean;
  invalid?: boolean;
  helperText?: string;
  clearable?: boolean;
  onTouched?: () => void;
}

export function DatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabled,
  invalid,
  helperText,
  clearable,
  onTouched,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const selected = parseDate(value);
  const min = parseDate(minDate);
  const max = parseDate(maxDate);
  const floated = Boolean(selected);

  return (
    <div className="relative w-full">
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onTouched?.();
        }}
      >
        <Popover.Trigger
          disabled={disabled}
          aria-label={label}
          aria-invalid={invalid || undefined}
          className={cn(
            'flex h-12 w-full cursor-pointer items-center justify-between border bg-transparent px-3 text-left text-sm transition-colors outline-none',
            invalid
              ? 'border-primary text-primary'
              : 'border-muted text-foreground hover:border-border focus-visible:border-border data-popup-open:border-border',
            'data-disabled:border-muted data-disabled:bg-input-disabled-background data-disabled:text-input-disabled-text data-disabled:hover:border-muted data-disabled:cursor-not-allowed'
          )}
        >
          <span>{formatDate(selected)}</span>
          <CalendarDays
            size={20}
            className={cn('shrink-0', invalid ? 'text-primary' : 'text-input-disabled-text')}
          />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Positioner side="bottom" align="start" sideOffset={4} className="isolate z-3">
            <Popover.Popup className="bg-background border-muted border px-8 py-6 shadow-md outline-none">
              <Calendar
                value={selected}
                minDate={min}
                maxDate={max}
                defaultMonth={min}
                onSelect={(date) => {
                  onChange(toISODate(date));
                  setOpen(false);
                  onTouched?.();
                }}
              />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      {clearable && selected && !disabled ? (
        <button
          type="button"
          aria-label={`Clear ${label}`}
          onClick={() => onChange('')}
          className="text-input-disabled-text hover:text-foreground absolute top-1/2 right-11 -translate-y-1/2 cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>
      ) : null}

      <span
        className={cn(
          'pointer-events-none absolute left-3 leading-none transition-all duration-200',
          floated ? '-top-4 text-[12px]' : 'top-1/2 -translate-y-1/2 text-[14px]',
          invalid
            ? 'text-primary'
            : floated || disabled
              ? 'text-input-disabled-text'
              : 'text-placeholder'
        )}
      >
        {label}
      </span>

      {helperText ? (
        <p className="text-primary absolute -bottom-5 left-3 text-[12px]">{helperText}</p>
      ) : null}
    </div>
  );
}
