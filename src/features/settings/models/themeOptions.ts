import type { Theme } from '@/shared/lib/theme';

export const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'system', label: 'common.deviceSettings' },
  { value: 'dark', label: 'common.dark' },
  { value: 'light', label: 'common.light' },
];
