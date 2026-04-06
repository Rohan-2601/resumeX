"use client";

import { useState } from "react";
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

const FAQ_ITEMS = [
  {
    question: "How is resumeX different from sending a PDF?",
    answer:
      "With resumeX, you share one permanent link. Whenever you upload a better version, that same link always serves your latest resume, so recruiters never open an outdated file.",
  },
  {
    question: "Can I keep multiple resumes for different roles?",
    answer:
      "Yes. You can create role-specific resumes, keep separate slugs, and maintain version history for each one. This helps you tailor applications without losing previous versions.",
  },
  {
    question: "Will I know who viewed my resume link?",
    answer:
      "You can track views and basic traffic sources (for example LinkedIn, GitHub, or direct). It gives you clearer feedback after you share your resume.",
  },
  {
    question: "Do I need to resend links after every update?",
    answer:
      "No. That is the main advantage. You update the file once in your dashboard and every place you have shared your link automatically reflects the newest version.",
  },
  {
    question: "Can I use a custom slug in the public URL?",
    answer:
      "Yes. You can create clean URLs like /username/frontend-engineer or /username/product-resume, making your link easier to remember and more professional to share.",
  },
  {
    question: "Is resumeX free to start?",
    answer:
      "Yes, you can start using resumeX right away. The current setup is focused on helping you publish and manage your resume links with minimal friction.",
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="faqs"
      className={`${sansFont.className} relative overflow-hidden bg-[#e4dac6] px-4 py-24 text-[#1f1b16] sm:px-6 md:px-10 md:py-28`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.35),transparent_24%),radial-gradient(circle_at_82%_10%,rgba(123,90,61,0.14),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(17,18,20,0.06),transparent_28%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/12 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[0.95fr_1.05fr] md:gap-12 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7b5a3d]">
              FAQs
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.04] tracking-tight text-[#211911] sm:text-5xl md:text-6xl">
              Answers Before
              <span
                className={`${displayFont.className} ml-3 inline-block italic text-[#8a6340]`}
              >
                You Ask
              </span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#5f5144] sm:text-base sm:leading-8">
              Everything you need to know before sharing your resume link with
              recruiters, hiring managers, or your network.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={item.question}
                  className={`overflow-hidden rounded-2xl border transition ${
                    isOpen
                      ? "border-[#8a6340]/35 bg-[linear-gradient(180deg,rgba(251,247,238,0.94)_0%,rgba(242,233,218,0.9)_100%)] shadow-[0_16px_40px_-28px_rgba(0,0,0,0.45)]"
                      : "border-black/10 bg-white/45"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  >
                    <span className="text-sm font-semibold text-[#241c16] sm:text-base">
                      {item.question}
                    </span>
                    <span
                      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 text-base leading-none text-[#6f5a47] transition ${
                        isOpen ? "rotate-45 bg-white/70" : "bg-white/45"
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen ? (
                    <div className="px-5 pb-5 text-sm leading-7 text-[#5f5144] sm:px-6 sm:text-[0.97rem]">
                      {item.answer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
