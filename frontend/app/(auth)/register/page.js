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

  const isValid = username.trim().length > 0 && password.length > 0 && confirmPassword.length > 0;

  return (
    <form className="w-full space-y-3 py-4" onSubmit={onSubmit}>
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
          className="w-full rounded-full border border-[#e4e4e7] bg-white px-5 py-3 text-sm text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#a1a1aa] focus:ring-2 focus:ring-[#f4f4f5]"
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
          className="w-full rounded-full border border-[#e4e4e7] bg-white px-5 py-3 text-sm text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#a1a1aa] focus:ring-2 focus:ring-[#f4f4f5]"
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
          className="w-full rounded-full border border-[#e4e4e7] bg-white px-5 py-3 text-sm text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#a1a1aa] focus:ring-2 focus:ring-[#f4f4f5]"
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
        className={`inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-65 ${
          isValid ? "bg-black hover:bg-zinc-800" : "bg-[#808080] hover:bg-[#6b6b6b]"
        }`}
      >
        {submitting ? "Creating account..." : "Create Account"}
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#52525b] underline-offset-4 transition hover:text-[#18181b] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
