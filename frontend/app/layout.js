

import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "resumeX",
  description: "Resume management app",
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
