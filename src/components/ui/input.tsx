import { Input as InputPrimitive } from '@base-ui/react/input';
import { useState } from 'react';
import { cn } from 'cn';

type InputProps = React.ComponentProps<'input'> & {
  invalid?: boolean;
  helperText?: string;
};

function Input({
  className,
  type,
  placeholder,
  value,
  disabled,
  invalid,
  helperText,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isInvalid = Boolean(invalid) || props['aria-invalid'] === true;
  const shouldFloat = isFocused || hasValue;

  const inputClasses = cn(
    'w-full border bg-transparent p-3 transition-colors placeholder:text-transparent',
    isInvalid ? 'border-primary' : 'border-muted text-foreground hover:border-border',
    disabled &&
      'border-muted bg-input-disabled-background text-input-disabled-text cursor-not-allowed',
    className
  );

  const labelClasses = cn(
    'pointer-events-none absolute left-3 leading-none transition-all duration-200',
    shouldFloat ? '-top-4 text-[12px]' : 'top-1/2 -translate-y-1/2 text-[14px]',
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
      <InputPrimitive
        type={type}
        data-slot="input"
        suppressHydrationWarning
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
        className={inputClasses}
        {...props}
      />

      {placeholder ? <label className={labelClasses}>{placeholder}</label> : null}

      {helperText ? (
        <p className="text-primary absolute -bottom-5 left-3 text-[12px]">{helperText}</p>
      ) : null}
    </div>
  );
}

export { Input };
