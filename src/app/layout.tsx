import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dance Count Metronome',
  description: 'Set your BPM and count along with a dance metronome — One through Eight, with optional "And" counts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
