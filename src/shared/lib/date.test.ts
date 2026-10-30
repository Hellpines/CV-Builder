import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatMonthYear,
  fullYearsBetween,
  isSameDay,
  parseDate,
  startOfDay,
  toISODate,
} from './date';

describe('startOfDay', () => {
  it('zeros time components', () => {
    const date = new Date(2024, 5, 15, 14, 30, 45);
    const result = startOfDay(date);

    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('isSameDay', () => {
  it('returns true for same calendar day', () => {
    expect(isSameDay(new Date(2024, 0, 1, 8), new Date(2024, 0, 1, 23))).toBe(true);
  });

  it('returns false for different days', () => {
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 2))).toBe(false);
  });
});

describe('parseDate', () => {
  it('returns null for empty values', () => {
    expect(parseDate()).toBeNull();
    expect(parseDate(null)).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate('   ')).toBeNull();
  });

  it('parses unix seconds', () => {
    const date = parseDate('1704067200');
    expect(date).not.toBeNull();
    expect(date!.getFullYear()).toBe(2024);
    expect(date!.getMonth()).toBe(0);
    expect(date!.getDate()).toBe(1);
  });

  it('parses unix milliseconds', () => {
    const date = parseDate('1704067200000');
    expect(date).not.toBeNull();
    expect(toISODate(date)).toBe('2024-01-01');
  });

  it('parses ISO date prefix', () => {
    expect(toISODate(parseDate('2024-06-15T12:00:00Z'))).toBe('2024-06-15');
  });

  it('returns null for invalid strings', () => {
    expect(parseDate('not-a-date')).toBeNull();
  });
});

describe('toISODate / formatDate / formatMonthYear', () => {
  it('formats dates and handles null', () => {
    const date = new Date(2024, 0, 5);

    expect(toISODate(date)).toBe('2024-01-05');
    expect(formatDate(date)).toBe('01/05/2024');
    expect(formatMonthYear(date)).toBe('01.2024');

    expect(toISODate(null)).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatMonthYear(null)).toBe('');
  });
});

describe('fullYearsBetween', () => {
  it('counts full years', () => {
    expect(fullYearsBetween(new Date(2020, 0, 1), new Date(2024, 0, 1))).toBe(4);
  });

  it('subtracts incomplete year before anniversary', () => {
    expect(fullYearsBetween(new Date(2020, 5, 15), new Date(2024, 5, 14))).toBe(3);
  });

  it('does not return negative years', () => {
    expect(fullYearsBetween(new Date(2024, 0, 1), new Date(2020, 0, 1))).toBe(0);
  });
});
