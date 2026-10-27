import type { Metadata } from 'next';
import './globals.css';
import { Roboto } from 'next/font/google';
import Script from 'next/script';
import { ApolloProvider } from '@/components/providers/ApolloProvider';
import { ReactNode } from 'react';
import { AppGuard } from '@/components/providers/AppGuard';
import { ThemeSync } from '@/components/providers/ThemeSync';
import { Toaster } from '@/components/ui/toaster';
import { THEME_INIT_SCRIPT } from '@/shared/lib/theme';

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
    <html lang="en" suppressHydrationWarning className={roboto.className}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="bg-background text-primary-foreground min-h-screen antialiased">
        <ApolloProvider>
          <ThemeSync />
          <AppGuard>{children}</AppGuard>
          <Toaster />
        </ApolloProvider>
      </body>
    </html>
  );
}
