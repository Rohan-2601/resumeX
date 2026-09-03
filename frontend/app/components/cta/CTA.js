"use client";

import { Syne, Outfit } from "next/font/google";
import { useAuth } from "../../context/AuthContext";

const headingFont = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function CTA() {
  const { login } = useAuth();

  return (
    <section
      id="cta"
      className={`${bodyFont.className} relative overflow-hidden bg-[#fdfdfd] px-4 py-24 text-[#123F5B] sm:px-6 md:px-10 md:py-28`}
    >
      <div
        className="relative mx-auto max-w-6xl"
        style={{ animation: "fadeInUp 0.82s ease-out both" }}
      >
        <div className="grid grid-cols-1 items-center gap-12 py-6 md:grid-cols-[minmax(0,1fr)_280px] md:gap-14 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#557083]">
              Ready When You Are
            </p>

            <h2 className={`${headingFont.className} text-balance text-3xl font-bold leading-[1.03] tracking-tighter text-[#123F5B] sm:text-5xl md:text-6xl`}>
              Your Resume Deserves
              <span
                className="ml-3 inline-block text-[#123F5B]"
              >
                Better Than a PDF
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#557083] md:text-lg md:leading-8">
              One link for your resume that always stays updated, no matter
              where you have shared it. Track every view, know where it is
              coming from, and never lose opportunities to outdated versions.
            </p>

            <div className="mt-9 flex items-center gap-5">
              <button
                onClick={login}
                className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-[#123F5B] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(0,0,0,0.88)] transition duration-300 hover:bg-[#0d2d42] sm:px-8 sm:py-4 sm:text-base"
              >
                Create My Resume Link
              </button>
              <a
                href="#faqs"
                className="relative text-sm font-semibold text-[#557083] transition-colors hover:text-[#123F5B] after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full after:origin-center after:scale-x-0 after:bg-[#123F5B] after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Read FAQs first
              </a>
              <div className="hidden h-px flex-1 bg-[#557083]/20 md:block" />
            </div>
          </div>

          <div className="relative">
            <div className="group space-y-5 cursor-default">
              <div className="h-px w-full bg-[#557083]/20 transition-colors duration-500 group-hover:bg-[#557083]/50" />
              <p className="text-right text-xs font-bold uppercase tracking-[0.28em] text-[#557083] transition-all duration-300 group-hover:-translate-x-1 group-hover:text-[#123F5B]">
                Link once
              </p>
              <p className="text-right text-xs font-bold uppercase tracking-[0.28em] text-[#557083] transition-all duration-300 delay-75 group-hover:-translate-x-1 group-hover:text-[#123F5B]">
                Update anytime
              </p>
              <p className="text-right text-xs font-bold uppercase tracking-[0.28em] text-[#557083] transition-all duration-300 delay-150 group-hover:-translate-x-1 group-hover:text-[#123F5B]">
                Track everything
              </p>
              <div className="h-px w-full bg-[#557083]/20 transition-colors duration-500 group-hover:bg-[#557083]/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
