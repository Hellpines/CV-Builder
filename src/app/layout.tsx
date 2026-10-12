import type { Metadata } from 'next';
import './globals.css';
import { Roboto, Geist } from 'next/font/google';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const roboto = Roboto({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CV Builder',
  description: 'Welcome to the CV Builder application',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={cn(roboto.className, 'font-sans', geist.variable)}>
      <body className="bg-primary-light text-primary-text flex min-h-screen max-w-360">
        <Sidebar />

        <main className="flex-1 p-8">{children}</main>
      </body>
    </html>
  );
}
