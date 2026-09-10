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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {error && (
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <p className="text-sm mt-2 text-gray-500">Redirecting to login...</p>
        </div>
      )}
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
