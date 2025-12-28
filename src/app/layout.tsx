import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { RootLayout } from '@/components/layout/root-layout';

export const metadata: Metadata = {
  title: 'Beneissue - AI Issue Automation',
  description: 'AI-powered issue automation that saves time and money. Track real-time metrics and ROI.',
};

export const viewport: Viewport = {
  themeColor: '#0a0a14',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Instrument Sans for display headings - geometric, technical feel */}
        {/* Figtree for body text - clean, modern, excellent readability */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{
          fontFamily: "'Figtree', system-ui, sans-serif",
        }}
      >
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
