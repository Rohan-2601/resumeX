import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  metadataBase: new URL('https://www.resumex.tech'),
  title: "resumeX | Create Your Resume Link",
  description: "Create a free resume link with ResumeX. Share your resume online with one URL and keep the same link whenever you update your resume.",
  keywords: ["resume link generator", "resume link", "free resume link generator", "online resume link generator", "create a resume link", "share resume online"],
  openGraph: {
    title: "resumeX | Create Your Resume Link",
    description: "Create a free resume link with ResumeX. Share your resume online with one URL and keep the same link whenever you update your resume.",
    url: "https://www.resumex.tech",
    siteName: "ResumeX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.resumex.tech/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ResumeX - Resume Link Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "resumeX | Create Your Resume Link",
    description: "Create a free resume link with ResumeX. Share your resume online with one URL and keep the same link whenever you update your resume.",
    images: ["https://www.resumex.tech/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.resumex.tech",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.resumex.tech/#organization",
      "name": "ResumeX",
      "url": "https://www.resumex.tech",
      "logo": "https://www.resumex.tech/favicon.webp"
    },
    {
      "@type": "WebSite",
      "@id": "https://www.resumex.tech/#website",
      "url": "https://www.resumex.tech",
      "name": "ResumeX",
      "description": "Resume link generator to host and share your resume online.",
      "publisher": {
        "@id": "https://www.resumex.tech/#organization"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.resumex.tech/#software",
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
    }
  ]
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
        <link rel="icon" href="/favicon.webp" />
        <link rel="apple-touch-icon" href="/favicon.webp" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-SF49D5HSZD"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SF49D5HSZD');
            `,
          }}
        />
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
