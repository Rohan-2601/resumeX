"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ActivityIcon,
  FileTextIcon,
  LinkIcon,
  LogOutIcon,
} from "../components/icons/Icons";
import { Playfair_Display, Sora } from "next/font/google";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
  const { user, isInitializing, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isWorkspace = pathname?.includes("/dashboard/resumes/") && pathname.split("/").length > 3;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isInitializing && !user) {
      router.replace("/login");
    }
  }, [isInitializing, user, router, mounted]);

  // To prevent hydration mismatch, just return empty during SSR
  if (!mounted) {
    return (
      <div className={`${sansFont.className} flex min-h-[100dvh] items-center justify-center bg-[#fafafa]`} />
    );
  }

  // If we are done initializing and there's no user, we are redirecting. Don't render the shell.
  if (!isInitializing && !user) {
    return null;
  }

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
      className={`${sansFont.className} h-[100dvh] overflow-hidden bg-[#fafafa] text-[#0A2540] selection:bg-[#0A2540] selection:text-white relative`}
    >
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px] pointer-events-none" />

      <div className="flex h-[100dvh] relative z-10">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden h-full w-[280px] shrink-0 md:flex md:flex-col"
        >
          {/* Glass background for sidebar */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-0" />
          
          <div className="relative z-10 flex h-full flex-col px-6 py-8">
            <Link
              href="/dashboard"
              className="group mb-10 flex items-center rounded-xl px-1 py-1 no-underline transition-transform active:scale-95"
            >
              <span className="flex items-end text-[1.8rem] font-bold tracking-tight leading-none text-[#0A2540]">
                resume
                <motion.span
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className={`${displayFont.className} italic text-[#0A2540] drop-shadow-sm ml-0.5`}
                >
                  X
                </motion.span>
              </span>
            </Link>

            <nav className="flex flex-1 flex-col gap-2">
              <div className="px-2 pb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6B7280]">
                Main Menu
              </div>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "text-[#0A2540] hover:text-[#0A2540]"
                        : "text-[#4B5E76] hover:bg-black/5 hover:text-[#111827]"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-[#0A2540]/[0.06] rounded-xl z-0"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex opacity-90 transition-transform duration-300 group-hover:scale-105">
                      {item.icon}
                    </span>
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 pt-6 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0A2540]/10 to-transparent" />
              <div className="mb-4 flex items-center gap-3 px-2 rounded-xl py-2 transition-colors hover:bg-black/5">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                  {user ? (
                    <Image
                      src={user.avatar || "/default.webp"}
                      alt="Avatar"
                      width={44}
                      height={44}
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 animate-pulse" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {user ? (
                    <>
                      <div className="truncate text-sm font-bold text-[#0A2540]">
                        {user.name}
                      </div>
                      <div className="truncate text-[11px] font-medium text-[#6B7280]">
                        @{user.username}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-3.5 w-20 rounded-md bg-gray-200 animate-pulse" />
                      <div className="h-2.5 w-14 rounded-md bg-gray-100 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={logout}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-[#0A2540]/[0.08] bg-[#0A2540]/[0.03] px-3 py-2.5 text-sm font-medium text-[#4B5E76] transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 active:scale-[0.98]"
              >
                <span className="transition-transform group-hover:-translate-x-1">
                  <LogOutIcon />
                </span>
                Sign Out
              </button>
            </div>
          </div>
        </motion.aside>

        <main className="relative h-full flex-1 overflow-y-auto perspective-[1000px]">
          {/* Mobile Header */}
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl md:hidden shadow-sm"
          >
            <div className="px-5 pb-3 pt-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <Link href="/dashboard" className="no-underline">
                  <span className="flex items-end text-2xl font-bold tracking-tight leading-none text-[#0A2540]">
                    resume
                    <span
                      className={`${displayFont.className} italic text-[#0A2540] ml-0.5`}
                    >
                      X
                    </span>
                  </span>
                </Link>
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                  {user ? (
                    <Image
                      src={user.avatar || "/default.webp"}
                      alt="Avatar"
                      width={36}
                      height={36}
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 animate-pulse" />
                  )}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none]">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex min-w-[100px] flex-none items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? "text-[#0A2540] hover:text-[#0A2540]"
                          : "border border-white/60 bg-white/50 text-[#4B5E76] hover:text-[#111827]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="mobileNavIndicator"
                          className="absolute inset-0 rounded-xl bg-[#0A2540]/[0.06] z-0"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex">{item.icon}</span>
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.header>

          <div className="px-5 py-8 sm:px-8 md:px-12 md:py-10 lg:px-16 min-h-full">
            <motion.div 
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={isWorkspace ? "mx-auto max-w-[1400px]" : "mx-auto max-w-[1000px]"}
            >
              {isInitializing ? (
                <div className="space-y-6">
                  <div className="h-10 w-48 rounded-xl bg-black/5 animate-pulse" />
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="h-[220px] rounded-2xl border border-black/5 bg-white/50 animate-pulse shadow-sm" />
                    <div className="h-[220px] rounded-2xl border border-black/5 bg-white/50 animate-pulse shadow-sm" />
                    <div className="h-[220px] rounded-2xl border border-black/5 bg-white/50 animate-pulse shadow-sm" />
                  </div>
                </div>
              ) : (
                children
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
