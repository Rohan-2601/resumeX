"use client";

import { Syne } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Link from "next/link";

const headingFont = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function SiteHeader() {
  const router = useRouter();
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

  const goToLogin = () => {
    router.push("/login");
  };

  const goToRegister = () => {
    router.push("/register");
  };

  return (
    <header className="mx-auto w-full px-6 md:px-12 lg:px-16 flex justify-between items-center py-6 md:py-10 bg-transparent relative z-50">
      {/* Left Logo */}
      <div className="flex items-center">
        <Link href="/" className={`${headingFont.className} text-2xl md:text-3xl font-bold tracking-tighter text-[#15415C] hover:text-[#15415C]`}>
          resumeX
        </Link>
      </div>

      {/* Right Actions */}
      <div
        ref={authContainerRef}
        onMouseLeave={handleAuthMouseLeave}
        className="relative flex items-center gap-6"
      >
        <button
          onClick={goToRegister}
          onMouseEnter={handleAuthMouseEnter}
          className="relative z-10 hidden sm:block text-[15px] font-medium text-[#15415C] hover:text-[#15415C] transition-colors"
        >
          Register
        </button>
        <button
          onClick={goToLogin}
          onMouseEnter={handleAuthMouseEnter}
          className="relative z-10 text-[15px] font-medium text-[#15415C] hover:text-[#15415C] transition-colors"
        >
          Login
        </button>

        <div
          className="absolute -bottom-0.5 h-[2px] bg-[#15415C] rounded-full transition-all duration-300 ease-out pointer-events-none"
          style={{
            left: `${authHoverStyle.left}px`,
            width: `${authHoverStyle.width}px`,
            opacity: authHoverStyle.opacity,
          }}
        />
      </div>
    </header>
  );
}
