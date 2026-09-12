import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  metadataBase: new URL('https://www.resumex.tech'),
  title: "Resume Link Generator | ResumeX",
  description: "Create and share your resume online with the ultimate resume link generator. Stop sending outdated PDFs. Get a permanent resume URL and track your analytics.",
  keywords: ["resume link generator", "resume URL generator", "create resume link", "share resume online", "online resume hosting", "resume tracker"],
  openGraph: {
    title: "Resume Link Generator | ResumeX",
    description: "Create and share your resume online with the ultimate resume link generator. Get a permanent resume URL and track your analytics.",
    url: "https://www.resumex.tech",
    siteName: "ResumeX",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Link Generator | ResumeX",
    description: "Create and share your resume online with the ultimate resume link generator. Get a permanent resume URL and track your analytics.",
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
