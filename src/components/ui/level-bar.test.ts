import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LevelBar } from './level-bar';

describe('LevelBar', () => {
  it('renders label and clamps progress to percent width', () => {
    const { container, rerender } = render(
      h(LevelBar, { label: 'React', progress: 0.456, tone: 'blue' })
    );

    expect(screen.getByText('React')).toBeInTheDocument();
    const fill = container.querySelector('[style]') as HTMLElement;
    expect(fill.style.width).toBe('46%');
    expect(fill.parentElement?.className).toContain('29B6F6');

    rerender(h(LevelBar, { label: 'React', progress: 2, tone: 'green' }));
    expect((container.querySelector('[style]') as HTMLElement).style.width).toBe('100%');

    rerender(h(LevelBar, { label: 'React', progress: -1, tone: 'red', className: 'extra' }));
    expect((container.querySelector('[style]') as HTMLElement).style.width).toBe('0%');
    expect(container.firstElementChild?.className).toContain('extra');
  });

  it('supports all tones', () => {
    (['gray', 'blue', 'green', 'yellow', 'red'] as const).forEach((tone) => {
      const { unmount } = render(h(LevelBar, { label: tone, progress: 0.5, tone }));
      expect(screen.getByText(tone)).toBeInTheDocument();
      unmount();
    });
  });
});
