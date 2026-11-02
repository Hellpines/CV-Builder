import { createElement as h } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

import { toast, useToastStore } from '@/shared/lib/toast';
import { Toaster } from './toaster';

describe('Toaster', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    useToastStore.setState({ toasts: [] });
  });

  it('renders toasts from the store with roles', () => {
    render(h(Toaster));

    act(() => {
      toast.success('Saved ok');
      toast.error('Boom');
    });

    expect(screen.getByRole('status')).toHaveTextContent('toast.success');
    expect(screen.getByRole('alert')).toHaveTextContent('toast.error');
    expect(screen.getByText('Saved ok')).toBeInTheDocument();
  });

  it('closes toast via button after leave animation', () => {
    render(h(Toaster));

    let id = '';
    act(() => {
      id = toast.info('Stay', { duration: 0 });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close notification' }));

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(useToastStore.getState().toasts.find((item) => item.id === id)).toBeUndefined();
  });

  it('auto-dismisses after duration and pauses on hover', () => {
    render(h(Toaster));

    act(() => {
      toast.info('Timed', { duration: 1000 });
    });

    const node = screen.getByRole('status');
    fireEvent.mouseEnter(node);

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText('Timed')).toBeInTheDocument();

    fireEvent.mouseLeave(node);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText('Timed')).not.toBeInTheDocument();
  });

  it('pauses auto-dismiss on focus/blur', () => {
    render(h(Toaster));

    act(() => {
      toast.warning('Focus me', { duration: 500 });
    });

    const node = screen.getByRole('status');
    fireEvent.focus(node);
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByText('Focus me')).toBeInTheDocument();

    fireEvent.blur(node);
    act(() => {
      vi.advanceTimersByTime(500);
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByText('Focus me')).not.toBeInTheDocument();
  });
});
