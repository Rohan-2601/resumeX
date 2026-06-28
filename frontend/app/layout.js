import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: "resumeX | Permanent Resume Link & Analytics",
  description: "Stop sending outdated PDFs. Get one permanent resume link that's always updated, manage multiple resumes, and track exactly who views your profile.",
  icons: {
    icon: "/favicon-tight.png",
    shortcut: "/favicon-tight.png",
    apple: "/favicon-tight.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
        <SpeedInsights/>
      </body>
    </html>
  );
}
