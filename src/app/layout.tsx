import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../styles/print-a4.css";
import { ClientProviders } from "@/components/providers/client-providers";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: "ACGE - Agence Comptable des Grandes Écoles",
  description: "Application moderne de gestion comptable des grandes écoles",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/outfit/OutfitVariableFont_wght1.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/outfit/OutfitRegular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/freemono/FreeMono.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-outfit">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <ClientProviders>
              {children}
            </ClientProviders>
          </LoadingProvider>
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
