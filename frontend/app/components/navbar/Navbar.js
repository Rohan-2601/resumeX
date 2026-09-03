"use client";

import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, login, logout } = useAuth();

  const [authHoverStyle, setAuthHoverStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const authContainerRef = useRef(null);

  const handleAuthMouseEnter = (e) => {
    if (!authContainerRef.current) return;
    const { offsetLeft, offsetWidth } = e.currentTarget;
    setAuthHoverStyle({
      left: offsetLeft,
      width: offsetWidth,
      opacity: 1,
    });
  };

  const handleAuthMouseLeave = () => {
    setAuthHoverStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <span className="text-lg font-bold text-white drop-shadow-lg">
          resumeX
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
            href="#premium-features"
            className="text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            Premium Features
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
          <div
            ref={authContainerRef}
            onMouseLeave={handleAuthMouseLeave}
            className="relative flex items-center gap-2"
          >
            <a
              href="/login"
              onMouseEnter={handleAuthMouseEnter}
              className="relative z-10 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
            >
              Login
            </a>
            <a
              href="/register"
              onMouseEnter={handleAuthMouseEnter}
              className="relative z-10 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
            >
              Register
            </a>
            
            <div
              className="absolute bottom-1 h-[2px] bg-white rounded-full transition-all duration-300 ease-out"
              style={{
                left: `${authHoverStyle.left}px`,
                width: `${authHoverStyle.width}px`,
                opacity: authHoverStyle.opacity,
              }}
            />
          </div>
        )}
      </div>
    </nav>
  );
}
