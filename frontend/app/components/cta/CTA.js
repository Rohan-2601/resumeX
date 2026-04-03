"use client";

import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../context/AuthContext";
import { GitHubIcon } from "../icons/Icons";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500", "600"],
});

const sansFont = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function CTA() {
  const { login } = useAuth();

  return (
    <section
      id="cta"
      className={`${sansFont.className} relative overflow-hidden bg-[#e6ddca] px-4 py-24 text-[#1f1b16] sm:px-6 md:px-10 md:py-28`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-12%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.14)_34%,transparent_74%)] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.28),transparent_24%),radial-gradient(circle_at_80%_6%,rgba(123,90,61,0.14),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(17,18,20,0.06),transparent_28%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 py-6 md:grid-cols-[minmax(0,1fr)_280px] md:gap-14 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#7b5a3d]">
              Ready When You Are
            </p>

            <h2 className="text-balance text-3xl font-medium leading-[1.03] tracking-tight text-[#211911] sm:text-5xl md:text-6xl">
              Your Resume Deserves 
              <span
                className={`${displayFont.className} ml-3 inline-block italic text-[#8a6340]`}
              >
            Better Than a PDF
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#5f5144] md:text-lg md:leading-8">
              One link for your resume that always stays updated —no matter where you’ve shared it.
Track every view, know where it’s coming from, and never lose opportunities to outdated versions again.
            </p>

            <div className="mt-9 flex items-center gap-5">
              <button
                onClick={login}
                className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-[#241c16] px-7 py-3 text-sm font-semibold text-[#f6ebd7] shadow-[0_18px_36px_-20px_rgba(0,0,0,0.88)] transition duration-300 hover:bg-[#17110c] hover:text-[#fbf4e3] sm:px-8 sm:py-4 sm:text-base"
              >
                Create My Resume Link
              </button>
              <div className="hidden h-px flex-1 bg-gradient-to-r from-[#7b5a3d]/35 to-transparent md:block" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(123,90,61,0.16)_0%,rgba(123,90,61,0.05)_42%,transparent_74%)] blur-3xl" />
            <div className="space-y-5">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#7b5a3d]/45 to-transparent" />
              <p className="text-right text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Link once
              </p>
              <p className="text-right text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Update anytime
              </p>
              <p className="text-right text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Track everything
              </p>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#7b5a3d]/45 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
