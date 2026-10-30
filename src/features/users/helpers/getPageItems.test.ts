import { describe, expect, it } from 'vitest';
import { getPageItems } from './getPageItems';

describe('getPageItems', () => {
  it('returns a single page', () => {
    expect(getPageItems(1, 1)).toEqual([1]);
  });

  it('keeps nearby pages without ellipsis', () => {
    expect(getPageItems(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('fills a single skipped page instead of ellipsis', () => {
    expect(getPageItems(1, 3)).toEqual([1, 2, 3]);
    expect(getPageItems(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it('inserts ellipsis for larger gaps', () => {
    expect(getPageItems(5, 10)).toEqual([1, 'ellipsis-4', 4, 5, 6, 'ellipsis-10', 10]);
  });

  it('clamps window to valid range at edges', () => {
    expect(getPageItems(1, 10)).toEqual([1, 2, 'ellipsis-10', 10]);
    expect(getPageItems(10, 10)).toEqual([1, 'ellipsis-9', 9, 10]);
  });
});
