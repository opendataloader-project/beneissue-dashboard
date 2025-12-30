import type { Metadata, Viewport } from "next";
import { Figtree, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "@/styles/globals.css";

import { RootLayout } from "@/components/layout/root-layout";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beneissue - AI Issue Automation",
  description:
    "AI-powered issue automation that saves time and money. Track real-time metrics and ROI.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a14",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${figtree.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-sans">
        <NuqsAdapter>
          <RootLayout>{children}</RootLayout>
        </NuqsAdapter>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
