"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  ActivityIcon,
  FileTextIcon,
  LinkIcon,
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

  const navItems = [
    { label: "Resumes", href: "/dashboard/resumes", icon: <FileTextIcon /> },
    { label: "Links", href: "/dashboard/links", icon: <LinkIcon /> },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: <ActivityIcon />,
    },
  ];

  const activeItem =
    navItems.find(
      (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`),
    ) || navItems[0];

  return (
    <div
      className={`${sansFont.className} h-screen overflow-hidden bg-[#e9e1d0] text-[#1f1b16]`}
    >
      <div className="flex h-screen">
        <aside className="hidden h-full w-[280px] shrink-0 border-r border-black/10 bg-[linear-gradient(180deg,rgba(249,244,235,0.95)_0%,rgba(240,231,215,0.88)_100%)] px-5 py-6 md:flex md:flex-col">
          <Link
            href="/dashboard"
            className="mb-8 flex items-center rounded-xl px-1 py-1 no-underline"
          >
            <span className="flex items-end text-[1.7rem] font-semibold tracking-tight leading-none text-[#211911]">
              resume
              <span
                className={`${displayFont.className} italic text-[#8a6340]`}
              >
                X
              </span>
            </span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1.5">
            <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
              Dashboard
            </div>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "border-[#2a2119]/15 bg-[#241c16] text-[#f7ecda]"
                      : "border-transparent text-[#5f5144] hover:border-black/10 hover:bg-white/45 hover:text-[#241c16]"
                  }`}
                >
                  <span className="flex opacity-90">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-black/10 pt-4">
            <div className="mb-3 flex items-center gap-3 px-1">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                  alt="Avatar"
                  width={40}
                  height={40}
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold leading-tight text-[#211911]">
                  {user.name}
                </div>
                <div className="truncate text-xs text-[#6b5b4a]">
                  @{user.username}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-transparent px-3 py-2.5 text-sm font-semibold text-[#5f5144] transition hover:bg-white/45 hover:text-[#241c16]"
            >
              <LogOutIcon />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="relative h-full flex-1 overflow-y-auto">
          <header className="sticky top-0 z-30 border-b border-black/10 bg-[#ece3d1]/90 backdrop-blur md:hidden">
            <div className="px-4 pb-3 pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Link href="/dashboard" className="no-underline">
                  <span className="flex items-end text-2xl font-semibold tracking-tight leading-none text-[#211911]">
                    resume
                    <span
                      className={`${displayFont.className} italic text-[#8a6340]`}
                    >
                      X
                    </span>
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="rounded-xl border border-black/10 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5144]"
                >
                  Sign Out
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                        isActive
                          ? "border-[#2a2119]/15 bg-[#241c16] text-[#f7ecda]"
                          : "border-black/10 bg-white/45 text-[#5f5144]"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 md:px-10 md:py-8 lg:px-12">
            <div className="mx-auto mb-6 hidden max-w-7xl items-end justify-between border-b border-black/10 pb-4 md:flex">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b5a3d]">
                  Dashboard
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#211911]">
                  {activeItem.label}
                </h1>
              </div>
              <p className="text-sm text-[#6b5b4a]">@{user.username}</p>
            </div>

            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
