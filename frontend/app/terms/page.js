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
  title: "Terms of Use | resumeX",
  description:
    "Review the terms for using resumeX, including account responsibilities, acceptable usage, and public-link behavior.",
};

export default function TermsPage() {
  return (
    <main
      className={`${sansFont.className} min-h-screen bg-[#e9e1d0] px-4 py-14 text-[#1f1b16] sm:px-6 md:px-10`}
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7b5a3d]">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#211911] sm:text-5xl">
          Terms
          <span
            className={`${displayFont.className} ml-3 italic text-[#8a6340]`}
          >
            of Use
          </span>
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#5f5144] sm:text-base sm:leading-8">
          These terms govern your use of resumeX. By using the product, you
          agree to use it lawfully and responsibly, especially when publishing
          resume links that others can access.
        </p>

      

        <section className="mt-8 space-y-6 text-sm leading-7 text-[#5f5144] sm:text-base sm:leading-8">
          <div>
            <h3 className="text-lg font-semibold text-[#211911]">
              Account responsibilities
            </h3>
            <p>
              You are responsible for content uploaded to your account,
              protecting your login credentials, and ensuring your information
              is accurate and lawful.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#211911]">
              Acceptable use
            </h3>
            <p>
              Do not use resumeX for unlawful, deceptive, abusive, or malicious
              activity. Public links should not host prohibited content or
              violate intellectual property rights.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#211911]">
              Public link behavior
            </h3>
            <p>
              Anyone with your public URL may access the active resume version.
              Share carefully and rotate/remove links if needed.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#211911]">
              Service availability
            </h3>
            <p>
              We aim for reliable uptime but may perform maintenance or updates
              that temporarily affect access.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#211911]">
              Changes to terms
            </h3>
            <p>
              We may update these terms over time. Continued use after updates
              means you accept the revised terms.
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
