import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "resumeX | Smart Resume Management",
  description: "Version control and analytics for your resumes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
