"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";


function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exchangeOAuthCode } = useAuth();
  const hasExchanged = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (!code) {
      router.replace("/login?error=No+authorization+code+provided");
      return;
    }

    if (hasExchanged.current) return;
    hasExchanged.current = true;

    const exchangeCode = async () => {
      try {
        await exchangeOAuthCode(code);
        router.push("/dashboard");
      } catch (err) {
        console.error("Token exchange failed:", err);
        router.replace("/login?error=Failed+to+authenticate.+Please+try+again.");
      }
    };

    exchangeCode();
  }, [searchParams, exchangeOAuthCode, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3f4f6]">
      <div className="flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-5 w-5 text-[#71717a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm font-medium text-[#71717a] animate-pulse">
          Signing you in...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-pulse flex items-center text-sm font-medium text-[#71717a]">
          Loading...
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
