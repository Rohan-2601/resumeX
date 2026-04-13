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

const comparisonRows = [
  {
    metric: "Always latest resume",
    drive: "You must re-share a new file each update",
    resumex: "One link always points to your latest version",
  },
  {
    metric: "Professional URL",
    drive: "Long, generic link with random characters",
    resumex: "Clean URL with your username and slug",
  },
  {
    metric: "View insights",
    drive: "No practical candidate-level view source insights",
    resumex: "Track views and where traffic came from",
  },
  {
    metric: "Role-specific resumes",
    drive: "Messy folder juggling and duplicate filenames",
    resumex: "Maintain multiple tailored versions neatly",
  },
];

export default function Comparison() {
  return (
    <section
      id="comparison"
      className={`${sansFont.className} relative overflow-hidden bg-[#e9e1d0] px-4 py-24 text-[#1f1b16] sm:px-6 md:px-10 md:py-28`}
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#7b5a3d]">
            ResumeX vs Drive Link
          </p>
          <h2 className="text-balance text-3xl font-medium leading-[1.03] tracking-tight text-[#211911] sm:text-5xl md:text-6xl">
            Why Recruiters Prefer
            <span
              className={`${displayFont.className} ml-3 inline-block italic text-[#8a6340]`}
            >
              ResumeX
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-[#5f5144] md:text-lg md:leading-8">
            Google Drive links share files. ResumeX shares your professional
            profile flow: always current, easier to trust, and built for hiring
            conversations.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-black/10 bg-[#ece4d4] shadow-[0_24px_70px_-38px_rgba(0,0,0,0.55)] sm:mt-12">
          <div className="grid grid-cols-1 border-b border-black/10 md:grid-cols-[0.9fr_1.05fr_1.05fr]">
            <div className="border-black/10 bg-[#e5ddcc] px-5 py-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#6b5b4b] md:border-r md:px-7">
              Comparison
            </div>
            <div className="border-black/10 bg-[#efe7d8] px-5 py-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#6d5a48] md:border-r md:px-7">
              Google Drive Link
            </div>
            <div className="bg-[#f2ebdc] px-5 py-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#4f3a27] md:px-7">
              ResumeX Link
            </div>
          </div>

          {comparisonRows.map((row, index) => (
            <div
              key={row.metric}
              className={`grid grid-cols-1 md:grid-cols-[0.9fr_1.05fr_1.05fr] ${
                index !== comparisonRows.length - 1
                  ? "border-b border-black/10"
                  : ""
              }`}
            >
              <div className="border-black/10 bg-[#e9e1d0] px-5 py-6 text-sm font-semibold text-[#2b2219] md:border-r md:px-7 md:text-[0.96rem]">
                {row.metric}
              </div>
              <div className="border-black/10 bg-[#ebe3d2] px-5 py-6 text-sm leading-7 text-[#6a5b4c] md:border-r md:px-7 md:text-[0.96rem]">
                {row.drive}
              </div>
              <div className="bg-[#f0e8d9] px-5 py-6 text-sm leading-7 text-[#3f3124] md:px-7 md:text-[0.96rem]">
                {row.resumex}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
