import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';
import { DiscreetAds } from '@/components/DiscreetAds';
import CookieBanner from '@/components/CookieBanner';
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
  // JSON-LD structured data for Google SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Maths-App.com',
    description: 'Entraînement au calcul mental avec système adaptatif et gamifié',
    url: 'https://maths-app.com',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    author: {
      '@type': 'Organization',
      name: 'Maths-App.com',
      url: 'https://maths-app.com',
    },
  };

  // Google Analytics IDs - .com: G-2ZFLNCSYLF, .fr: G-KYRWPP3PG8
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-2ZFLNCSYLF';

  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://maths-app.com" />
        <meta name="google-site-verification" content="g2vjPj5n1HoikGZoKbQOhw71sHveNXrDiNCRMy7ORF8" />
        <meta name="google-adsense-account" content="ca-pub-5606384371601059" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5606384371601059"
          crossOrigin="anonymous"
          strategy="afterInteractive"
          data-nscript="afterInteractive"
        />
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning={true}>
        <ClientProviders>
          <DiscreetAds />
          {children}
        </ClientProviders>
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
