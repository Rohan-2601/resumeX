import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  metadataBase: new URL('https://www.resumex.tech'),
  title: "resumeX",
  description: "Create and share your resume online with resumeX.",
  keywords: ["resume link generator", "resume URL generator", "create resume link", "share resume online", "online resume hosting", "resume tracker"],
  openGraph: {
    title: "resumeX",
    description: "Create and share your resume online with resumeX.",
    url: "https://www.resumex.tech",
    siteName: "resumeX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.resumex.tech/og-image.webp",
        width: 1200,
        height: 630,
        alt: "resumeX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "resumeX",
    description: "Create and share your resume online with resumeX.",
    images: ["https://www.resumex.tech/og-image.webp"],
  },
  alternates: {
    canonical: "https://www.resumex.tech",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ResumeX",
  "url": "https://www.resumex.tech",
  "description": "The ultimate resume link generator. Create a permanent resume URL and share your resume online with real-time analytics.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

import { Geist } from "next/font/google";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="icon" href="/favicon-tight.png" />
        <link rel="apple-touch-icon" href="/favicon-tight.png" />
      </head>
      <body className={`${geistSans.variable} ${geistSans.className} antialiased`}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights/>
      </body>
    </html>
  );
}
