import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
        url: '/ogimage.png',
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
    images: ['/ogimage.png'],
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
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        elements: {
          formButtonPrimary: 'bg-white text-black hover:bg-gray-200',
          card: 'bg-[#151515] border border-white/10',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton: 'bg-white/10 border border-white/20 text-white hover:bg-white/15',
          formFieldLabel: 'text-gray-300',
          formFieldInput: 'bg-white/5 border border-white/20 text-white',
          footerActionText: 'text-gray-400',
          footerActionLink: 'text-white hover:text-gray-300',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-gray-300',
          userButtonPopoverCard: 'bg-[#151515] border border-white/20',
          userButtonPopoverActionButton: 'text-white hover:bg-white/10',
          userButtonPopoverActionButton__manageAccount: 'text-white hover:text-white',
          userButtonPopoverActionButton__signOut: 'text-white hover:text-white',
          userButtonPopoverActionButtonText: 'text-white hover:text-white',
          userButtonPopoverActionButtonIcon: 'text-gray-400',
          userButtonPopoverFooter: 'hidden',
        },
        variables: {
          colorBackground: '#151515',
          colorText: '#ffffff',
          colorPrimary: '#ffffff',
          colorTextSecondary: '#9ca3af',
          colorTextOnPrimaryBackground: '#ffffff',
          colorDanger: '#ffffff',
          colorShimmer: '#ffffff',
        },
        layout: {
          socialButtonsPlacement: 'bottom',
          socialButtonsVariant: 'blockButton',
        },
      }}
      localization={{
        signUp: {
          start: {
            title: 'Sign up to receive updates',
            subtitle: 'Get notified about new AI model releases',
          },
        },
      }}
    >
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <meta name="theme-color" content="#0A0A0A" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
    </ClerkProvider>
  );
}
