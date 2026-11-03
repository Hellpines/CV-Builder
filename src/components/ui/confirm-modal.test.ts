import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  it('renders message and confirms', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      h(ConfirmModal, {
        open: true,
        onOpenChange,
        title: 'Delete?',
        message: 'Are you sure?',
        loading: false,
        onConfirm,
      })
    );

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'common.confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancels, shows error, and shows removing label while loading', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      h(ConfirmModal, {
        open: true,
        onOpenChange,
        title: 'Delete?',
        message: 'Msg',
        loading: false,
        error: 'Nope',
        onConfirm: vi.fn(),
      })
    );

    expect(screen.getByText('Nope')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(
      h(ConfirmModal, {
        open: true,
        onOpenChange,
        title: 'Delete?',
        message: 'Msg',
        loading: true,
        onConfirm: vi.fn(),
      })
    );

    expect(screen.getByRole('button', { name: 'common.removing' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'common.cancel' })).toBeDisabled();
  });
});
