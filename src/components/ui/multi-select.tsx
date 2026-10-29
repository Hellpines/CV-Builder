'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { cn } from 'cn';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import { SelectContent } from '@/components/ui/select';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  invalid?: boolean;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  display?: 'chips' | 'text';
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder,
  label,
  invalid,
  helperText,
  disabled,
  className,
  display = 'chips',
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selected = value
    .map((v) => options.find((o) => String(o.value) === String(v)))
    .filter(Boolean) as MultiSelectOption[];

  const hasValue = selected.length > 0;
  const topLabel = label ?? placeholder;

  const remove = (val: string) => onValueChange(value.filter((v) => v !== val));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !disabled && value.length > 0) {
      e.preventDefault();
      onValueChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex w-full flex-col">
      {topLabel ? (
        <label
          className={cn(
            'ml-3 text-xs transition-opacity duration-200',
            invalid ? 'text-primary' : 'text-select-label',
            hasValue ? 'opacity-100' : 'opacity-0'
          )}
        >
          {topLabel}
        </label>
      ) : null}

      <div className="relative w-full">
        <SelectPrimitive.Root
          multiple
          value={value}
          onValueChange={(v) => onValueChange(v as string[])}
          open={open}
          onOpenChange={setOpen}
          disabled={disabled}
        >
          <SelectPrimitive.Trigger
            data-slot="multi-select-trigger"
            aria-invalid={invalid || undefined}
            aria-label={topLabel}
            onKeyDown={handleKeyDown}
            className={cn(
              'flex min-h-12 w-full items-center justify-between gap-1.5 border bg-transparent px-3 py-2 text-left text-sm transition-colors outline-none select-none',
              invalid
                ? 'border-primary text-primary'
                : 'border-muted text-select-text hover:border-border focus-visible:border-border',
              open && !invalid && 'border-border bg-select-trigger-open',
              'data-disabled:border-muted data-disabled:bg-input-disabled-background data-disabled:text-primary-foreground data-disabled:hover:border-muted data-disabled:cursor-not-allowed',
              className
            )}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              {hasValue ? (
                display === 'text' ? (
                  <span
                    className={cn(
                      'truncate',
                      disabled ? 'text-input-disabled-text' : 'text-foreground'
                    )}
                  >
                    {selected.map((opt) => opt.label).join(', ')}
                  </span>
                ) : (
                  selected.map((opt) => (
                    <span
                      key={opt.value}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm',
                        disabled
                          ? 'border-muted text-input-disabled-text'
                          : 'border-border text-foreground'
                      )}
                    >
                      {opt.label}
                      <span
                        role="button"
                        aria-label={`Remove ${opt.label}`}
                        tabIndex={-1}
                        className={cn(
                          'inline-flex',
                          disabled ? 'pointer-events-none' : 'hover:text-primary cursor-pointer'
                        )}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(opt.value);
                        }}
                      >
                        <XIcon className="size-3.5" />
                      </span>
                    </span>
                  ))
                )
              ) : (
                <span
                  className={cn(
                    'truncate',
                    disabled
                      ? 'text-input-disabled-text'
                      : invalid
                        ? 'text-primary'
                        : 'text-placeholder'
                  )}
                >
                  {placeholder}
                </span>
              )}
            </div>

            <ChevronDownIcon
              className={cn(
                'pointer-events-none shrink-0 transition-transform duration-200',
                open && 'rotate-180',
                invalid ? 'text-primary' : 'text-select-text'
              )}
            />
          </SelectPrimitive.Trigger>

          <SelectContent>
            {options.map((opt) => (
              <MultiSelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </MultiSelectItem>
            ))}
          </SelectContent>
        </SelectPrimitive.Root>

        {helperText ? (
          <p className="text-primary absolute -bottom-5 left-3 text-[12px]">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
}

function MultiSelectItem({ className, children, value, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      value={value}
      data-slot="multi-select-item"
      className={cn(
        'group/item text-foreground relative flex w-full cursor-default items-center gap-3 p-3 text-sm transition-colors outline-none select-none',
        'data-highlighted:bg-select-hover data-highlighted:text-select-hover-text',
        'aria-selected:bg-select-selected aria-selected:text-select-selected-text',
        'aria-selected:data-highlighted:bg-select-selected aria-selected:data-highlighted:text-select-selected-text',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'border-border flex size-5 shrink-0 items-center justify-center border bg-transparent',
          'group-data-highlighted/item:bg-select-hover group-data-highlighted/item:text-select-hover-text',
          'group-aria-selected/item:border-select-selected-text group-aria-selected/item:bg-select-selected group-aria-selected/item:text-select-selected-text',
          'group-aria-selected/item:group-data-highlighted/item:bg-select-selected group-aria-selected/item:group-data-highlighted/item:text-select-selected-text'
        )}
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="flex-1 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
