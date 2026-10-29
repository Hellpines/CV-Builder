'use client';

import type { ReactNode } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { cn } from 'cn';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onOpenChange, title, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-3 bg-black/60 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={cn(
            'bg-background fixed top-1/2 left-1/2 z-3 flex max-h-[calc(100vh-2rem)] w-154 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col px-6 py-4 shadow-md transition-opacity duration-150 outline-none',
            'data-ending-style:opacity-0 data-starting-style:opacity-0',
            className
          )}
        >
          <Dialog.Title className="text-foreground mb-6 shrink-0 text-xl font-medium">
            {title}
          </Dialog.Title>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          <Dialog.Close
            aria-label="Close"
            className="text-foreground hover:text-foreground absolute top-4 right-4 cursor-pointer transition-colors"
          >
            <X size={20} />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
