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

  const handleChange = (val: string | null) => {
    if (!val) return;
    onChange(String(val) === String(value) ? '' : String(val));
  };

  return (
    <div className="flex flex-col">
      <label
        className={`text-select-label ml-3 text-xs transition-opacity duration-200 ${
          selected ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {label}
      </label>
      <Select disabled={disabled} value={null} onValueChange={handleChange}>
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
          {options.map((opt) => {
            const isSelected = String(opt.id) === String(value);
            return (
              <SelectItem
                key={opt.id}
                value={String(opt.id)}
                className={
                  isSelected
                    ? 'bg-select-selected text-select-selected-text data-highlighted:bg-select-selected data-highlighted:text-select-selected-text'
                    : undefined
                }
              >
                {opt.name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
