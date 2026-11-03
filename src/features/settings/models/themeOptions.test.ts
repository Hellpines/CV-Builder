import { describe, expect, it } from 'vitest';
import { THEME_OPTIONS } from './themeOptions';

describe('THEME_OPTIONS', () => {
  it('lists system, dark, and light with i18n keys', () => {
    expect(THEME_OPTIONS).toEqual([
      { value: 'system', label: 'common.deviceSettings' },
      { value: 'dark', label: 'common.dark' },
      { value: 'light', label: 'common.light' },
    ]);
  });
});
