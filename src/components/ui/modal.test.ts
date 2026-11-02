import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './modal';

describe('Modal', () => {
  it('renders title and children when open', () => {
    const onOpenChange = vi.fn();
    render(h(Modal, { open: true, onOpenChange, title: 'Edit' }, h('p', null, 'Body content')));

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('does not show content when closed', () => {
    render(
      h(Modal, { open: false, onOpenChange: vi.fn(), title: 'Hidden' }, h('p', null, 'Secret'))
    );

    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('closes via close button', () => {
    const onOpenChange = vi.fn();
    render(h(Modal, { open: true, onOpenChange, title: 'Close me', className: 'wide' }, 'x'));

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange.mock.calls[0][0]).toBe(false);
  });
});
