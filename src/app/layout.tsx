import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CV Builder',
  description: 'Welcome to the CV Builder application',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
