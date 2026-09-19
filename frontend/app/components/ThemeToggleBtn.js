"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { MoonIcon, SunIcon } from "./icons/Icons";

export default function ThemeToggleBtn() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-[#4B5E76] dark:text-[#a1a1aa] transition-colors hover:bg-black/10 dark:hover:bg-white/10"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
