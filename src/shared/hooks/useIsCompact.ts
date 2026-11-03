import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 900px)';

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

const subscribeToClient = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false
  );
}

export function useIsCompact() {
  const isClient = useIsClient();
  const matches = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return isClient && matches;
}
