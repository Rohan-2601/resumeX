// "use client";

// import { useAuth } from "../../context/AuthContext";

// export default function Hero() {
//   const { login } = useAuth();

//   return (
//     <section className="relative min-h-screen overflow-hidden text-white">
//       <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-center bg-no-repeat" />

//       <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-20 sm:px-8 lg:px-12">
//         <div
//           className="max-w-2xl"
//           style={{ animation: "fadeInUp 0.8s ease-out both" }}
//         >
//           <h1 className="mb-5 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-7xl">
//             Stop Sending Outdated Resumes
//           </h1>

//           <p className="mb-8 max-w-xl text-base leading-relaxed text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] sm:text-lg">
//             One link. Always updated. Know exactly who viewed your resume and
//             where they came from.
//           </p>

//           <button
//             onClick={login}
//             className="inline-flex items-center justify-center rounded-full border border-white bg-black/30 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-black/45 sm:text-base"
//           >
//             Get Your Resume Link
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../../context/AuthContext";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500", "600"],
});

const sansFont = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Hero() {
  const { login } = useAuth();

  return (
    <main
      id="home"
      className={`${sansFont.className} relative isolate min-h-screen overflow-hidden bg-[#e8e2d4] text-[#1f1b16]`}
    >
      <div className="absolute inset-0 -z-30">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero.png')" }}
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(248,242,230,0.22)_0%,rgba(245,238,224,0.12)_26%,rgba(12,15,20,0.28)_58%,rgba(9,10,12,0.42)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(92%_58%_at_50%_32%,rgba(8,12,16,0.36)_0%,rgba(8,12,16,0.22)_42%,transparent_78%),radial-gradient(circle_at_50%_0%,rgba(255,252,244,0.16),transparent_46%),radial-gradient(circle_at_50%_100%,rgba(10,11,14,0.36),transparent_46%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-16 pt-8 sm:px-6 md:px-10 md:pt-10">
        <header className="hero-nav-enter mx-auto w-full max-w-3xl rounded-full border border-black/15 bg-[#f5edd9]/62 px-3 py-2 shadow-[0_10px_35px_-22px_rgba(0,0,0,0.7)] backdrop-blur-md sm:px-5">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <p className="px-3 text-xl font-semibold tracking-tight text-[#2a2118]">
              ResumeX
            </p>
            <nav className="hidden items-center gap-6 text-sm font-medium text-[#5a4c3d] md:flex">
              <a
                href="#home"
                className="text-[#5a4c3d] transition hover:text-[#201812]"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-[#5a4c3d] transition hover:text-[#201812]"
              >
                Features
              </a>
              <a
                href="#cta"
                className="text-[#5a4c3d] transition hover:text-[#201812]"
              >
                CTA
              </a>
            </nav>
            <button
              onClick={login}
              className="rounded-full bg-[#241c16] px-4 py-2 text-sm font-semibold text-[#fbf4e3] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.95)] transition hover:bg-[#17110c] sm:px-6"
            >
              Login
            </button>
          </div>
        </header>

        <div className="hero-content-reveal relative mx-auto mt-20 flex max-w-4xl flex-1 flex-col items-center text-center md:mt-28">
          <h1 className="relative text-balance text-3xl font-medium leading-[1.03] tracking-tight text-[#f9f4ea] [text-shadow:0_2px_4px_rgba(0,0,0,0.8),0_10px_32px_rgba(0,0,0,0.58)] [-webkit-text-stroke:0.35px_rgba(0,0,0,0.35)] sm:text-6xl md:text-7xl">
            Stop Sending
            <span
              className={`${displayFont.className} ml-3 inline-block font-medium italic text-[#f3dcb9] [text-shadow:0_2px_4px_rgba(0,0,0,0.78),0_8px_24px_rgba(0,0,0,0.55)]`}
            >
              Outdated Resumes
            </span>
          </h1>
          <p className="relative mt-5 max-w-3xl text-pretty text-base leading-7 text-[#f3ead8] [text-shadow:0_2px_4px_rgba(0,0,0,0.72),0_8px_24px_rgba(0,0,0,0.52)] md:text-xl md:leading-8">
            One link. Always updated. Know exactly who viewed your resume and
            where they came from.
          </p>

          <div className="relative mt-8">
            <button
              onClick={login}
              className="hero-cta-glow inline-flex items-center rounded-full bg-[#2a2119] px-8 py-4 text-base font-semibold text-[#fbf4e3] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.82)] transition hover:bg-[#1d1712]"
            >
              Get Your Resume Link
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
