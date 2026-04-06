import {
  FileTextIcon,
  LinkIcon,
  ActivityIcon,
  HistoryIcon,
} from "../icons/Icons";

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
      className={`${sansFont.className} relative w-full overflow-hidden bg-[#e9e1d0] py-24 text-[#1f1b16] md:py-32`}
      id="features"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.12)_32%,transparent_72%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.38),transparent_20%),radial-gradient(circle_at_82%_12%,rgba(123,90,61,0.14),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(17,18,20,0.05),transparent_26%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <div className="mx-auto mb-4 max-w-4xl text-center md:mb-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#7b5a3d]">
            Features
          </p>
          <h2 className="text-balance text-3xl font-medium leading-[1.02] tracking-tight text-[#201812] sm:text-5xl md:text-6xl">
            A Better Way to Share
            <span
              className={`${displayFont.className} ml-3 inline-block italic text-[#8a6340]`}
            >
              Your Resume
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-[#5f5144] md:text-lg md:leading-8">
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
              className="group relative overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.9)_100%)] p-7 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.45)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-black/15 hover:shadow-[0_26px_60px_-34px_rgba(0,0,0,0.52)] sm:p-8"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent opacity-90" />
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(123,90,61,0.15)_0%,rgba(123,90,61,0.05)_40%,transparent_75%)] blur-2xl transition duration-300 group-hover:scale-110" />

              <div className="relative flex items-start gap-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-[#241c16] text-[#f7ead4] shadow-[0_12px_26px_-16px_rgba(0,0,0,0.9)] transition duration-300 group-hover:scale-105">
                  <feature.Icon className="h-6 w-6" />
                </div>
              </div>

              <h3 className="relative mt-6 text-2xl font-semibold tracking-tight text-[#201812]">
                {feature.title}
              </h3>

              <p className="relative mt-4 max-w-md text-sm leading-7 text-[#645648] sm:text-[0.98rem] sm:leading-8">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
