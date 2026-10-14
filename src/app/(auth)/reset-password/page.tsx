import { Suspense } from 'react';
import { ResetForm } from '@/features/auth/ui/ResetForm';
import { Loader2 } from 'lucide-react';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 />
        </div>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
