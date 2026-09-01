"use client";

import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { preload } from "react-dom";

import Hero from "./components/hero/Hero";
import PremiumFeatures from "./components/premium-features/PremiumFeatures";
import HowItWorks from "./components/how-it-works/HowItWorks";
import Comparison from "./components/comparison/Comparison";
import SharePreview from "./components/share-preview/SharePreview";
import FAQs from "./components/faqs/FAQs";
import CTA from "./components/cta/CTA";
import Footer from "./components/footer/Footer";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Preload critical navigation images during render
  preload('/login.webp', { as: 'image' });
  preload('/signup.webp', { as: 'image' });

  useEffect(() => {
    if (user && !loading) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <>
      {(loading || user) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-app)]">
          <div className="w-6 h-6 rounded-full border-3 border-[var(--border)] border-t-[var(--primary)] animate-spin" />
        </div>
      )}
      <div className={`min-h-[100dvh] flex flex-col bg-[var(--bg-app)] overflow-x-hidden ${(loading || user) ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}>
        <Hero />
        <PremiumFeatures />
        <SharePreview />
        <Comparison />
        <HowItWorks />
        <FAQs />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
