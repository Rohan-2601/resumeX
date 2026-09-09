"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const hasToken =
    typeof window !== "undefined" &&
    Boolean((localStorage.getItem("token") || "").trim());

  useEffect(() => {
    if (!loading && !user && !hasToken) {
      router.replace("/");
    }
  }, [loading, user, hasToken, router]);

  if (loading || (!user && hasToken))
    return (
      <div
        className={`${sansFont.className} flex min-h-[100dvh] items-center justify-center bg-[#f4f7f6] text-[#0A2540]`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-4 rounded-2xl border border-white/40 bg-white/60 px-8 py-5 text-sm font-medium text-[#4B5E76] shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl"
        >
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E5E7E3] border-t-[#0A2540]" />
          {loading ? "Loading" : "Restoring your session..."}
        </motion.div>
      </div>
    );

  if (!user) return null;

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
                  <Image
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                    alt="Avatar"
                    width={44}
                    height={44}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-[#0A2540]">
                    {user.name}
                  </div>
                  <div className="truncate text-[11px] font-medium text-[#6B7280]">
                    @{user.username}
                  </div>
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
                  <Image
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                    alt="Avatar"
                    width={36}
                    height={36}
                  />
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mx-auto mb-8 hidden max-w-[1000px] items-end justify-between md:flex"
            >
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#6B7280]"
                >
                  <span className="h-px w-6 bg-[#6B7280]/40"></span>
                  Overview
                </motion.div>
                <h1 className="text-[2rem] font-bold tracking-tight text-[#0A2540] flex items-center gap-3">
                  {activeItem.label}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#4B5E76] bg-white/60 border border-white/80 px-4 py-2 rounded-full backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                Workspace Active
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mx-auto max-w-[1000px]"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
