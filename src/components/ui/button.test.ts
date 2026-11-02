import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonVariants } from './button';

describe('Button', () => {
  it('renders primary by default and forwards click', () => {
    const onClick = vi.fn();
    render(h(Button, { onClick }, 'Save'));

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('data-slot', 'button');
    expect(button.className).toContain('bg-primary');

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    const { rerender } = render(h(Button, { variant: 'secondary' }, 'Sec'));
    expect(screen.getByRole('button').className).toContain('border-border');

    rerender(h(Button, { variant: 'ghost' }, 'Ghost'));
    expect(screen.getByRole('button').className).toContain(
      'hover:border-ghost-button-hover-border'
    );

    rerender(h(Button, { variant: 'icon' }, 'Icon'));
    expect(screen.getByRole('button').className).toContain('p-3');

    rerender(h(Button, { variant: 'primaryV2' }, 'V2'));
    expect(screen.getByRole('button').className).toContain('bg-transparent');
  });

  it('merges custom className via buttonVariants', () => {
    expect(buttonVariants({ variant: 'primary', className: 'extra' })).toContain('extra');
  });
});
