import { useCallback, useSyncExternalStore } from 'react';
import {
  applyTheme,
  DEFAULT_THEME,
  getStoredTheme,
  storeTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from '@/shared/lib/theme';

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);

  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) callback();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getStoredTheme, () => DEFAULT_THEME);

  const setTheme = useCallback((next: Theme) => {
    storeTheme(next);
    applyTheme(next);
    listeners.forEach((listener) => listener());
  }, []);

  return { theme, setTheme };
}
