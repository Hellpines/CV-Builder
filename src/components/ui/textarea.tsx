'use client';

import { useState } from 'react';
import { cn } from 'cn';

type TextareaProps = React.ComponentProps<'textarea'> & {
  invalid?: boolean;
  helperText?: string;
};

function Textarea({
  className,
  placeholder,
  value,
  disabled,
  invalid,
  helperText,
  onFocus,
  onBlur,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isInvalid = Boolean(invalid) || props['aria-invalid'] === true;
  const shouldFloat = isFocused || hasValue;

  return (
    <div className="relative w-full">
      <textarea
        data-slot="textarea"
        value={value}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        className={cn(
          'block min-h-32 w-full resize-none border bg-transparent p-3 text-sm transition-colors outline-none placeholder:text-transparent',
          isInvalid
            ? 'border-primary text-primary'
            : 'border-muted text-primary-bold hover:border-border focus:border-border',
          disabled && 'border-muted bg-input-disabled text-primary-disabled cursor-not-allowed',
          className
        )}
        {...props}
      />

      {placeholder ? (
        <label
          className={cn(
            'pointer-events-none absolute left-3 leading-none transition-all duration-200',
            shouldFloat ? '-top-4 text-[12px]' : 'top-3.5 text-[14px]',
            isInvalid
              ? 'text-primary'
              : shouldFloat
                ? 'text-primary-foreground'
                : disabled
                  ? 'text-primary-foreground'
                  : 'text-placeholder'
          )}
        >
          {placeholder}
        </label>
      ) : null}

      {helperText ? (
        <p className="text-primary absolute -bottom-5 left-3 text-[12px]">{helperText}</p>
      ) : null}
    </div>
  );
}

export { Textarea };
