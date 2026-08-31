"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Playfair_Display, Sora } from "next/font/google";
import { useAuth } from "../context/AuthContext";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500", "600"],
});

const sansFont = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AuthLayout({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const { loading, user } = useAuth();

  return (
    <>
      {(loading || user) && (
        <div
          className={`${sansFont.className} fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-app)]`}
        >
          <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-medium text-[var(--text-main)] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-black" />
            Loading...
          </div>
        </div>
      )}
      <div
        className={`${sansFont.className} relative min-h-screen bg-[#f3f4f6] flex items-center justify-center p-1 sm:p-2 ${(loading || user) ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}
      >
        <main className="relative flex w-full max-w-[2000px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:block md:h-[calc(100vh-1rem)]">
          
          {/* Mobile Layout (Visible only on < md) */}
          <div className="flex flex-col h-full md:hidden">
            <section className="relative h-[40vh] w-full shrink-0">
              <Image
                src="/signup.webp"
                alt="ResumeX visual"
                fill
                priority
                unoptimized={true}
                className="object-cover object-bottom"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(10,10,10,0.4),rgba(12,12,12,0.1)_40%,rgba(12,10,8,0.5)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent,rgba(8,7,6,0.76))]" />

              <div className="absolute bottom-6 left-6 max-w-sm text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-white/90">
                  {isLogin ? "ResumeX Workspace" : "Start Your ResumeX Journey"}
                </p>
                <h1 className={`${displayFont.className} mt-3 text-3xl font-medium italic leading-tight text-white`}>
                  {isLogin
                    ? "Log in and continue from exactly where you left off."
                    : "Create your account and start tracking your resume in minutes."}
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  {isLogin
                    ? "Keep your resume link live, updated, and ready for every recruiter."
                    : "A single link that stays current, polished, and ready to share."}
                </p>
              </div>
            </section>
            <section className="flex w-full items-center justify-center bg-white p-6">
               {children}
            </section>
          </div>

          {/* Desktop Layout (Visible only on >= md) */}
          <div className="hidden h-full w-full md:block relative bg-white">
            {/* Image Panel */}
            <section
              className={`absolute top-0 bottom-0 w-1/2 overflow-hidden transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
                isLogin ? "translate-x-0" : "translate-x-full"
              } z-0`}
            >
              <Image
                src="/signup.webp"
                alt="ResumeX visual"
                fill
                priority
                unoptimized={true}
                className="object-cover object-bottom"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(10,10,10,0.4),rgba(12,12,12,0.1)_40%,rgba(12,10,8,0.5)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent,rgba(8,7,6,0.76))]" />

              <div
                key={isLogin ? 'login-text' : 'register-text'}
                className="absolute bottom-12 left-12 max-w-sm text-white animate-fade-in-up"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/90">
                  {isLogin ? "ResumeX Workspace" : "Start Your ResumeX Journey"}
                </p>
                <h1 className={`${displayFont.className} mt-3 text-3xl font-medium italic leading-tight text-white`}>
                  {isLogin
                    ? "Log in and continue from exactly where you left off."
                    : "Create your account and start tracking your resume in minutes."}
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  {isLogin
                    ? "Keep your resume link live, updated, and ready for every recruiter."
                    : "A single link that stays current, polished, and ready to share."}
                </p>
              </div>
            </section>

            {/* Form Panel */}
            <section
              className={`absolute top-0 bottom-0 w-1/2 flex items-center justify-center bg-white overflow-y-auto p-10 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
                isLogin ? "translate-x-full" : "translate-x-0"
              } z-10 shadow-[0_0_40px_rgba(0,0,0,0.1)]`}
            >
              <div key={pathname} className="w-full max-w-md animate-fade-in-up">
                {children}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
