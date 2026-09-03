"use client";

import { Syne, Outfit } from "next/font/google";
import { useRef, useState, useEffect } from "react";

const headingFont = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function TiltCard({ children, className, isCenter = false }) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translate3d(0, 0, 0)",
  });
  
  // Disable on touch devices or small screens
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    const checkTouch = () => {
      return ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    };
    setIsTouchDevice(checkTouch());
    
    const handleResize = () => {
      setIsTouchDevice(checkTouch());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchDevice || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = width / 2;
    const centerY = height / 2;
    
    // Normalize to -1 to 1
    const percentX = (mouseX - centerX) / centerX;
    const percentY = (mouseY - centerY) / centerY;

    // Keep it very subtle (max 3 degrees)
    const maxRot = isCenter ? 3.5 : 2.5; 
    const maxTranslate = isCenter ? 4 : 2;

    const rotateX = percentY * -maxRot; 
    const rotateY = percentX * maxRot;
    
    const translateX = percentX * maxTranslate;
    const translateY = percentY * maxTranslate;
    
    const scale = isCenter ? 1.02 : 1.01;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`,
      transition: "transform 0.1s ease-out",
      willChange: "transform",
      zIndex: isCenter ? 30 : 20
    });
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translate3d(0, 0, 0)",
      transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
      willChange: "transform",
      zIndex: isCenter ? 10 : 1
    });
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group ${className}`}
      style={style}
    >
      {children}
    </article>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={`${bodyFont.className} relative bg-[#fdfdfd] px-4 py-24 text-[#123F5B] sm:px-6 md:px-10 md:py-32 overflow-hidden`}
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center mb-16 md:mb-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#557083]">
            How It Works
          </p>
          <h2 className={`${headingFont.className} text-balance text-3xl font-bold leading-[1.02] tracking-tighter text-[#123F5B] sm:text-5xl md:text-6xl`}>
            FROM PDF TO ONE LINK.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-[#557083] md:text-lg md:leading-8">
            Three moves. That&apos;s it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-start pb-10">
          {/* Card 1 (Left) */}
          <TiltCard className="md:mt-16 bg-[#FFFFFF] border border-[#E5E7E3] rounded-none overflow-hidden flex flex-col h-[420px] lg:h-[460px] w-full shadow-[0_18px_50px_-34px_rgba(0,0,0,0.06)] transition-shadow duration-500 hover:shadow-[0_26px_60px_-34px_rgba(0,0,0,0.12)] relative">
            <div className="relative h-[65%] w-full overflow-hidden border-b border-[#E5E7E3]">
              <img
                src="/computer.webp"
                alt="Retro computer workstation"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="h-[35%] px-7 sm:px-8 flex flex-col justify-center bg-[#FFFFFF] relative z-10">
              <p className="text-[11px] font-bold tracking-widest text-[#557083] mb-2 uppercase">
                01 / MAKE
              </p>
              <h3 className={`${headingFont.className} text-2xl font-bold tracking-tighter text-[#123F5B]`}>
                MAKE IT.
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#557083] sm:text-[0.98rem] sm:leading-8">
                Build your resume your way.
              </p>
            </div>
          </TiltCard>

          {/* Card 2 (Center - Visually Dominant) */}
          <TiltCard isCenter className="bg-[#FFFFFF] border border-[#E5E7E3] rounded-none overflow-hidden flex flex-col h-[460px] lg:h-[520px] w-full shadow-[0_18px_50px_-34px_rgba(0,0,0,0.06)] transition-shadow duration-500 hover:shadow-[0_26px_60px_-34px_rgba(0,0,0,0.12)] z-10 md:-mt-8 relative">
            <div className="relative h-[70%] w-full overflow-hidden border-b border-[#E5E7E3]">
              <img
                src="/person.webp"
                alt="Digital person"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="h-[30%] px-7 sm:px-8 flex flex-col justify-center bg-[#FFFFFF] relative z-10">
              <p className="text-[11px] font-bold tracking-widest text-[#557083] mb-2 uppercase">
                02 / GET YOUR LINK
              </p>
              <h3 className={`${headingFont.className} text-2xl font-bold tracking-tighter text-[#123F5B]`}>
                GET YOUR LINK.
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#557083] sm:text-[0.98rem] sm:leading-8">
                One URL. Always current.
              </p>
            </div>
          </TiltCard>

          {/* Card 3 (Right) */}
          <TiltCard className="md:mt-16 bg-[#FFFFFF] border border-[#E5E7E3] rounded-none overflow-hidden flex flex-col h-[420px] lg:h-[460px] w-full shadow-[0_18px_50px_-34px_rgba(0,0,0,0.06)] transition-shadow duration-500 hover:shadow-[0_26px_60px_-34px_rgba(0,0,0,0.12)] relative">
            <div className="relative h-[65%] w-full overflow-hidden border-b border-[#E5E7E3]">
              <img
                src="/share.webp"
                alt="Paper airplane"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="h-[35%] px-7 sm:px-8 flex flex-col justify-center bg-[#FFFFFF] relative z-10">
              <p className="text-[11px] font-bold tracking-widest text-[#557083] mb-2 uppercase">
                03 / SHARE
              </p>
              <h3 className={`${headingFont.className} text-2xl font-bold tracking-tighter text-[#123F5B]`}>
                SHARE IT.
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#557083] sm:text-[0.98rem] sm:leading-8">
                Drop it anywhere.
              </p>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
