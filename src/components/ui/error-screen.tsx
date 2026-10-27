import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

function SadMonitor({ className }: { className?: string }) {
  return (
    <svg
      width="160"
      height="80"
      viewBox="0 0 102 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="1" y="1" width="102" height="64" rx="6" />
      <circle cx="35" cy="26" r="2" fill="currentColor" />
      <circle cx="69" cy="26" r="2" fill="currentColor" />
      <path d="M32 50 Q52 36 72 50" />
      <path d="M38 65 L32 78 M66 65 L72 78 M22 78 H82" />
    </svg>
  );
}

interface ErrorScreenProps {
  title: string;
  description: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorScreen({ title, description, actionLabel, onAction }: ErrorScreenProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 px-4 text-center">
      <SadMonitor className="text-foreground" />
      <h1 className="text-foreground text-3xl font-normal">{title}</h1>
      <p className="text-foreground text-sm leading-relaxed">{description}</p>
      {actionLabel ? (
        <Button onClick={onAction} className="w-55 py-4">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
