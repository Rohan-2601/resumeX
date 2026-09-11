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
  const { user, isInitializing, registerWithCredentials, loginWithGithub } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isInitializing && user) {
      router.replace("/dashboard");
    }
  }, [isInitializing, user, router]);

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

    if (submitting || githubLoading) return;

    setSubmitting(true);
    setError("");

    try {
      await registerWithCredentials({
        username: cleanUsername,
        password,
      });
      // Router will redirect, let's keep button loading state to prevent flash
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create your account right now. Please try again.";
      setError(message);
      setSubmitting(false); // only reset on error
    }
  };

  const onGithubLogin = () => {
    if (submitting || githubLoading) return;
    setGithubLoading(true);
    loginWithGithub();
  };

  const isValid = username.trim().length > 0 && password.length > 0 && confirmPassword.length > 0;
  const isAnyLoading = submitting || githubLoading;

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
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            className="w-full rounded-full border border-[#e4e4e7] bg-white px-5 py-3 pr-12 text-sm text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#a1a1aa] focus:ring-2 focus:ring-[#f4f4f5]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#a1a1aa] hover:text-[#71717a] transition-colors focus:outline-none"
            tabIndex="-1"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-[18px] h-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-[18px] h-[18px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="block text-sm font-medium text-[#3f3f46]"
          htmlFor="confirmPassword"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat your password"
            className="w-full rounded-full border border-[#e4e4e7] bg-white px-5 py-3 pr-12 text-sm text-[#18181b] outline-none transition placeholder:text-[#a1a1aa] focus:border-[#a1a1aa] focus:ring-2 focus:ring-[#f4f4f5]"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex="-1"
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {error ? (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="rounded-xl border border-[var(--danger-bg)] bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-text)]">
            {error}
          </p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isAnyLoading}
        className={`relative inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-80 min-h-[48px] ${
          isValid || isAnyLoading ? "bg-black hover:bg-zinc-800" : "bg-[#808080]"
        }`}
      >
        <span className={submitting ? "opacity-0" : "opacity-100 transition-opacity"}>Create Account</span>
        {submitting && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2">Creating account...</span>
          </span>
        )}
      </button>

      <div className="relative py-1 text-center text-xs font-medium uppercase text-[#a1a1aa]">
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#f4f4f5]" />
        <span className="relative bg-white px-4 tracking-wider">OR</span>
      </div>

      <button
        type="button"
        onClick={onGithubLogin}
        disabled={isAnyLoading}
        className="relative inline-flex w-full items-center justify-center rounded-full bg-[#f4f4f5] px-4 py-3 text-sm font-medium text-[#18181b] transition hover:bg-[#e4e4e7] disabled:cursor-not-allowed disabled:opacity-80 min-h-[48px]"
      >
        <span className={githubLoading ? "opacity-0" : "opacity-100 transition-opacity"}>Continue with GitHub</span>
        {githubLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2">Connecting to GitHub...</span>
          </span>
        )}
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
