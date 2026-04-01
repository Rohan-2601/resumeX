"use client";

import { useAuth } from "../../context/AuthContext";

export default function Hero() {
  const { login } = useAuth();

  return (
    <section className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-center bg-no-repeat" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-20 sm:px-8 lg:px-12">
        <div
          className="max-w-2xl"
          style={{ animation: "fadeInUp 0.8s ease-out both" }}
        >
          <h1 className="mb-5 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-7xl">
            Stop Sending Outdated Resumes
          </h1>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] sm:text-lg">
            One link. Always updated. Know exactly who viewed your resume and
            where they came from.
          </p>

          <button
            onClick={login}
            className="inline-flex items-center justify-center rounded-full border border-white bg-black/30 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-black/45 sm:text-base"
          >
            Get Your Resume Link
          </button>
        </div>
      </div>
    </section>
  );
}
