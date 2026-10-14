'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from 'cn';
import { Input } from '@/components/ui/input';
import { PasswordInputProps } from '../types/PasswordInputProps';

export function PasswordInput({
  value,
  onChange,
  placeholder,
  className,
  invalid = false,
  helperText,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        invalid={invalid}
        className={cn('h-12 pr-10', className)}
        helperText={helperText}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className={cn(
          'absolute top-1/2 right-3 transition-colors',
          invalid ? 'text-primary hover:text-primary' : 'text-primary-text hover:text-primary-bold'
        )}
        style={{ transform: 'translateY(-50%)' }}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
