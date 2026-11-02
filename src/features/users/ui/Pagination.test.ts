import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value?: string | null;
    onValueChange?: (value: string | null) => void;
    children: React.ReactNode;
  }) =>
    h(
      'div',
      {
        'data-testid': 'page-size',
        'data-value': value ?? '',
        onClick: () => onValueChange?.('20'),
      },
      children
    ),
  SelectTrigger: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
    h('button', { type: 'button', ...props }, children),
  SelectValue: ({ children }: { children?: React.ReactNode }) => h('span', null, children),
  SelectContent: ({ children }: { children?: React.ReactNode }) => h('div', null, children),
  SelectItem: ({ value, children }: { value: string; children?: React.ReactNode }) =>
    h('div', { 'data-value': value }, children),
}));

import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('disables prev on first page and next on last page', () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    const { rerender } = render(
      h(Pagination, {
        page: 1,
        totalPages: 5,
        pageSize: 10,
        onPageChange,
        onPageSizeChange,
      })
    );

    expect(screen.getByLabelText('common.previousPage')).toBeDisabled();
    expect(screen.getByLabelText('common.nextPage')).toBeEnabled();

    fireEvent.click(screen.getByLabelText('common.nextPage'));
    expect(onPageChange).toHaveBeenCalledWith(2);

    rerender(
      h(Pagination, {
        page: 5,
        totalPages: 5,
        pageSize: 10,
        onPageChange,
        onPageSizeChange,
      })
    );

    expect(screen.getByLabelText('common.nextPage')).toBeDisabled();
    fireEvent.click(screen.getByLabelText('common.previousPage'));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('renders page buttons and ellipsis, and changes page size', () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      h(Pagination, {
        page: 5,
        totalPages: 10,
        pageSize: 10,
        onPageChange,
        onPageSizeChange,
      })
    );

    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByTestId('page-size'));
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('treats totalPages below 1 as a single page', () => {
    render(
      h(Pagination, {
        page: 1,
        totalPages: 0,
        pageSize: 10,
        onPageChange: vi.fn(),
        onPageSizeChange: vi.fn(),
      })
    );

    expect(screen.getByLabelText('common.previousPage')).toBeDisabled();
    expect(screen.getByLabelText('common.nextPage')).toBeDisabled();
  });
});
