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

export default function Footer() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubscribe = (event) => {
    event.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setNotice("Please enter a valid email.");
      return;
    }

    setNotice("Thanks, got your mail. We will keep you posted.");
    setEmail("");
  };

  return (
    <footer
      className={`${sansFont.className} relative isolate overflow-hidden border-t border-black/10 bg-[#fdfdfd] px-4 pb-8 pt-8 text-[#123F5B] sm:px-6 md:px-10 md:pt-10`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,255,255,0.4),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.34),transparent_26%)]" />
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-black/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 border-b border-black/10 pb-8 text-[#557083] md:grid-cols-[1fr_auto_auto_1.2fr] md:items-start md:gap-10">
          <div className="text-sm font-semibold text-[#123F5B]">resumeX</div>

          <div className="space-y-1 text-sm font-medium">
            <a
              href="#home"
              className="block text-[#557083] transition hover:text-[#123F5B]"
            >
              Home
            </a>
            <a
              href="#premium-features"
              className="block text-[#557083] transition hover:text-[#123F5B]"
            >
              Premium Features
            </a>
            <a
              href="#faqs"
              className="block text-[#557083] transition hover:text-[#123F5B]"
            >
              FAQs
            </a>
            <a
              href="#cta"
              className="block text-[#557083] transition hover:text-[#123F5B]"
            >
              CTA
            </a>
            <a
              href="/privacy"
              className="block text-[#557083] transition hover:text-[#123F5B]"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="block text-[#557083] transition hover:text-[#123F5B]"
            >
              Terms
            </a>
          </div>

          <div className="space-y-1 text-sm font-medium">
            <a
              href="https://x.com/rjha72"
              className="block text-[#557083] transition hover:text-[#123F5B]"
            >
              Twitter
            </a>
            <a
              href="https://github.com/Rohan-2601/resumeX"
              className="block text-[#557083] transition hover:text-[#123F5B]"
            >
              Github
            </a>
            <a
              href="https://www.linkedin.com/in/rohan-raj-5b5198294/"
              className="block text-[#557083] transition hover:text-[#123F5B]"
            >
              LinkedIn
            </a>
          </div>

          <div className="max-w-md md:justify-self-end">
            <p className="text-sm font-medium text-[#557083]">
              Get occasional updates on all things.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="mt-3 flex items-center border border-black/10 bg-white/35 px-4 py-3"
            >
              <input
                type="email"
                placeholder="Email here"
                aria-label="Email for updates"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-transparent text-sm text-[#123F5B] placeholder:text-[#557083]/70 outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="pl-3 text-xl leading-none text-[#123F5B] transition hover:text-[#123F5B]/70"
              >
                →
              </button>
            </form>
            {notice && <p className="mt-2 text-xs text-[#557083]">{notice}</p>}
          </div>
        </div>

        <div className="relative mt-8 pb-2 pt-4">
          <div className="select-none text-center text-[3.8rem] font-semibold leading-none tracking-tight text-[#123F5B] sm:text-[6rem] md:text-[9.5rem] lg:text-[11rem]">
            resume
            <span
              className={`${displayFont.className} ml-2 italic text-[#123F5B]`}
            >
              X
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2 text-xs text-[#557083] sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} resumeX. Crafted for better first
            impressions.
          </p>
          <p className="text-[#123F5B] text-center md:text-left text-sm md:text-base">
            Keep one link. Update anytime.
          </p>
        </div>
      </div>
    </footer>
  );
}
