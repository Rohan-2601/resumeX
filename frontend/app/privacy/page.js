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

export const metadata = {
  title: "Privacy Policy | resumeX",
  description:
    "Learn what data resumeX collects, why it is collected, and how it is used to power resume links and analytics.",
};

export default function PrivacyPage() {
  return (
    <main
      className={`${sansFont.className} min-h-screen bg-[#e9e1d0] px-4 py-14 text-[#1f1b16] sm:px-6 md:px-10`}
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7b5a3d]">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#211911] sm:text-5xl">
          Privacy
          <span
            className={`${displayFont.className} ml-3 italic text-[#8a6340]`}
          >
            Policy
          </span>
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#5f5144] sm:text-base sm:leading-8">
          This page explains what information resumeX stores and why. Our goal
          is simple: give you a permanent resume link, version control, and
          useful view insights while collecting only the data needed to run the
          product.
        </p>


        <section className="mt-8 space-y-6 text-sm leading-7 text-[#5f5144] sm:text-base sm:leading-8">
          <div>
            <h3 className="text-lg font-semibold text-[#211911]">
              Data we collect
            </h3>
            <p>
              Account identity details (like name/username), resume metadata,
              resume file URLs, and view event data such as timestamp, source,
              and technical request metadata.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#211911]">
              How we use data
            </h3>
            <p>
              We use data to host your resume links, maintain version history,
              generate analytics, improve reliability, and protect the platform
              from abuse.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#211911]">
              Data sharing
            </h3>
            <p>
              Public resume links are intended to be shareable. Private account
              data is not sold. Infrastructure and storage providers may process
              data only as needed to deliver the service.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#211911]">Retention</h3>
            <p>
              Data is retained while your account is active and for a limited
              period after deletion for legal, security, and backup reasons.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#211911]">
              Your choices
            </h3>
            <p>
              You can update profile fields, remove resumes, and stop sharing
              public links at any time. Contact us if you want account-level
              deletion support.
            </p>
          </div>
        </section>

        <div className="mt-10 border-t border-black/10 pt-5 text-sm font-medium text-[#6b5b4a]">
          <Link
            href="/"
            className="text-[#6b5b4a] transition hover:text-[#241c16]"
          >
            Return to home
          </Link>
        </div>
      </div>
    </main>
  );
}
