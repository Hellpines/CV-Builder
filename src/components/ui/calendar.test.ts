import { createElement as h } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en-US' },
  }),
}));

import { Calendar } from './calendar';

function monthLabel(monthIndex: number) {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2024, monthIndex, 1));
}

describe('Calendar', () => {
  it('selects a day and highlights value', () => {
    const onSelect = vi.fn();
    const value = new Date(2024, 5, 15);

    render(h(Calendar, { value, onSelect, defaultMonth: value }));

    fireEvent.click(screen.getByRole('button', { name: value.toDateString() }));
    expect(onSelect).toHaveBeenCalledWith(expect.any(Date));
    expect(screen.getByRole('button', { name: value.toDateString() })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('disables days outside min/max range', () => {
    const onSelect = vi.fn();
    const month = new Date(2024, 5, 1);

    render(
      h(Calendar, {
        onSelect,
        defaultMonth: month,
        minDate: new Date(2024, 5, 10),
        maxDate: new Date(2024, 5, 20),
      })
    );

    expect(
      screen.getByRole('button', { name: new Date(2024, 5, 5).toDateString() })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: new Date(2024, 5, 15).toDateString() })
    ).toBeEnabled();
  });

  it('switches month and year views and navigates', () => {
    const onSelect = vi.fn();
    const { container } = render(h(Calendar, { onSelect, defaultMonth: new Date(2024, 5, 1) }));
    const root = container.firstElementChild as HTMLElement;

    fireEvent.click(within(root).getByText(monthLabel(5)));
    expect(within(root).getByText(monthLabel(6))).toBeInTheDocument();

    fireEvent.click(within(root).getByText(monthLabel(6)));
    expect(
      within(root).getByRole('button', { name: new Date(2024, 6, 1).toDateString() })
    ).toBeInTheDocument();

    fireEvent.click(within(root).getByText('2024'));
    expect(within(root).getByText('2025')).toBeInTheDocument();

    fireEvent.click(within(root).getByLabelText('Next'));
    expect(within(root).getByText('2037')).toBeInTheDocument();

    fireEvent.click(within(root).getByLabelText('Previous'));
    fireEvent.click(within(root).getByText('2025'));
    expect(within(root).getByText('2025')).toBeInTheDocument();
  });

  it('shifts months in days view and years in months view', () => {
    const onSelect = vi.fn();
    const { container } = render(h(Calendar, { onSelect, defaultMonth: new Date(2024, 5, 1) }));
    const root = container.firstElementChild as HTMLElement;

    fireEvent.click(within(root).getByLabelText('Next'));
    expect(within(root).getByText(monthLabel(6))).toBeInTheDocument();

    fireEvent.click(within(root).getByText(monthLabel(6)));
    fireEvent.click(within(root).getByLabelText('Next'));
    expect(within(root).getByText('2025')).toBeInTheDocument();
  });
});
