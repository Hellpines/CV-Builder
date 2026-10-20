'use client';

import { useEffect } from 'react';
import { ErrorScreen } from '@/components/ui/error-screen';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      title="Oops"
      description={
        <>
          Something went wrong. We’re already working on fixing it.
          <br />
          Please try again or go back.
        </>
      }
      actionLabel="Retry"
      onAction={reset}
    />
  );
}
