import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

describe('DropdownMenu', () => {
  it('opens content and handles item click', async () => {
    const onClick = vi.fn();

    render(
      h(
        DropdownMenu,
        null,
        h(DropdownMenuTrigger, null, 'Open menu'),
        h(
          DropdownMenuContent,
          null,
          h(DropdownMenuItem, { onClick }, 'Action'),
          h(DropdownMenuSeparator),
          h(DropdownMenuItem, null, 'Other')
        )
      )
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    const action = await screen.findByText('Action');
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalled();
  });
});
