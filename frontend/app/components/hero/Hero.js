"use client";

import { Syne, Outfit } from "next/font/google";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CornerButton } from "@/components/ui/corner-button";

const headingFont = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const bodyFont = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function Hero() {
  const router = useRouter();

  const goToLogin = () => {
    router.push("/login");
  };

  const goToRegister = () => {
    router.push("/register");
  };

  return (
    <main
      id="home"
      className={`${bodyFont.className} relative isolate min-h-[100dvh] overflow-hidden bg-[#0F2850] text-white`}
    >
      {/* Base Image Layer */}
      <div className="absolute inset-0 -z-40 translate-y-[2%] scale-[1.05]">
        <Image
          src="/hero6.webp"
          alt="Hero Background"
          fill
          priority
          unoptimized={true}
          className="object-cover object-center"
        />
      </div>

      {/* Extremely subtle dark gradient behind text for minimal contrast if needed, mostly transparent */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

      <section className="relative mx-auto flex min-h-[100dvh] w-full flex-col pt-6 md:pt-10">

        {/* Navbar */}
        <header className="mx-auto w-full px-6 md:px-12 lg:px-16 flex justify-between items-center">

          {/* Left Logo */}
          <div className="flex items-center">
            <p className={`${headingFont.className} text-2xl md:text-3xl font-bold tracking-tighter text-[#15415C]`}>
              resumeX
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button onClick={goToRegister} className="hidden sm:block text-[15px] font-medium text-[#15415C] hover:text-[#15415C]/80 transition">
              Register
            </button>
            <button
              onClick={goToLogin}
              className="text-[15px] font-medium text-[#15415C] hover:text-[#15415C]/80 transition"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative mx-auto mt-10 md:mt-16 flex max-w-3xl flex-1 flex-col items-center text-center px-4">

          {/* Main Heading */}
          <h1 className={`${headingFont.className} text-balance text-5xl md:text-6xl lg:text-[4rem] font-bold leading-[1.05] tracking-tighter text-[#15415C]`}>
            Your Resume Deserves a Better Link.
          </h1>

          {/* Subheading */}
          <p className="mt-4 md:mt-5 max-w-lg text-balance text-[15px] md:text-base leading-relaxed text-[#4F6C7D] font-medium">
            Create a permanent resume URL that stays the same, even when your resume changes.
          </p>

          {/* Primary CTA */}
          <div className="mt-6 flex flex-col items-center">
            <CornerButton
              onClick={goToLogin}
              accentColor="#E2F0C6"
              className="!px-6 !py-2 !text-[15px] text-[#11354F] font-medium"
              wrapperClassName="!p-3"
              icon={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                  <path d="M2.5 6H9.5M9.5 6L6 2.5M9.5 6L6 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            >
              Get My Link
            </CornerButton>
          </div>

        </div>
      </section>
    </main>
  );
}
