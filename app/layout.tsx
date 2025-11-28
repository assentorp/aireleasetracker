import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Model Release Tracker | Complete Timeline 2022-2025",
  description: "Track major AI model releases from OpenAI, Anthropic, Google, Meta, xAI, DeepSeek, and Mistral. Interactive timeline showing GPT, Claude, Gemini, LLaMA releases since ChatGPT launch in November 2022.",
  keywords: [
    "AI models",
    "ChatGPT timeline",
    "GPT releases",
    "Claude AI",
    "Anthropic releases",
    "OpenAI models",
    "Google Gemini",
    "Meta LLaMA",
    "AI release tracker",
    "large language models",
    "LLM timeline",
    "AI model history",
    "GPT-4",
    "Claude Opus",
    "Gemini Pro",
    "DeepSeek",
    "Mistral AI",
    "xAI Grok"
  ],
  authors: [{ name: "AI Release Tracker" }],
  creator: "AI Release Tracker",
  publisher: "AI Release Tracker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://aireleasetracker.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "AI Model Release Tracker | Complete Timeline 2022-2025",
    description: "Track major AI model releases from OpenAI, Anthropic, Google, Meta, xAI, DeepSeek, and Mistral. Interactive timeline since ChatGPT launch.",
    url: 'https://aireleasetracker.com',
    siteName: "AI Release Tracker",
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // Add an og-image.png to your public folder
        width: 1200,
        height: 630,
        alt: 'AI Model Release Timeline',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI Model Release Tracker | Complete Timeline 2022-2025",
    description: "Track major AI model releases from OpenAI, Anthropic, Google, Meta, xAI, DeepSeek, and Mistral.",
    images: ['/og-image.png'], // Add an og-image.png to your public folder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Model Release Tracker',
    description: 'Interactive timeline tracking major AI model releases from OpenAI, Anthropic, Google, Meta, xAI, DeepSeek, and Mistral since November 2022.',
    url: 'https://aireleasetracker.com',
    applicationCategory: 'UtilityApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
  };

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0A0A0A" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#0A0A0A] text-white m-0">
        {children}
      </body>
    </html>
  );
}
