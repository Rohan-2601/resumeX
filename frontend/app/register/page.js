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

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, registerWithCredentials, loginWithGithub } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await registerWithCredentials({
        username: cleanUsername,
        password,
      });
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create your account right now. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
      className={`${sansFont.className} relative min-h-[100dvh] grid place-items-center overflow-hidden bg-[var(--bg-app)] p-4 sm:p-6 md:p-8 ${(loading || user) ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(123,90,61,0.16),transparent_38%),radial-gradient(circle_at_82%_88%,rgba(36,28,22,0.16),transparent_36%)]" />

      <main className="login-card-enter relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--bg-surface)] shadow-xl md:h-[calc(100dvh-4rem)] md:max-h-[680px] md:grid-cols-2">
        <section className="group relative min-h-[320px] md:min-h-full md:order-2">
          <Image
            src="/signup.webp"
            alt="ResumeX signup visual"
            fill
            priority
            unoptimized={true}
            className="object-cover object-bottom"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(10,10,10,0.68),rgba(12,12,12,0.24)_40%,rgba(12,10,8,0.7)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent,rgba(8,7,6,0.76))]" />

          <div className="absolute bottom-6 left-6 max-w-sm text-[#f8eedf] md:bottom-10 md:left-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#ead9bf]/90">
              Start Your ResumeX Journey
            </p>
            <h1
              className={`${displayFont.className} mt-3 text-3xl font-medium italic leading-tight text-[#f7ead5]`}
            >
              Create your account and start tracking your resume in minutes.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#eadfce]/85">
              A single link that stays current, polished, and ready to share.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-8 lg:p-10 md:order-1">
          <form className="w-full max-w-md space-y-4" onSubmit={onSubmit}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#71717a]">
                New Account
              </p>
              <h2 className={`mt-2 text-3xl font-semibold tracking-tight text-[#18181b] ${displayFont.className} italic`}>
                Create Account
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#71717a]">
                Choose a username and password to get started.
              </p>
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-[#3f3f46]"
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
                placeholder="Choose a username"
                className="w-full rounded-full border border-[#e4e4e7] bg-white px-5 py-3.5 text-sm text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#a1a1aa] focus:ring-2 focus:ring-[#f4f4f5]"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-[#3f3f46]"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                className="w-full rounded-full border border-[#e4e4e7] bg-white px-5 py-3.5 text-sm text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#a1a1aa] focus:ring-2 focus:ring-[#f4f4f5]"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-[#3f3f46]"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                className="w-full rounded-full border border-[#e4e4e7] bg-white px-5 py-3.5 text-sm text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#a1a1aa] focus:ring-2 focus:ring-[#f4f4f5]"
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#808080] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#6b6b6b] disabled:cursor-not-allowed disabled:opacity-65"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>

            <div className="relative py-1 text-center text-xs font-medium uppercase text-[#a1a1aa]">
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#f4f4f5]" />
              <span className="relative bg-[var(--bg-surface)] px-4 tracking-wider">OR</span>
            </div>

            <button
              type="button"
              onClick={loginWithGithub}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#f4f4f5] px-4 py-3.5 text-sm font-medium text-[#18181b] transition hover:bg-[#e4e4e7]"
            >
              Continue with GitHub
            </button>

            <p className="text-center text-sm text-[#71717a]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#52525b] underline-offset-4 transition hover:text-[#18181b] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </main>
    </div>
    </>
  );
}
