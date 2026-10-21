'use client';

import { Loader2 } from 'lucide-react';

interface AppLoaderProps {
  className?: string;
  size?: number;
}

export function AppLoader({ className, size = 72 }: AppLoaderProps) {
  return (
    <div className="fixed inset-0 z-5 flex items-center justify-center bg-black/50">
      <Loader2
        size={size}
        className={['text-primary animate-spin', className].filter(Boolean).join(' ')}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
