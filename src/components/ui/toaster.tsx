'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from 'cn';
import { useToastStore, type ToastData, type ToastType } from '@/shared/lib/toast';

const toneClass: Record<ToastType, string> = {
  success: 'bg-success text-success-text border-success-border',
  error: 'bg-error text-error-text border-error-border',
  warning: 'bg-warning text-warning-text border-warning-border',
  info: 'bg-info text-info-text border-info-border',
};

interface ToastItemProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || toast.duration <= 0) return;
    const timer = setTimeout(() => onClose(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [paused, toast.id, toast.duration, onClose]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        'animate-in fade-in-0 slide-in-from-right-8 pointer-events-auto rounded-2xl border px-5 py-4 shadow-md duration-200',
        toneClass[toast.type]
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-lg leading-tight font-medium">{toast.title}</p>
        <button
          type="button"
          aria-label="Close notification"
          onClick={() => onClose(toast.id)}
          className="-mt-1 -mr-1 shrink-0 cursor-pointer rounded-full p-1 transition-opacity outline-none hover:opacity-70 focus-visible:ring-2 focus-visible:ring-current"
        >
          <X size={24} />
        </button>
      </div>
      {toast.description ? <p className="mt-3 text-sm">{toast.description}</p> : null}
    </div>
  );
}

const subscribe = () => () => undefined;

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const remove = useToastStore((state) => state.remove);

  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-6 right-6 z-110 flex w-[min(24rem,calc(100vw-3rem))] flex-col gap-3"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={remove} />
      ))}
    </div>,
    document.body
  );
}
