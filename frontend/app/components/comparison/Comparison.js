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
      className={`${sansFont.className} relative overflow-hidden bg-[#fdfdfd] px-4 py-24 text-[#123F5B] sm:px-6 md:px-10 md:py-28`}
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#557083]">
            resumeX vs Drive Link
          </p>
          <h2 className="text-balance text-3xl font-medium leading-[1.03] tracking-tight text-[#123F5B] sm:text-5xl md:text-6xl">
            Why Recruiters Prefer
            <span
              className={`${displayFont.className} ml-3 inline-block italic text-[#123F5B]`}
            >
              resumeX
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-[#557083] md:text-lg md:leading-8">
            Google Drive links share files. resumeX shares your professional
            profile flow: always current, easier to trust, and built for hiring
            conversations.
          </p>
        </div>

        <div className="mt-10 md:hidden">
          <div className="space-y-4">
            {comparisonRows.map((row, index) => (
              <article
                key={row.metric}
                className="group overflow-hidden rounded-[1.5rem] border border-[#E5E7E3] bg-[#FFFFFF] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.12)] hover:border-[#123F5B]/20 cursor-default"
              >
                <div className="bg-[#F7F7F3] px-5 py-4 text-sm font-semibold text-[#123F5B] transition-colors duration-300 group-hover:bg-[#F0F0EA]">
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">{index + 1}. {row.metric}</span>
                </div>

                <div className="space-y-3 px-4 py-4">
                  <div className="rounded-xl border border-[#E5E7E3] bg-[#F7F7F3] p-4 transition-all duration-300 group-hover:bg-[#F0F0EA] group-hover:border-black/10">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#557083]">
                      Google Drive Link
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#557083] transition-transform duration-300 group-hover:translate-x-0.5">
                      {row.drive}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E5E7E3] bg-[#FFFFFF] p-4 transition-all duration-300 group-hover:border-[#123F5B]/20 group-hover:shadow-sm">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#123F5B]">
                      resumeX Link
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#123F5B] transition-transform duration-300 group-hover:translate-x-0.5 font-medium">
                      {row.resumex}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 hidden overflow-hidden rounded-[2rem] border border-[#E5E7E3] bg-[#FFFFFF] shadow-[0_24px_70px_-38px_rgba(0,0,0,0.08)] md:block">
          <div className="grid border-b border-[#E5E7E3] md:grid-cols-[0.9fr_1.05fr_1.05fr]">
            <div className="border-[#E5E7E3] bg-[#F7F7F3] px-5 py-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#557083] md:border-r md:px-7">
              Comparison
            </div>
            <div className="border-[#E5E7E3] bg-[#F7F7F3] px-5 py-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#557083] md:border-r md:px-7">
              Google Drive Link
            </div>
            <div className="bg-[#FFFFFF] px-5 py-5 text-sm font-semibold uppercase tracking-[0.15em] text-[#123F5B] md:px-7">
              resumeX Link
            </div>
          </div>

          {comparisonRows.map((row, index) => (
            <div
              key={row.metric}
              className={`group grid md:grid-cols-[0.9fr_1.05fr_1.05fr] transition-all duration-300 cursor-default hover:relative hover:z-10 hover:shadow-[0_0_30px_rgba(0,0,0,0.04)] ${index !== comparisonRows.length - 1
                ? "border-b border-[#E5E7E3]"
                : ""
                }`}
            >
              <div className="border-[#E5E7E3] bg-[#F7F7F3] px-5 py-6 text-sm font-semibold text-[#123F5B] transition-colors duration-300 group-hover:bg-[#F0F0EA] md:border-r md:px-7 md:text-[0.96rem]">
                <span className="block transition-transform duration-300 group-hover:translate-x-1">{row.metric}</span>
              </div>
              <div className="border-[#E5E7E3] bg-[#F7F7F3] px-5 py-6 text-sm leading-7 text-[#557083] transition-colors duration-300 group-hover:bg-[#F0F0EA] md:border-r md:px-7 md:text-[0.96rem]">
                <span className="block transition-transform duration-300 group-hover:translate-x-1">{row.drive}</span>
              </div>
              <div className="bg-[#FFFFFF] px-5 py-6 text-sm leading-7 text-[#123F5B] transition-colors duration-300 group-hover:bg-[#F9FAFB] md:px-7 md:text-[0.96rem]">
                <span className="block font-medium transition-transform duration-300 group-hover:translate-x-1">{row.resumex}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
