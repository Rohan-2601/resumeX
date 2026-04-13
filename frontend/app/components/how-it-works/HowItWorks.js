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

const steps = [
  {
    number: "01",
    title: "Upload Your Resume",
    description:
      "Drop your resume in seconds and publish it with one clean profile link.",
  },
  {
    number: "02",
    title: "Create a Role-Specific Slug",
    description:
      "Make targeted links like /username/frontend or /username/product for different applications.",
  },
  {
    number: "03",
    title: "Share Everywhere",
    description:
      "Use the same ResumeX link on LinkedIn, email, portfolios, and referrals.",
  },
  {
    number: "04",
    title: "Update Once, Stay Current",
    description:
      "Whenever you improve your resume, your existing shared link is automatically up to date.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={`${sansFont.className} relative overflow-hidden bg-[#e9e1d0] px-4 py-24 text-[#1f1b16] sm:px-6 md:px-10 md:py-28`}
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#7b5a3d]">
            How It Works
          </p>
          <h2 className="text-balance text-3xl font-medium leading-[1.03] tracking-tight text-[#211911] sm:text-5xl md:text-6xl">
            From Resume Upload to
            <span
              className={`${displayFont.className} ml-3 inline-block italic text-[#8a6340]`}
            >
              Recruiter View
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-[#5f5144] md:text-lg md:leading-8">
            A focused 4-step flow built for real job applications. No folder
            chaos, no outdated attachments, no guessing what happened.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:gap-7">
          {steps.map((step, index) => (
            <article
              key={step.number}
              style={{
                animation: `fadeInUp 0.72s ease-out ${index * 110}ms both`,
              }}
              className="group relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#e9e1d0] p-7 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:border-black/15 hover:shadow-[0_26px_60px_-34px_rgba(0,0,0,0.52)] sm:p-8"
            >
              <div className="absolute right-5 top-5 text-[0.72rem] font-semibold tracking-[0.22em] text-[#8a6a4c]">
                STEP {step.number}
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-[#241c16] text-sm font-semibold text-[#f7ead4] shadow-[0_12px_26px_-16px_rgba(0,0,0,0.9)]">
                {step.number}
              </div>

              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-[#201812]">
                {step.title}
              </h3>

              <p className="mt-4 max-w-md text-sm leading-7 text-[#645648] sm:text-[0.98rem] sm:leading-8">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
