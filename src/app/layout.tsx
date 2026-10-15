import type { Metadata } from 'next';
import './globals.css';
import { Roboto } from 'next/font/google';
import { ApolloProvider } from '@/components/providers/ApolloProvider';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const roboto = Roboto({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CV Builder',
  description: 'Welcome to the CV Builder application',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={roboto.className}>
      <body className="bg-background text-primary-foreground min-h-screen antialiased">
        <ApolloProvider>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
              </div>
            }
          >
            {children}
          </Suspense>
        </ApolloProvider>
      </body>
    </html>
  );
}
