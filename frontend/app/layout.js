import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "resumeX | Smart Resume Management",
  description: "Version control and analytics for your resumes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
