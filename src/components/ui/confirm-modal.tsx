'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  loading: boolean;
  error?: string;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  message,
  loading,
  error,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <p className="text-foreground mb-6 text-sm">{message}</p>

      {error ? <p className="text-primary mb-6 text-sm">{error}</p> : null}

      <div className="flex justify-end gap-6">
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() => onOpenChange(false)}
          className="w-40"
        >
          Cancel
        </Button>
        <Button variant="primary" disabled={loading} onClick={onConfirm} className="w-40">
          {loading ? 'Removing...' : 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
}
