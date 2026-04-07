"use client";

import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../context/AuthContext";

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
      className={`${sansFont.className} relative overflow-hidden bg-[#e9e1d0] px-4 py-24 text-[#1f1b16] sm:px-6 md:px-10 md:py-28`}
    >
      <div
        className="relative mx-auto max-w-6xl"
        style={{ animation: "fadeInUp 0.82s ease-out both" }}
      >
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
              One link for your resume that always stays updated, no matter
              where you have shared it. Track every view, know where it is
              coming from, and never lose opportunities to outdated versions.
            </p>

            <div className="mt-9 flex items-center gap-5">
              <button
                onClick={login}
                className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-[#241c16] px-7 py-3 text-sm font-semibold text-[#f6ebd7] shadow-[0_18px_36px_-20px_rgba(0,0,0,0.88)] transition duration-300 hover:bg-[#17110c] hover:text-[#fbf4e3] sm:px-8 sm:py-4 sm:text-base"
              >
                Create My Resume Link
              </button>
              <a
                href="#faqs"
                className="text-sm font-semibold text-[#6d543f] transition hover:text-[#211911]"
              >
                Read FAQs first
              </a>
              <div className="hidden h-px flex-1 bg-[#7b5a3d]/35 md:block" />
            </div>
          </div>

          <div className="relative">
            <div className="space-y-5">
              <div className="h-px w-full bg-[#7b5a3d]/45" />
              <p className="text-right text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Link once
              </p>
              <p className="text-right text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Update anytime
              </p>
              <p className="text-right text-xs font-semibold uppercase tracking-[0.28em] text-[#7b5a3d]">
                Track everything
              </p>
              <div className="h-px w-full bg-[#7b5a3d]/45" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
