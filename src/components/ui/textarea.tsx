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

  const textareaClasses = cn(
    'block min-h-32 w-full resize-none border bg-transparent p-3 text-sm transition-colors outline-none placeholder:text-transparent',
    isInvalid
      ? 'border-primary'
      : 'border-muted text-input-text hover:border-border focus:border-border',
    disabled &&
      'border-muted bg-input-disabled-background text-input-disabled-text cursor-not-allowed',
    className
  );

  const labelClasses = cn(
    'pointer-events-none absolute left-3 leading-none transition-all duration-200',
    shouldFloat ? '-top-4 text-[12px]' : 'top-5 -translate-y-1/2 text-[14px]',
    isInvalid
      ? 'text-primary'
      : shouldFloat
        ? 'text-floating-label'
        : disabled
          ? 'text-input-disabled-text'
          : 'text-placeholder'
  );

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
        className={textareaClasses}
        {...props}
      />

      {placeholder ? <label className={labelClasses}>{placeholder}</label> : null}

      {helperText ? (
        <p className="text-primary absolute -bottom-5 left-3 text-[12px]">{helperText}</p>
      ) : null}
    </div>
  );
}

export { Textarea };
