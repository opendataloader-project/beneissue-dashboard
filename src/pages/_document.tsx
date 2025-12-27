import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* Preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Instrument Sans for display headings - geometric, technical feel */}
        {/* Figtree for body text - clean, modern, excellent readability */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* Favicon and meta */}
        <meta name="theme-color" content="#0a0a14" />
      </Head>
      <body
        className="antialiased"
        style={{
          fontFamily: "'Figtree', system-ui, sans-serif",
        }}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
