import type { Metadata } from 'next';
import './globals.css';
import { Roboto } from 'next/font/google';
import { ApolloProvider } from '@/components/providers/ApolloProvider';
import { ReactNode } from 'react';
import { AppGuard } from '@/components/providers/AppGuard';
import { Toaster } from '@/components/ui/toaster';

const roboto = Roboto({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CV Builder',
  description: 'Welcome to the CV Builder application',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={roboto.className}>
      <body className="bg-background text-primary-foreground min-h-screen antialiased">
        <ApolloProvider>
          <AppGuard>{children}</AppGuard>
          <Toaster />
        </ApolloProvider>
      </body>
    </html>
  );
}
