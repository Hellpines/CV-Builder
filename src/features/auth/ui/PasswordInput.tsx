'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from 'cn';
import { Input } from '@/components/ui/input';
import { PasswordInputProps } from '../types/PasswordInputProps';

export function PasswordInput({ value, onChange, placeholder, className }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn('text-primary-bold placeholder:text-muted h-12 pr-10', className)}
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="text-primary-text hover:text-primary-bold absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
