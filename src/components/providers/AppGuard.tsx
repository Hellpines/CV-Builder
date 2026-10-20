'use client';

import type { ReactNode } from 'react';
import { ErrorScreen } from '@/components/ui/error-screen';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';

export function AppGuard({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const isOnline = useOnlineStatus();

  let screen: ReactNode = null;

  if (isMobile) {
    screen = (
      <ErrorScreen
        title="Oops"
        description={
          <>
            This app isn’t supported on mobile devices.
            <br />
            Please open it on a desktop or tablet to continue.
          </>
        }
      />
    );
  } else if (!isOnline) {
    screen = (
      <ErrorScreen
        title="Oops"
        description={
          <>
            No internet connection.
            <br />
            Please check your network and try again.
          </>
        }
        actionLabel="Retry"
        onAction={() => {
          if (navigator.onLine) window.location.reload();
        }}
      />
    );
  }

  return (
    <>
      {children}
      {screen ? (
        <div className="bg-background fixed inset-0 z-100 overflow-auto">{screen}</div>
      ) : null}
    </>
  );
}
