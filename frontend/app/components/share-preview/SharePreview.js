import Image from "next/image";
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

const sampleLink = "https://resumeX.rohann.tech/Rohan-2601/fullstack";

export default function SharePreview() {
  return (
    <section
      id="share-preview"
      className={`${sansFont.className} relative overflow-hidden bg-[#fdfdfd] px-4 py-24 text-[#123F5B] sm:px-6 md:px-10 md:py-28`}
    >
      <div className="relative mx-auto w-full max-w-4xl">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#557083]">
            Link Preview
          </p>
          <h2 className="text-balance text-3xl font-medium leading-[1.03] tracking-tight text-[#123F5B] sm:text-5xl md:text-6xl">
            See Exactly What Recruiters
            <span
              className={`${displayFont.className} ml-3 inline-block italic text-[#123F5B]`}
            >
              Open
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-[#557083] md:text-lg md:leading-8">
            This is how your resume link appears when shared. Clean URL, instant
            preview, and always the latest version.
          </p>
        </div>

        <a
          href={sampleLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto mt-10 block w-full max-w-[820px] overflow-hidden rounded-[1.8rem] border border-black/10 bg-[#fdfdfd] p-1 shadow-[0_24px_70px_-36px_rgba(0,0,0,0.62)] transition hover:border-black/20 sm:mt-12"
        >
          <div className="w-full overflow-hidden rounded-[1.35rem] border border-black/10 bg-white/90">
            <Image
              src="/resume.webp"
              alt="Resume share preview"
              width={1200}
              height={630}
              className="h-auto w-full transition duration-500 group-hover:scale-[1.01]"
              sizes="(max-width: 1024px) 100vw, 820px"
              priority={false}
            />
          </div>
        </a>
      </div>
    </section>
  );
}
