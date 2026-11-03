import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { SearchInput } from './search-input';

describe('SearchInput', () => {
  it('uses translated placeholder by default', () => {
    const onChange = vi.fn();
    render(h(SearchInput, { value: '', onChange }));

    const input = screen.getByRole('textbox', { name: 'common.search' });
    expect(input).toHaveAttribute('placeholder', 'common.search');
  });

  it('forwards changes and custom placeholder/className', () => {
    const onChange = vi.fn();
    const { container } = render(
      h(SearchInput, {
        value: 'ab',
        onChange,
        placeholder: 'Find',
        className: 'wrap',
      })
    );

    expect(container.firstElementChild?.className).toContain('wrap');
    fireEvent.change(screen.getByRole('textbox', { name: 'Find' }), {
      target: { value: 'abc' },
    });
    expect(onChange).toHaveBeenCalledWith('abc');
  });
});
