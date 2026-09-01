import {
  FileTextIcon,
  LinkIcon,
  ActivityIcon,
  HistoryIcon,
} from "../icons/Icons";

import { Syne, Outfit } from "next/font/google";

const headingFont = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Features() {
  const coreFeatures = [
    {
      Icon: HistoryIcon,
      title: "Always Up-to-Date",
      description:
        "Update your resume once, and your link reflects it everywhere instantly. No resending. No confusion.",
    },
    {
      Icon: LinkIcon,
      title: "See Who Viewed",
      description:
        "Know when your resume gets opened and where the views come from - LinkedIn, referrals, or anywhere else.",
    },
    {
      Icon: ActivityIcon,
      title: "One Link Everywhere",
      description:
        "Share a single clean link on LinkedIn, email, or portfolio - instead of messy PDFs and long Drive links.",
    },
    {
      Icon: FileTextIcon,
      title: "Manage Multiple Versions",
      description:
        "Create different resumes for different roles without losing track. Switch and update with ease.",
    },
  ];

  return (
    <section
      className={`${bodyFont.className} relative w-full overflow-hidden bg-[#0F2850] py-24 text-white md:py-32`}
      id="features"
    >
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <div className="mx-auto mb-4 max-w-4xl text-center md:mb-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#E2F0C6]">
            Features
          </p>
          <h2 className={`${headingFont.className} text-balance text-3xl font-bold leading-[1.02] tracking-tighter text-white sm:text-5xl md:text-6xl`}>
            A Better Way to Share
            <span
              className={`ml-3 inline-block text-[#E2F0C6]`}
            >
              Your Resume
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-white/80 md:text-lg md:leading-8">
            No more outdated PDFs, messy links, or guesswork. Update once, share
            everywhere, and finally know what happens after you send your
            resume. Still curious? Scroll down to the FAQ section for details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-7">
          {coreFeatures.map((feature, index) => (
            <div
              key={feature.title}
              style={{
                animation: `fadeInUp 0.76s ease-out ${index * 105}ms both`,
              }}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-8"
            >
              <div className="relative flex items-start gap-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#E2F0C6] text-[#0F2850] shadow-sm transition duration-300 group-hover:scale-105">
                  <feature.Icon className="h-6 w-6" />
                </div>
              </div>

              <h3 className={`${headingFont.className} relative mt-6 text-2xl font-bold tracking-tighter text-white`}>
                {feature.title}
              </h3>

              <p className="relative mt-4 max-w-md text-sm leading-7 text-white/70 sm:text-[0.98rem] sm:leading-8">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
