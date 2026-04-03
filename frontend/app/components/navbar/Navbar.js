"use client";

import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <span className="text-lg font-bold text-white drop-shadow-lg">
          ResumeX
        </span>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <a
            href="#home"
            className="text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            Home
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            Features
          </a>
          <a
            href="#cta"
            className="text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            CTA
          </a>
        </div>

        {/* Auth Button */}
        {user ? (
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              Dashboard
            </a>
            <button
              onClick={logout}
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="rounded-full bg-white/20 px-6 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/30 backdrop-blur-sm hover:backdrop-blur-md"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
