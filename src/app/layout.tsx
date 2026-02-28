import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';
import { DiscreetAds } from '@/components/DiscreetAds';
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maths-App.com - L'entraînement au calcul mental",
  description: "Améliore tes capacités de calcul mental avec un système adaptatif, pédagogique et gamifié. Deviens le maître des maths !",
  metadataBase: new URL('https://maths-app.com'),
  openGraph: {
    title: "Maths-App.com - L'entraînement au calcul mental",
    description: "Améliore tes capacités de calcul mental avec un système adaptatif, pédagogique et gamifié. Deviens le maître des maths !",
    url: 'https://maths-app.com',
    siteName: 'Maths-App.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maths-App.com - Entraînement au calcul mental',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Maths-App.com - L'entraînement au calcul mental",
    description: "Améliore tes capacités de calcul mental avec un système adaptatif, pédagogique et gamifié. Deviens le maître des maths !",
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://maths-app.com" />
        <meta name="google-adsense-account" content="ca-pub-5606384371601059" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5606384371601059"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning={true}>
        <ClientProviders>
          <DiscreetAds />
          {children}
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}
