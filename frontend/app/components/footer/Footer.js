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
  return (
    <footer
      className={`${sansFont.className} relative isolate overflow-hidden border-t border-black/10 bg-[#ece7dc] px-4 pb-8 pt-8 text-[#1b1712] sm:px-6 md:px-10 md:pt-10`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,255,255,0.4),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.34),transparent_26%)]" />
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-black/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 border-b border-black/10 pb-8 text-[#5a4e42] md:grid-cols-[1fr_auto_auto_1.2fr] md:items-start md:gap-10">
          <div className="text-sm font-semibold text-[#2a241d]">resumeX</div>

          <div className="space-y-1 text-sm font-medium">
            <a
              href="#features"
              className="block text-[#5a4e42] transition hover:text-[#1f1a14]"
            >
              Features
            </a>
            <a
              href="#cta"
              className="block text-[#5a4e42] transition hover:text-[#1f1a14]"
            >
              Pricing
            </a>
            <a
              href="#features"
              className="block text-[#5a4e42] transition hover:text-[#1f1a14]"
            >
              Security
            </a>
            <a
              href="#home"
              className="block text-[#5a4e42] transition hover:text-[#1f1a14]"
            >
              Privacy
            </a>
            <a
              href="#home"
              className="block text-[#5a4e42] transition hover:text-[#1f1a14]"
            >
              Terms
            </a>
          </div>

          <div className="space-y-1 text-sm font-medium">
            <a
              href="#home"
              className="block text-[#5a4e42] transition hover:text-[#1f1a14]"
            >
              Twitter
            </a>
            <a
              href="#home"
              className="block text-[#5a4e42] transition hover:text-[#1f1a14]"
            >
              Instagram
            </a>
            <a
              href="#home"
              className="block text-[#5a4e42] transition hover:text-[#1f1a14]"
            >
              LinkedIn
            </a>
          </div>

          <div className="max-w-md md:justify-self-end">
            <p className="text-sm font-medium text-[#615447]">
              Get occasional updates on all things.
            </p>
            <div className="mt-3 flex items-center border border-black/10 bg-white/35 px-4 py-3">
              <input
                type="email"
                placeholder="Email here"
                aria-label="Email for updates"
                className="w-full bg-transparent text-sm text-[#2a241d] placeholder:text-[#9b8d7f] outline-none"
              />
              <span className="pl-3 text-xl leading-none text-[#9b8d7f]">
                →
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-8 pb-2 pt-4">
          <div className="select-none text-center text-[3.8rem] font-semibold leading-none tracking-tight text-[#151311] sm:text-[6rem] md:text-[9.5rem] lg:text-[11rem]">
            resume
            <span
              className={`${displayFont.className} ml-2 italic text-[#151311]`}
            >
              X
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2 text-xs text-[#6d5e4f] sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>
            © {new Date().getFullYear()} resumeX. Crafted for better first
            impressions.
          </p>
          <p className="text-[#7b5a3d]">Keep one link. Update anytime.</p>
        </div>
      </div>
    </footer>
  );
}
