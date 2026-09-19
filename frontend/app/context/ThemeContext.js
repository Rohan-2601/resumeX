"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for saved theme on initial mount
    const savedTheme = localStorage.getItem("dashboard-theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to system preference
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isSystemDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("dashboard-theme", newTheme);
  };

  useEffect(() => {
    // Apply dark mode on dashboard and blog routes
    const isDarkModeEnabledPath = pathname?.startsWith("/dashboard") || pathname?.startsWith("/blog");
    
    if (isDarkModeEnabledPath && theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, pathname]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
