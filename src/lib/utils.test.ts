import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins string class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('skips falsy values and applies object keys', () => {
    expect(cn('base', false && 'hidden', { active: true, disabled: false })).toBe('base active');
  });

  it('merges conflicting tailwind utilities', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
