import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { AppLoader } from './app-loader';

describe('AppLoader', () => {
  it('renders loading status with default size', () => {
    render(h(AppLoader));

    const loader = screen.getByRole('status', { name: 'common.loading' });
    expect(loader).toHaveAttribute('width', '72');
    expect(loader).toHaveAttribute('height', '72');
    expect(loader.getAttribute('class')).toContain('animate-spin');
  });

  it('applies custom size and className', () => {
    render(h(AppLoader, { size: 32, className: 'extra' }));

    const loader = screen.getByRole('status');
    expect(loader).toHaveAttribute('width', '32');
    expect(loader.getAttribute('class')).toContain('extra');
  });
});
