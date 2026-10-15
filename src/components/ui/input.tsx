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
  const shouldFloat = isFocused || hasValue || disabled;

  return (
    <div className="relative w-full">
      <InputPrimitive
        type={type}
        data-slot="input"
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
          'w-full border bg-transparent p-3 transition-colors placeholder:text-transparent',
          isInvalid
            ? 'border-primary text-primary'
            : 'border-muted text-primary-bold hover:border-border',
          disabled && 'border-muted bg-input-disabled text-primary-foreground cursor-not-allowed',
          className
        )}
        {...props}
      />

      {placeholder ? (
        <label
          className={cn(
            'pointer-events-none absolute left-3 leading-none transition-all duration-200',
            shouldFloat ? '-top-5 text-[12px]' : 'top-1/2 -translate-y-1/2 text-[14px]',
            isInvalid ? 'text-primary' : 'text-primary-foreground'
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

export { Input };
