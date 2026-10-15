import { Loader2 } from 'lucide-react';

export function AuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="text-primary h-18 w-18 animate-spin" />
    </div>
  );
}
