import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorScreen } from './error-screen';

describe('ErrorScreen', () => {
  it('renders title and description without action', () => {
    render(h(ErrorScreen, { title: 'Oops', description: 'Broken' }));

    expect(screen.getByRole('heading', { name: 'Oops' })).toBeInTheDocument();
    expect(screen.getByText('Broken')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders action button and calls handler', () => {
    const onAction = vi.fn();
    render(
      h(ErrorScreen, {
        title: 'Offline',
        description: 'Retry please',
        actionLabel: 'Retry',
        onAction,
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
