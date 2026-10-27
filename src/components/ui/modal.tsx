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
            'bg-background fixed top-1/2 left-1/2 z-3 w-154 -translate-x-1/2 -translate-y-1/2 px-6 py-4 shadow-md transition-opacity duration-150 outline-none',
            'data-ending-style:opacity-0 data-starting-style:opacity-0',
            className
          )}
        >
          <Dialog.Title className="text-foreground mb-6 text-xl font-medium">{title}</Dialog.Title>
          {children}
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
