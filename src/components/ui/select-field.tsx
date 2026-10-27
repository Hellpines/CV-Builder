'use client';

import { cn } from 'cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: SelectFieldOption[];
  onChange: (value: string) => void;
  onTouched?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  errorText?: string;
}

export function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
  onTouched,
  disabled,
  invalid,
  errorText,
}: SelectFieldProps) {
  const selected = options.find((option) => option.value === value);

  const labelClasses = cn(
    'text-select-label pointer-events-none absolute -top-4 left-3 text-[12px] leading-none transition-opacity duration-200',
    selected ? 'opacity-100' : 'opacity-0'
  );

  const valueClasses = cn(
    disabled
      ? 'text-primary-foreground'
      : selected
        ? 'text-foreground'
        : invalid
          ? 'text-primary'
          : 'text-placeholder'
  );

  const selectedItemClasses =
    'bg-select-selected text-select-selected-text data-highlighted:bg-select-selected data-highlighted:text-select-selected-text';

  return (
    <div className="relative w-full">
      <span className={labelClasses}>{label}</span>
      <Select
        disabled={disabled}
        value={value || null}
        onValueChange={(next) => {
          if (next) onChange(String(next));
        }}
        onOpenChange={(open) => {
          if (!open) onTouched?.();
        }}
      >
        <SelectTrigger
          className="h-12 w-full"
          aria-label={label}
          invalid={invalid}
          helperText={invalid ? errorText : undefined}
        >
          <SelectValue className={valueClasses}>{selected?.label ?? placeholder}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={option.value === value ? selectedItemClasses : undefined}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
