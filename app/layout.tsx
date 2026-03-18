import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Revenue Reactivation Agent MVP',
  description: 'Prototype for surfacing dormant high-fit leads and generating personalised next steps.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
