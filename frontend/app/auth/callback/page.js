"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exchangeOAuthCode } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (!code) {
      setError("No authorization code provided");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    const exchangeCode = async () => {
      try {
        await exchangeOAuthCode(code);
        router.push("/dashboard");
      } catch (err) {
        console.error("Token exchange failed:", err);
        setError("Failed to authenticate. Please try again.");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    exchangeCode();
  }, [searchParams, exchangeOAuthCode, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow rounded-lg max-w-sm w-full text-center">
        {error ? (
          <div>
            <div className="text-red-500 mb-4">{error}</div>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Completing authentication...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
