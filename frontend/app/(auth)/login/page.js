"use client";


import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500", "600"],
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

  return (
    <form className="w-full space-y-3 py-4" onSubmit={onSubmit}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#71717a]">
          Welcome Back
        </p>
        <h2 className={`mt-2 text-3xl font-semibold tracking-tight text-[#18181b] ${displayFont.className} italic`}>
          Sign In
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#71717a]">
          Use your username and password to access your dashboard.
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
          placeholder="Enter your username"
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
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
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
        className="inline-flex w-full items-center justify-center rounded-full bg-[#808080] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6b6b6b] disabled:cursor-not-allowed disabled:opacity-65"
      >
        {submitting ? "Signing in..." : "Sign In"}
      </button>

      <div className="relative py-1 text-center text-xs font-medium uppercase text-[#a1a1aa]">
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#f4f4f5]" />
        <span className="relative bg-white px-4 tracking-wider">OR</span>
      </div>

      <button
        type="button"
        onClick={loginWithGithub}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#f4f4f5] px-4 py-3 text-sm font-medium text-[#18181b] transition hover:bg-[#e4e4e7]"
      >
        Continue with GitHub
      </button>

      <p className="text-center text-sm text-[#71717a]">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#52525b] underline-offset-4 transition hover:text-[#18181b] hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
