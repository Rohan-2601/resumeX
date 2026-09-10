"use client";

import Link from "next/link";
import { Playfair_Display, Sora } from "next/font/google";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500", "600"],
});

const sansFont = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function NotFound() {
  return (
    <div
      className={`${sansFont.className} flex min-h-[100dvh] flex-col items-center justify-center bg-[#fafafa] text-[#0A2540]`}
    >
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6 py-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Resume Not Found</h1>
          <p className="mt-2 max-w-md text-[#4B5E76]">
            The resume you are looking for does not exist, has been deleted, or is temporarily unavailable.
          </p>
        </div>

        <Link
          href="/"
          className="mt-4 rounded-xl bg-[#0A2540] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#111827] active:scale-95"
        >
          Go to ResumeX
        </Link>
      </div>
    </div>
  );
}
