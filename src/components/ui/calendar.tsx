'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from 'cn';
import { isSameDay, startOfDay } from '@/shared/lib/date';
import { Button } from './button';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const YEARS_PER_PAGE = 12;

type View = 'days' | 'months' | 'years';

interface CalendarProps {
  value?: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date | null;
  maxDate?: Date | null;
  defaultMonth?: Date | null;
}

export function Calendar({ value, onSelect, minDate, maxDate, defaultMonth }: CalendarProps) {
  const initial = value ?? defaultMonth ?? new Date();

  const [view, setView] = useState<View>('days');
  const [cursor, setCursor] = useState(
    () => new Date(initial.getFullYear(), initial.getMonth(), 1)
  );
  const [yearStart, setYearStart] = useState(() => initial.getFullYear() - 3);

  const min = minDate ? startOfDay(minDate).getTime() : null;
  const max = maxDate ? startOfDay(maxDate).getTime() : null;

  const isOutOfRange = (first: Date, last: Date) =>
    (min !== null && last.getTime() < min) || (max !== null && first.getTime() > max);

  const isDayDisabled = (day: Date) => isOutOfRange(day, day);
  const isMonthDisabled = (year: number, month: number) =>
    isOutOfRange(new Date(year, month, 1), new Date(year, month + 1, 0));
  const isYearDisabled = (year: number) =>
    isOutOfRange(new Date(year, 0, 1), new Date(year, 11, 31));

  const shift = (direction: 1 | -1) => {
    if (view === 'days') {
      setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    } else if (view === 'months') {
      setCursor((prev) => new Date(prev.getFullYear() + direction, prev.getMonth(), 1));
    } else {
      setYearStart((prev) => prev + direction * YEARS_PER_PAGE);
    }
  };

  const toggleView = (target: 'months' | 'years') => {
    if (target === 'years') setYearStart(cursor.getFullYear() - 3);
    setView((prev) => (prev === target ? 'days' : target));
  };

  const days = Array.from(
    { length: 42 },
    (_, index) => new Date(cursor.getFullYear(), cursor.getMonth(), 1 - cursor.getDay() + index)
  );

  const cellClass = (selected: boolean, disabled: boolean) =>
    cn(
      'flex h-10 items-center justify-center rounded-full text-sm transition-colors outline-none',
      'focus-visible:ring-primary focus-visible:ring-2',
      selected
        ? 'bg-primary text-secondary'
        : disabled
          ? 'text-muted cursor-not-allowed'
          : 'text-foreground hover:bg-primary-hover cursor-pointer'
    );

  return (
    <div className="align-center flex h-85 w-110 flex-col">
      <div className="mb-4 ml-10 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => toggleView('months')}
            className={cn(
              'cursor-pointer outline-none focus-visible:underline',
              view === 'months' ? 'text-primary' : 'text-foreground'
            )}
          >
            {MONTHS[cursor.getMonth()]}
          </button>
          <button
            type="button"
            onClick={() => toggleView('years')}
            className={cn(
              'cursor-pointer outline-none focus-visible:underline',
              view === 'years' ? 'text-primary' : 'text-foreground'
            )}
          >
            {cursor.getFullYear()}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="icon" onClick={() => shift(-1)} aria-label="Previous">
            <ChevronLeft size={16} />
          </Button>
          <Button variant="icon" onClick={() => shift(1)} aria-label="Next">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {view === 'days' && (
        <div>
          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((weekday, index) => (
              <span
                key={index}
                className="text-foreground flex h-8 items-center justify-center text-xs font-medium"
              >
                {weekday}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day) => {
              const selected = Boolean(value && isSameDay(day, value));
              const disabled = isDayDisabled(day);
              const outside = day.getMonth() !== cursor.getMonth();

              return (
                <button
                  key={day.getTime()}
                  type="button"
                  disabled={disabled}
                  aria-label={day.toDateString()}
                  aria-pressed={selected}
                  onClick={() => {
                    setCursor(new Date(day.getFullYear(), day.getMonth(), 1));
                    onSelect(day);
                  }}
                  className={cn(
                    cellClass(selected, disabled),
                    'mx-auto w-10',
                    outside && !selected && 'text-muted',
                    disabled && 'line-through'
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === 'months' && (
        <div className="grid grid-cols-3 gap-y-2 pt-2">
          {MONTHS.map((month, index) => {
            const selected = index === cursor.getMonth();
            const disabled = isMonthDisabled(cursor.getFullYear(), index);

            return (
              <button
                key={month}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setCursor(new Date(cursor.getFullYear(), index, 1));
                  setView('days');
                }}
                className={cellClass(selected, disabled)}
              >
                {month}
              </button>
            );
          })}
        </div>
      )}

      {view === 'years' && (
        <div className="grid grid-cols-3 gap-y-2 pt-2">
          {Array.from({ length: YEARS_PER_PAGE }, (_, index) => yearStart + index).map((year) => {
            const selected = year === cursor.getFullYear();
            const disabled = isYearDisabled(year);

            return (
              <button
                key={year}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setCursor(new Date(year, cursor.getMonth(), 1));
                  setView('days');
                }}
                className={cellClass(selected, disabled)}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
