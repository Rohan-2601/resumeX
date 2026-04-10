"use client";

import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Sora } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, loginWithCredentials, loginWithGithub } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  const onSubmit = async (event) => {
    event.preventDefault();

    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !password) {
      setError("Username and password are required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await loginWithCredentials({
        username: cleanUsername,
        password,
      });
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to sign in right now. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`${sansFont.className} flex min-h-[100dvh] items-center justify-center bg-[#e9e1d0]`}
      >
        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm font-medium text-[#5f5144] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d8c8ad] border-t-[#7b5a3d]" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sansFont.className} relative min-h-[100dvh] overflow-hidden bg-[#e9e1d0] px-4 py-8 sm:px-6 md:px-10 md:py-12`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(123,90,61,0.16),transparent_38%),radial-gradient(circle_at_82%_88%,rgba(36,28,22,0.16),transparent_36%)]" />

      <main className="login-card-enter relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.98)_0%,rgba(239,229,212,0.95)_100%)] shadow-[0_38px_90px_-38px_rgba(0,0,0,0.55)] md:min-h-[680px] md:grid-cols-2">
        <section className="group relative min-h-[320px] md:min-h-full">
          <Image
            src="/login.webp"
            alt="ResumeX login visual"
            fill
            priority
            className="login-image-motion object-cover object-bottom"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(10,10,10,0.68),rgba(12,12,12,0.24)_40%,rgba(12,10,8,0.7)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent,rgba(8,7,6,0.76))]" />

          <div className="absolute bottom-6 left-6 max-w-sm text-[#f8eedf] md:bottom-10 md:left-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#ead9bf]/90">
              ResumeX Workspace
            </p>
            <h1
              className={`${displayFont.className} mt-3 text-3xl font-medium italic leading-tight text-[#f7ead5]`}
            >
              Log in and continue from exactly where you left off.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#eadfce]/85">
              Keep your resume link live, updated, and ready for every
              recruiter.
            </p>
          </div>
        </section>

        <section className="flex items-center p-6 md:p-12">
          <form className="w-full max-w-md space-y-5" onSubmit={onSubmit}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a6340]">
                Welcome Back
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#211911]">
                Sign In
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5f5144]">
                Use your username and password to access your dashboard.
              </p>
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-[#4f4236]"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                className="w-full rounded-xl border border-[#d8c8ad] bg-[#f8f3e8] px-4 py-3 text-sm text-[#211911] outline-none transition placeholder:text-[#9b8c79] focus:border-[#8a6340] focus:bg-white focus:ring-2 focus:ring-[#d8c8ad]"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-[#4f4236]"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-[#d8c8ad] bg-[#f8f3e8] px-4 py-3 text-sm text-[#211911] outline-none transition placeholder:text-[#9b8c79] focus:border-[#8a6340] focus:bg-white focus:ring-2 focus:ring-[#d8c8ad]"
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-[#e4b9b4] bg-[#fff1ef] px-3 py-2 text-sm text-[#9e3127]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#241c16] px-4 py-3 text-sm font-semibold text-[#fbf4e3] transition hover:bg-[#17110c] disabled:cursor-not-allowed disabled:opacity-65"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative py-1 text-center text-xs font-medium uppercase tracking-[0.18em] text-[#8d7a64]">
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#c7b79f]" />
              <span className="relative bg-[#efe4d1] px-3">or</span>
            </div>

            <button
              type="button"
              onClick={loginWithGithub}
              className="inline-flex w-full items-center justify-center rounded-xl border border-[#cdbca1] bg-[#f8f2e5] px-4 py-3 text-sm font-semibold text-[#2b221b] transition hover:bg-[#f1e6d4]"
            >
              Continue with GitHub
            </button>

            <p className="text-center text-sm text-[#5f5144]">
              New here?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#2a2119] underline-offset-4 transition hover:text-[#8a6340] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
