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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#fafafa] px-4 selection:bg-[#0A2540] selection:text-white relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center justify-center">
        <div className="mb-10">
          <span className="flex items-end text-4xl font-bold tracking-tight leading-none text-[#0A2540]">
            resume
            <span className="text-[#0A2540] drop-shadow-sm ml-0.5">
              X
            </span>
          </span>
        </div>

        <div className="animate-in fade-in zoom-in-95 duration-500 w-full flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#71717a] mb-2">
              Signing you in
            </p>
            <div className="relative my-8 flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-[#0A2540]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm font-medium text-[#18181b]">
              Securely completing authentication...
            </p>
          </div>
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
