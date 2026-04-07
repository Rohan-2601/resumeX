"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { user, loading, login, logout } = useAuth();

  const handleLogin = () => {
    setIsRedirecting(true);
    login();
  };

  if (loading || isRedirecting) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
        <p>
          {isRedirecting ? "Redirecting to GitHub..." : "Checking session..."}
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <>
        <p>Logged in as: {user.email || user.username || "User"}</p>
        <button onClick={logout}>Logout</button>
      </>
    );
  }

  return (
    <button onClick={handleLogin} disabled={isRedirecting}>
      {isRedirecting ? "Redirecting..." : "Login with GitHub"}
    </button>
  );
}
