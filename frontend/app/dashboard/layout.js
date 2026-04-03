"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  ActivityIcon,
  FileTextIcon,
  LogOutIcon,
} from "../components/icons/Icons";
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

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading)
    return (
      <div
        className={`${sansFont.className} flex h-screen items-center justify-center bg-[#e9e1d0] text-[#1f1b16]`}
      >
        <div className="flex items-center gap-4 rounded-full border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.92)_0%,rgba(242,233,218,0.9)_100%)] px-6 py-4 text-sm font-medium text-[#5f5144] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.5)]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#d7c6aa] border-t-[#7b5a3d]" />
          Loading your workspace...
        </div>
      </div>
    );

  if (!user) {
    // We could auto-redirect, or show standard unauthorized
    return (
      <div
        className={`${sansFont.className} flex h-screen items-center justify-center bg-[#e9e1d0] px-4 text-[#1f1b16]`}
      >
        <div className="max-w-md rounded-[2rem] border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.92)_100%)] p-8 text-center shadow-[0_20px_70px_-44px_rgba(0,0,0,0.55)]">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-[#211911]">
            Access Denied
          </h2>
          <p className="mb-6 text-sm leading-7 text-[#5f5144]">
            You are not logged in. Please return to the home page to
            authenticate via GitHub.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[#241c16] px-5 py-3 text-sm font-semibold text-[#f6ebd7] transition hover:bg-[#17110c]"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Resumes", href: "/dashboard/resumes", icon: <FileTextIcon /> },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: <ActivityIcon />,
    },
  ];

  return (
    <div
      className={`${sansFont.className} flex min-h-screen bg-[#e9e1d0] text-[#1f1b16]`}
    >
      <aside className="sticky top-0 flex h-screen w-[300px] flex-col border-r border-black/10 bg-[linear-gradient(180deg,rgba(249,244,235,0.95)_0%,rgba(240,231,215,0.88)_100%)] px-5 py-6 shadow-[0_0_60px_-40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <Link
          href="/dashboard"
          className="mb-8 flex items-center gap-3 rounded-2xl px-1 py-2 no-underline"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#241c16] text-sm font-bold text-[#f6ebd7] shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9)]">
            X
          </div>
          <span className="text-2xl font-semibold tracking-tight text-[#211911]">
            resume
            <span className={`${displayFont.className} italic text-[#8a6340]`}>
              X
            </span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-2">
          <div className="px-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#7b5a3d]">
            Dashboard
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#241c16] text-[#fbf4e3] shadow-[0_14px_28px_-18px_rgba(0,0,0,0.9)]"
                    : "text-[#5f5144] hover:bg-white/45 hover:text-[#241c16]"
                }`}
              >
                <span className="flex opacity-90">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-black/10 pt-5">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/40 p-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                alt="Avatar"
                width={44}
                height={44}
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[#211911]">
                {user.name}
              </div>
              <div className="truncate text-xs text-[#6b5b4a]">
                @{user.username}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-[linear-gradient(180deg,rgba(251,247,238,0.95)_0%,rgba(242,233,218,0.92)_100%)] px-4 py-3 text-sm font-semibold text-[#5f5144] transition hover:bg-[#f9efe0] hover:text-[#241c16]"
          >
            <LogOutIcon />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-10 md:py-8 lg:px-12">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
