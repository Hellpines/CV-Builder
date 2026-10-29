'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Option {
  id: string;
  name: string;
}

interface FormSelectProps {
  label: string;
  placeholder: string;
  options: Option[];
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  errorText?: string;
}

export function FormSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  invalid,
  errorText,
}: FormSelectProps) {
  const selected = options.find((o) => String(o.id) === String(value));

  return (
    <div className="flex flex-col">
      <label
        className={`text-select-label ml-3 text-xs transition-opacity duration-200 ${
          selected ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {label}
      </label>
      <Select
        disabled={disabled}
        value={value ? String(value) : null}
        onValueChange={(val) => {
          if (val) onChange(String(val));
        }}
      >
        <SelectTrigger
          className="h-12 w-full"
          invalid={invalid}
          helperText={invalid ? errorText : undefined}
        >
          <SelectValue
            className={
              disabled
                ? 'text-select-disabled-text'
                : selected
                  ? 'text-foreground'
                  : invalid
                    ? 'text-primary'
                    : 'text-placeholder'
            }
          >
            {selected?.name || placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={String(opt.id)}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
