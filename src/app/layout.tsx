import type { Metadata } from 'next';
import './globals.css';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['400', '500'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CV Builder',
  description: 'Welcome to the CV Builder application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={roboto.className}>
      <body className="bg-background text-primary-text min-h-screen antialiased">{children}</body>
    </html>
  );
}
