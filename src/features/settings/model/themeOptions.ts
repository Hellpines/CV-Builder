import type { Theme } from '@/shared/lib/theme';

export const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Device settings' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];
