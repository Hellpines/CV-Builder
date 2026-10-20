'use client';

import { useRouter } from 'next/navigation';
import { ErrorScreen } from '@/components/ui/error-screen';

export default function NotFound() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/users');
  };

  return (
    <ErrorScreen
      title="Hmm..."
      description={
        <>
          This doesn’t seem to be the page you were looking for.
          <br />
          Let’s get you back on track.
        </>
      }
      actionLabel="Go back"
      onAction={handleBack}
    />
  );
}
