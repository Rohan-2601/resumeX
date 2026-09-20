import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  metadataBase: new URL('https://www.resumex.tech'),
  title: "Create a Resume Link That Never Changes | ResumeX",
  description: "Create a free resume link with ResumeX. Share your resume online with one URL and keep the same link when you update your resume.",
  keywords: ["resume link generator", "resume link", "free resume link", "online resume link", "create a resume link", "share resume online", "resume URL"],
  openGraph: {
    title: "Create a Resume Link That Never Changes | ResumeX",
    description: "Create a free resume link with ResumeX. Share your resume online with one URL and keep the same link when you update your resume.",
    url: "https://www.resumex.tech/",
    siteName: "ResumeX",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.resumex.tech/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ResumeX - Create a Resume Link",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create a Resume Link That Never Changes | ResumeX",
    description: "Create a free resume link with ResumeX. Share your resume online with one URL and keep the same link when you update your resume.",
    images: ["https://www.resumex.tech/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.resumex.tech/",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.resumex.tech/#organization",
      "name": "ResumeX",
      "url": "https://www.resumex.tech/",
      "logo": "https://www.resumex.tech/icon.png"
    },
    {
      "@type": "WebSite",
      "@id": "https://www.resumex.tech/#website",
      "url": "https://www.resumex.tech/",
      "name": "ResumeX",
      "description": "Create a free resume link with ResumeX. Share your resume online with one URL.",
      "publisher": {
        "@id": "https://www.resumex.tech/#organization"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.resumex.tech/#software",
      "name": "ResumeX",
      "url": "https://www.resumex.tech/",
      "description": "Create a permanent resume URL and share your resume online with a simple resume link.",
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
